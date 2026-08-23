// Small preferences kept in this browser: the split, the open panel, the
// last model. Reading and writing are both guarded — `localStorage`
// throws where it is blocked, in Safari's private mode and in sandboxed
// frames, and none of these are worth failing a render over.

export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Blocked or full; preferences are a convenience.
  }
}

export function clearStored(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // As above.
  }
}

/** A stored number within `[min, max]`, or `fallback`. */
export function readStoredNumber(key: string, min: number, max: number, fallback: number): number {
  const value = Number(readStored(key));
  return Number.isFinite(value) && value >= min && value <= max ? value : fallback;
}

/** A stored boolean, or `fallback` when unset. */
export function readStoredBoolean(key: string, fallback: boolean): boolean {
  const value = readStored(key);
  return value === null ? fallback : value === "true";
}
