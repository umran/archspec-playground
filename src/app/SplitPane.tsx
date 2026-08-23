import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { readStoredNumber, writeStored } from "./persist";

interface Props {
  top: ReactNode;
  bottom: ReactNode;
  /** Height of the top pane as a fraction of the container, 0–1. */
  initial?: number;
  min?: number;
  max?: number;
  storageKey?: string;
  label?: string;
}

/**
 * Two stacked panes with a draggable divider; the split persists across
 * visits.
 *
 * Vertical only. The horizontal split — the definition panel against the
 * visualization — is Kumo's `Sidebar`, which brings collapsing and a
 * resize handle of its own; this covers the one axis it does not.
 */
export function SplitPane({
  top,
  bottom,
  initial = 0.66,
  min = 0.2,
  max = 0.9,
  storageKey,
  label = "Resize panes",
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [fraction, setFraction] = useState(() =>
    storageKey ? readStoredNumber(storageKey, min, max, initial) : initial,
  );
  const [dragging, setDragging] = useState(false);

  const applyFromPointer = useCallback(
    (clientY: number) => {
      const rect = container.current?.getBoundingClientRect();
      if (!rect || rect.height === 0) return;
      setFraction(Math.min(max, Math.max(min, (clientY - rect.top) / rect.height)));
    },
    [min, max],
  );

  useEffect(() => {
    if (!dragging) return;

    const move = (event: PointerEvent) => {
      event.preventDefault();
      applyFromPointer(event.clientY);
    };
    const end = () => setDragging(false);

    document.body.classList.add("resizing", "resizing-row");
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);

    return () => {
      document.body.classList.remove("resizing", "resizing-row");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [dragging, applyFromPointer]);

  useEffect(() => {
    if (storageKey) writeStored(storageKey, String(fraction));
  }, [fraction, storageKey]);

  const nudge = (delta: number) => setFraction((f) => Math.min(max, Math.max(min, f + delta)));

  return (
    <div ref={container} className="flex h-full w-full min-h-0 min-w-0 flex-col">
      <div className="flex min-h-0 min-w-0 shrink-0 flex-col" style={{ height: `${fraction * 100}%` }}>
        {top}
      </div>
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label={label}
        aria-valuenow={Math.round(fraction * 100)}
        aria-valuemin={Math.round(min * 100)}
        aria-valuemax={Math.round(max * 100)}
        tabIndex={0}
        className={`split-handle h-px shrink-0 cursor-row-resize bg-kumo-hairline outline-none transition-colors focus-visible:bg-kumo-brand ${
          dragging ? "dragging" : ""
        }`}
        onPointerDown={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDoubleClick={() => setFraction(initial)}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            nudge(-0.02);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            nudge(0.02);
          } else if (event.key === "Home") {
            event.preventDefault();
            setFraction(initial);
          }
        }}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{bottom}</div>
    </div>
  );
}
