import { useCallback, useSyncExternalStore } from "react";

export type View = "playground" | "docs";

/**
 * Which of the two pages is showing, carried in `?view`.
 *
 * The query, not the fragment: in the playground the fragment belongs to
 * the visualization's own router, and a page switch has to survive
 * whatever route it left behind there.
 */
function read(): View {
  return new URLSearchParams(window.location.search).get("view") === "docs" ? "docs" : "playground";
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

export function useView(): [View, (next: View) => void] {
  const view = useSyncExternalStore(subscribe, read, () => "playground" as View);

  const setView = useCallback((next: View) => {
    const url = new URL(window.location.href);
    if (next === "docs") {
      url.searchParams.set("view", "docs");
      url.hash = "";
    } else {
      url.searchParams.delete("view");
      // The visualization reads the fragment on mount; leaving a
      // document anchor there would land it on no route at all.
      url.hash = "#/system";
    }
    window.history.pushState(null, "", url);
    for (const listener of listeners) listener();
  }, []);

  return [view, setView];
}
