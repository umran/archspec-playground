import { useCallback, useEffect, useRef, useState } from "react";

import { DEFAULT_ENTRY, catalogEntry, type CatalogEntry } from "../catalog";

const DRAFT_PREFIX = "archspec-playground-draft:";
const LAST_KEY = "archspec-playground-model";

/** Which model the URL asks for; the hash belongs to the visualization. */
function requestedId(): string | null {
  return new URLSearchParams(window.location.search).get("model");
}

function storedDraft(id: string): string | null {
  try {
    return window.localStorage.getItem(DRAFT_PREFIX + id);
  } catch {
    return null;
  }
}

function initialEntry(): CatalogEntry {
  const fromUrl = catalogEntry(requestedId());
  if (fromUrl) return fromUrl;
  try {
    return catalogEntry(window.localStorage.getItem(LAST_KEY)) ?? DEFAULT_ENTRY;
  } catch {
    return DEFAULT_ENTRY;
  }
}

export interface Draft {
  entry: CatalogEntry;
  source: string;
  dirty: boolean;
  setSource: (next: string) => void;
  /** Loads a catalog entry, restoring any edits made to it before. */
  open: (entry: CatalogEntry) => void;
  /** Restores the pristine source of the open entry. */
  reset: () => void;
}

/**
 * The model under edit. Edits are kept per catalog entry in this
 * browser, so switching between examples and coming back does not
 * discard work, and the address bar names the open model.
 */
export function useDraft(): Draft {
  const [entry, setEntry] = useState<CatalogEntry>(initialEntry);
  const [source, setSource] = useState<string>(() => {
    const start = initialEntry();
    return storedDraft(start.id) ?? start.source;
  });

  // Persisting on every keystroke is wasteful; a short idle is enough to
  // survive a reload without writing on each character.
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        if (source === entry.source) window.localStorage.removeItem(DRAFT_PREFIX + entry.id);
        else window.localStorage.setItem(DRAFT_PREFIX + entry.id, source);
      } catch {
        // Storage may be unavailable or full; drafts are a convenience.
      }
    }, 400);
    return () => window.clearTimeout(timer.current);
  }, [source, entry]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LAST_KEY, entry.id);
    } catch {
      // Not fatal.
    }
    const url = new URL(window.location.href);
    if (url.searchParams.get("model") !== entry.id) {
      url.searchParams.set("model", entry.id);
      window.history.replaceState(null, "", url);
    }
  }, [entry]);

  // The open entry, readable from the listener below without making it
  // depend on — and re-subscribe for — every change.
  const openEntry = useRef(entry);
  useEffect(() => {
    openEntry.current = entry;
  }, [entry]);

  // The browser's own back and forward buttons change the query too.
  useEffect(() => {
    const onPopState = () => {
      const next = catalogEntry(requestedId());
      if (!next || next.id === openEntry.current.id) return;
      setEntry(next);
      setSource(storedDraft(next.id) ?? next.source);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const open = useCallback((next: CatalogEntry) => {
    setEntry(next);
    setSource(storedDraft(next.id) ?? next.source);
    // A different model makes the current route meaningless.
    window.location.hash = "#/system";
  }, []);

  const reset = useCallback(() => {
    setSource(entry.source);
  }, [entry]);

  return { entry, source, dirty: source !== entry.source, setSource, open, reset };
}
