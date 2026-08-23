import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { yaml } from "@codemirror/lang-yaml";
import { bracketMatching, foldGutter, foldKeymap, indentOnInput, indentUnit } from "@codemirror/language";
import { lintGutter, lintKeymap, setDiagnostics, type Diagnostic as LintDiagnostic } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from "@codemirror/view";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { locateId } from "./locate";
import { kumoEditorTheme } from "./theme";

export interface YamlEditorHandle {
  /** Scrolls to and selects the declaration of a model id. */
  revealId: (id: string) => boolean;
  /** Scrolls to and selects a character range. */
  reveal: (from: number, to: number) => void;
  focus: () => void;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  diagnostics: LintDiagnostic[];
}

/** A YAML editor on CodeMirror 6, themed with Kumo tokens. */
export const YamlEditor = forwardRef<YamlEditorHandle, Props>(function YamlEditor(
  { value, onChange, diagnostics },
  ref,
) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!host.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        bracketMatching(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        lintGutter(),
        indentUnit.of("  "),
        EditorState.tabSize.of(2),
        keymap.of([...defaultKeymap, ...searchKeymap, ...historyKeymap, ...foldKeymap, ...lintKeymap, indentWithTab]),
        yaml(),
        kumoEditorTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
      ],
    });

    const editor = new EditorView({ state, parent: host.current });
    view.current = editor;

    return () => {
      editor.destroy();
      view.current = null;
    };
    // The editor owns its document after mount; `value` is reconciled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External replacement (catalog switch, reset): replace the whole doc
  // only when it actually differs, so typing never fights the editor.
  useEffect(() => {
    const editor = view.current;
    if (!editor) return;
    const current = editor.state.doc.toString();
    if (current === value) return;
    editor.dispatch({
      changes: { from: 0, to: current.length, insert: value },
      selection: { anchor: 0 },
      scrollIntoView: true,
    });
  }, [value]);

  useEffect(() => {
    const editor = view.current;
    if (!editor) return;
    const length = editor.state.doc.length;
    const clamped = diagnostics
      .filter((d) => d.from <= length)
      .map((d) => ({ ...d, to: Math.min(d.to, length) }));
    editor.dispatch(setDiagnostics(editor.state, clamped));
  }, [diagnostics]);

  useImperativeHandle(
    ref,
    () => ({
      reveal(from, to) {
        const editor = view.current;
        if (!editor) return;
        const length = editor.state.doc.length;
        const anchor = Math.min(from, length);
        const head = Math.min(to, length);
        editor.dispatch({
          selection: { anchor, head },
          effects: EditorView.scrollIntoView(anchor, { y: "center" }),
        });
        editor.focus();
      },
      revealId(id) {
        const editor = view.current;
        if (!editor) return false;
        const range = locateId(editor.state.doc.toString(), id);
        if (!range) return false;
        this.reveal(range.from, range.to);
        return true;
      },
      focus() {
        view.current?.focus();
      },
    }),
    [],
  );

  return <div ref={host} className="h-full min-h-0 overflow-hidden" />;
});
