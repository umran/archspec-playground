// A CodeMirror theme expressed in Kumo's design tokens. The tokens swap
// with `data-mode` on the document root, so one theme serves both modes
// and follows the viz's own toggle without re-configuring the editor.

import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

const editorTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--color-kumo-base)",
    color: "var(--text-color-kumo-default)",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-content": {
    caretColor: "var(--text-color-kumo-default)",
    padding: "8px 0",
  },
  ".cm-line": { padding: "0 12px 0 6px" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--text-color-kumo-default)" },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    { backgroundColor: "var(--ed-selection)" },
  ".cm-activeLine": { backgroundColor: "var(--ed-active-line)" },
  ".cm-activeLineGutter": { backgroundColor: "var(--ed-active-line)" },
  ".cm-gutters": {
    backgroundColor: "var(--color-kumo-base)",
    color: "var(--text-color-kumo-inactive)",
    border: "none",
    borderRight: "1px solid var(--color-kumo-hairline)",
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 6px 0 14px", minWidth: "2.5rem" },
  ".cm-foldGutter .cm-gutterElement": { padding: "0 4px", color: "var(--text-color-kumo-inactive)" },
  ".cm-foldPlaceholder": {
    backgroundColor: "var(--color-kumo-tint)",
    border: "1px solid var(--color-kumo-line)",
    color: "var(--text-color-kumo-subtle)",
  },
  ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
    backgroundColor: "color-mix(in srgb, var(--color-kumo-brand) 18%, transparent)",
    outline: "1px solid color-mix(in srgb, var(--color-kumo-brand) 50%, transparent)",
  },
  ".cm-selectionMatch": { backgroundColor: "color-mix(in srgb, var(--color-kumo-brand) 14%, transparent)" },
  ".cm-searchMatch": {
    backgroundColor: "color-mix(in srgb, var(--color-kumo-warning) 30%, transparent)",
    outline: "1px solid color-mix(in srgb, var(--color-kumo-warning) 60%, transparent)",
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "color-mix(in srgb, var(--color-kumo-warning) 55%, transparent)",
  },
  ".cm-panels": {
    backgroundColor: "var(--color-kumo-elevated)",
    color: "var(--text-color-kumo-default)",
  },
  ".cm-panels.cm-panels-bottom": { borderTop: "1px solid var(--color-kumo-hairline)" },
  ".cm-panels.cm-panels-top": { borderBottom: "1px solid var(--color-kumo-hairline)" },
  ".cm-panel.cm-search input, .cm-panel.cm-search button, .cm-panel.cm-search label": {
    fontSize: "12px",
  },
  ".cm-panel.cm-search input": {
    backgroundColor: "var(--color-kumo-base)",
    color: "var(--text-color-kumo-default)",
    border: "1px solid var(--color-kumo-line)",
    borderRadius: "4px",
  },
  ".cm-panel.cm-search button": {
    backgroundColor: "var(--color-kumo-tint)",
    color: "var(--text-color-kumo-default)",
    border: "1px solid var(--color-kumo-line)",
    borderRadius: "4px",
    backgroundImage: "none",
  },
  ".cm-gutter.cm-gutter-lint": { width: "1.1rem" },
  ".cm-lint-marker": { width: "0.8rem", height: "0.8rem" },
});

const highlight = HighlightStyle.define([
  { tag: tags.definition(tags.propertyName), color: "var(--ed-key)" },
  { tag: tags.keyword, color: "var(--ed-keyword)" },
  { tag: tags.string, color: "var(--ed-string)" },
  { tag: tags.special(tags.string), color: "var(--ed-string)", fontStyle: "italic" },
  { tag: tags.content, color: "var(--text-color-kumo-default)" },
  { tag: tags.lineComment, color: "var(--ed-comment)", fontStyle: "italic" },
  { tag: tags.separator, color: "var(--ed-punct)" },
  { tag: tags.punctuation, color: "var(--ed-punct)" },
  { tag: tags.squareBracket, color: "var(--ed-punct)" },
  { tag: tags.brace, color: "var(--ed-punct)" },
  { tag: tags.labelName, color: "var(--ed-number)" },
  { tag: tags.typeName, color: "var(--ed-number)" },
  { tag: tags.meta, color: "var(--ed-comment)" },
  { tag: tags.attributeValue, color: "var(--ed-string)" },
]);

export const kumoEditorTheme = [editorTheme, syntaxHighlighting(highlight)];
