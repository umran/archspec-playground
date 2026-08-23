import { useCallback, useSyncExternalStore } from "react";

/** Tracks a CSS media query. */
export function useMediaQuery(query: string): boolean {
  // Both callbacks are memoized on the query: an inline `subscribe`
  // changes identity every render, and `useSyncExternalStore` would tear
  // the listener down and build a new `MediaQueryList` on each keystroke.
  const subscribe = useCallback(
    (listener: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", listener);
      return () => list.removeEventListener("change", listener);
    },
    [query],
  );

  const snapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, snapshot, () => false);
}
