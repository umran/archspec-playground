import { useSidebar } from "@cloudflare/kumo/components/sidebar";
import { useCallback, useRef, type KeyboardEvent, type PointerEvent } from "react";

/**
 * The definition panel's resize handle: sizing only, never collapsing.
 *
 * Kumo's own `Sidebar.ResizeHandle` treats a drag past the minimum as an
 * intent to collapse, and one back past it as an intent to reopen. That
 * is right for a navigation rail, where the collapsed state is just the
 * small end of the same control. Here the panel holds an editor: shaving
 * the last few pixels off it is a sizing gesture, and having the whole
 * definition disappear mid-drag is a surprise rather than a shortcut.
 *
 * So this handle only ever sets a width. The clamp to `[minWidth,
 * maxWidth]` is the provider's own — the panel simply stops at its
 * minimum and stays there. Collapsing remains the header toggle's job,
 * where it is deliberate and reversible by the same button.
 *
 * Everything else follows Kumo's handle: the same hit area and hairline,
 * the same keyboard steps, and `setIsResizing` so the provider drops its
 * width transition while the pointer is down.
 */
const KEYBOARD_STEP = 10;

export function PanelResizeHandle() {
  const { side, resizable, width, minWidth, maxWidth, setWidth, setIsResizing } = useSidebar();
  const start = useRef({ x: 0, width: 0 });

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setIsResizing(true);
      start.current = { x: event.clientX, width };

      const onMove = (move: globalThis.PointerEvent) => {
        const delta = side === "left" ? move.clientX - start.current.x : start.current.x - move.clientX;
        setWidth(start.current.width + delta);
      };

      const onUp = () => {
        setIsResizing(false);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
    },
    [side, width, setWidth, setIsResizing],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const grow = side === "left" ? "ArrowRight" : "ArrowLeft";
      const shrink = side === "left" ? "ArrowLeft" : "ArrowRight";

      if (event.key === grow) setWidth(width + KEYBOARD_STEP);
      else if (event.key === shrink) setWidth(width - KEYBOARD_STEP);
      else if (event.key === "Home") setWidth(minWidth);
      else if (event.key === "End") setWidth(maxWidth);
      else return;

      event.preventDefault();
    },
    [side, width, minWidth, maxWidth, setWidth],
  );

  if (!resizable) return null;

  return (
    <button
      type="button"
      aria-label="Resize the definition panel"
      aria-orientation="vertical"
      role="separator"
      aria-valuenow={Math.round(width)}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      tabIndex={0}
      className={`absolute inset-y-0 z-2 hidden w-3 cursor-col-resize sm:block after:absolute after:inset-y-0 after:w-0.5 after:bg-transparent after:transition-colors hover:after:bg-kumo-hairline focus-visible:after:bg-kumo-hairline active:after:bg-kumo-hairline focus:outline-none ${
        side === "left" ? "right-0 after:right-0" : "left-0 after:left-0"
      }`}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    />
  );
}
