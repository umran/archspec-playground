// The page's handle on the analysis worker.
//
// Requests are latest-wins *within a kind*: while one runs, newer
// analyses replace each other, so a burst of keystrokes costs at most one
// extra run — but a queued analysis and a queued canonicalization never
// evict each other, since they answer different questions. A worker lost
// to a Rust panic is replaced transparently and the queue re-sent to the
// replacement; a worker that cannot start at all is not replaced forever.

import type { WorkerRequest, WorkerResponse } from "./protocol";
import type { Analysis } from "./types";

export interface AnalysisOutcome {
  analysis: Analysis;
  /** Time spent inside the WebAssembly call. */
  wasmMs: number;
  /** Wall-clock time from request to result, including queueing. */
  totalMs: number;
}

type RequestKind = WorkerRequest["type"];

interface Pending<T> {
  request: WorkerRequest;
  started: number;
  resolve: (value: T | null) => void;
  reject: (error: Error) => void;
}

type Listener = () => void;

/**
 * How many times a worker may be replaced before the client gives up.
 * A panic is recoverable and rare; a worker whose *script* will not load
 * fails identically every time, and replacing it in a loop would spin
 * the tab fetching a module that is not there.
 */
const MAX_REPLACEMENTS = 3;

export class AnalysisClient {
  private worker!: Worker;
  private seq = 0;
  private inflight: Pending<unknown> | null = null;
  private queued = new Map<RequestKind, Pending<unknown>>();
  private listeners = new Set<Listener>();
  private replacements = 0;

  /** The worker has loaded the WebAssembly module. */
  ready = false;
  /** Set when the module — or the worker itself — cannot be loaded. */
  bootError: string | null = null;

  constructor() {
    this.spawn();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Analyzes `source`. Resolves to null when a newer analysis superseded
   * this one before it was sent.
   */
  analyze(source: string, title: string, verify: boolean): Promise<AnalysisOutcome | null> {
    return this.submit<AnalysisOutcome>({ type: "analyze", id: ++this.seq, source, title, verify });
  }

  /** The canonical serialization of `source`, or null if superseded / unparsable. */
  canonicalize(source: string): Promise<string | null> {
    return this.submit<string>({ type: "canonicalize", id: ++this.seq, source });
  }

  private submit<T>(request: WorkerRequest): Promise<T | null> {
    return new Promise<T | null>((resolve, reject) => {
      const pending: Pending<T> = { request, started: performance.now(), resolve, reject };

      if (this.bootError) {
        reject(new Error(this.bootError));
        return;
      }

      if (this.inflight) {
        // Latest wins, but only against a request of the same kind.
        this.queued.get(request.type)?.resolve(null);
        this.queued.set(request.type, pending as Pending<unknown>);
        return;
      }

      this.send(pending as Pending<unknown>);
    });
  }

  private send(pending: Pending<unknown>) {
    this.inflight = pending;
    pending.started = performance.now();
    this.worker.postMessage(pending.request);
    this.notify();
  }

  private spawn() {
    this.worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => this.receive(event.data);
    this.worker.onerror = (event) => {
      event.preventDefault();
      this.crash(event.message || "the analysis worker could not be started");
    };
  }

  private receive(message: WorkerResponse) {
    switch (message.type) {
      case "ready":
        this.ready = true;
        this.bootError = null;
        // A worker that reached `ready` proves the failure was transient,
        // so the next panic gets a fresh budget of replacements.
        this.replacements = 0;
        this.notify();
        return;
      case "boot-failed":
        // Loading the module again would fail the same way.
        this.bootError = message.message;
        this.ready = false;
        this.failAll(message.message);
        this.notify();
        return;
      case "result": {
        const pending = this.take(message.id);
        if (!pending) return;
        try {
          const analysis = JSON.parse(message.json) as Analysis;
          pending.resolve({
            analysis,
            wasmMs: message.wasmMs,
            totalMs: performance.now() - pending.started,
          });
        } catch (error) {
          pending.reject(error instanceof Error ? error : new Error(String(error)));
        }
        break;
      }
      case "canonical": {
        const pending = this.take(message.id);
        pending?.resolve(message.yaml || null);
        break;
      }
      case "failed": {
        const pending = this.take(message.id);
        pending?.reject(new Error(message.message));
        if (message.fatal) this.replaceWorker();
        break;
      }
    }
    this.drain();
  }

  private take(id: number): Pending<unknown> | null {
    const pending = this.inflight;
    if (!pending || pending.request.id !== id) return null;
    this.inflight = null;
    return pending;
  }

  private drain() {
    if (this.inflight) {
      this.notify();
      return;
    }
    const [kind, next] = this.queued.entries().next().value ?? [];
    if (!kind || !next) {
      this.notify();
      return;
    }
    this.queued.delete(kind);
    this.send(next);
  }

  private crash(message: string) {
    const pending = this.inflight;
    this.inflight = null;
    pending?.reject(new Error(message));
    this.replaceWorker(message);
    this.drain();
  }

  /**
   * Replaces the worker, unless it has already been replaced too many
   * times without one ever becoming ready — that is a worker that cannot
   * start, not one that died, and retrying only spins.
   */
  private replaceWorker(reason = "the analysis worker keeps failing to start") {
    this.worker.terminate();
    this.ready = false;

    if (++this.replacements > MAX_REPLACEMENTS) {
      this.bootError = reason;
      this.failAll(reason);
      this.notify();
      return;
    }

    this.spawn();
    // The module is loading again: subscribers show that rather than
    // reporting a module that is ready when none is.
    this.notify();
  }

  /** Rejects everything waiting; nothing will ever run it. */
  private failAll(message: string) {
    const pending = this.inflight;
    this.inflight = null;
    pending?.reject(new Error(message));

    for (const waiting of this.queued.values()) waiting.reject(new Error(message));
    this.queued.clear();
  }

  /** True while a request is in flight or waiting. */
  get busy(): boolean {
    return this.inflight !== null || this.queued.size > 0;
  }

  private notify() {
    for (const listener of this.listeners) listener();
  }
}

let shared: AnalysisClient | null = null;

/** The page-wide client; the worker is spawned on first use. */
export function analysisClient(): AnalysisClient {
  return (shared ??= new AnalysisClient());
}
