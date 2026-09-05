import { useEffect, useRef, useState } from "react";

import { analysisClient, type AnalysisOutcome } from "./client";
import type { Analysis, PageData } from "./types";

export interface AnalysisState {
  /** The worker is still loading the WebAssembly module. */
  booting: boolean;
  /** A request is pending for the current source. */
  working: boolean;
  /** Latest completed analysis. */
  analysis: Analysis | null;
  /** The most recent page data that parsed — survives transient syntax errors. */
  page: PageData | null;
  timing: { wasmMs: number; totalMs: number } | null;
  /** A fatal failure (a panic, a worker crash); the next edit retries. */
  failure: string | null;
  /** The module could not be loaded at all. */
  bootError: string | null;
}

const INITIAL: AnalysisState = {
  booting: true,
  working: false,
  analysis: null,
  page: null,
  timing: null,
  failure: null,
  bootError: null,
};

export interface AnalysisOptions {
  /**
   * Identifies the model under analysis. While it holds, the last page
   * data that parsed is kept across transient syntax errors so the
   * visualization does not blink away mid-keystroke. When it changes —
   * a different model is opened — the retained data is dropped, because
   * showing another model's graph would misrepresent what is loaded.
   */
  resetKey?: string;
  debounceMs?: number;
}

/**
 * Runs the conseqa pipeline over `source` as it changes, debounced, and
 * exposes the latest outcome. Results arriving for superseded sources
 * are discarded, so the state never regresses to an older edit.
 */
export function useAnalysis(
  source: string,
  title: string,
  verify: boolean,
  { resetKey, debounceMs = 200 }: AnalysisOptions = {},
): AnalysisState {
  const [state, setState] = useState<AnalysisState>(INITIAL);
  const latest = useRef(0);
  const cleared = useRef<string | undefined>(resetKey);

  if (cleared.current !== resetKey) {
    cleared.current = resetKey;
    // Invalidate here rather than in the effect below: React schedules
    // passive effects on a later task, and a result for the model just
    // closed could land in between. Its ticket must already be stale, or
    // the retention below would republish the previous model's graph.
    latest.current++;
    // Render-phase reset: the stale page must not reach the DOM even for
    // the frame between opening a model and its first analysis.
    setState((s) => ({ ...s, analysis: null, page: null, timing: null, failure: null }));
  }

  useEffect(() => {
    const client = analysisClient();
    const sync = () =>
      setState((s) => ({ ...s, booting: !client.ready && !client.bootError, bootError: client.bootError }));
    sync();
    return client.subscribe(sync);
  }, []);

  useEffect(() => {
    const ticket = ++latest.current;
    setState((s) => ({ ...s, working: true }));

    const timer = window.setTimeout(() => {
      analysisClient()
        .analyze(source, title, verify)
        .then(
          (outcome: AnalysisOutcome | null) => {
            if (ticket !== latest.current) return;
            if (!outcome) {
              // Dropped without a newer request to replace it: nothing
              // else will arrive, so stop reporting work in progress.
              setState((s) => ({ ...s, working: false }));
              return;
            }
            setState((s) => ({
              ...s,
              working: false,
              failure: null,
              analysis: outcome.analysis,
              page: outcome.analysis.page ?? s.page,
              timing: { wasmMs: outcome.wasmMs, totalMs: outcome.totalMs },
            }));
          },
          (error: Error) => {
            if (ticket !== latest.current) return;
            setState((s) => ({ ...s, working: false, failure: error.message }));
          },
        );
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [source, title, verify, debounceMs, resetKey]);

  return state;
}
