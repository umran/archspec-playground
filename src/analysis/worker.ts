/// <reference lib="webworker" />

// The analysis worker: hosts the conseqa WebAssembly module and runs the
// pipeline off the main thread so the editor stays responsive however
// large the model. One request is processed at a time; the client
// coalesces bursts of edits so the worker never falls behind.

import init, { analyze, canonicalize } from "../../wasm/pkg/conseqa.js";
import wasmUrl from "../../wasm/pkg/conseqa_bg.wasm?url";

import type { WorkerRequest, WorkerResponse } from "./protocol";

declare const self: DedicatedWorkerGlobalScope;

const post = (message: WorkerResponse) => self.postMessage(message);

// A Rust panic is reported through `console.error` by the panic hook
// just before the trap reaches JavaScript; keep the last message so the
// failure the page shows names the cause rather than `unreachable`.
let lastConsoleError = "";
const originalError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  lastConsoleError = args.map(String).join(" ");
  originalError(...args);
};

const booted = init({ module_or_path: wasmUrl }).then(
  () => {
    post({ type: "ready" });
    return true;
  },
  (error: unknown) => {
    post({ type: "boot-failed", message: describe(error) });
    return false;
  },
);

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  if (!(await booted)) {
    // Not fatal in the client's sense: replacing this worker would only
    // load the same module from the same URL and fail the same way. The
    // `boot-failed` message it already has is what the page reports.
    post({ type: "failed", id: request.id, message: "conseqa failed to load", fatal: false });
    return;
  }

  // Scope the capture to this call, so an unrelated message logged
  // earlier cannot be reported as this request's panic.
  lastConsoleError = "";

  try {
    switch (request.type) {
      case "analyze": {
        const started = performance.now();
        const json = analyze(request.source, request.title, request.verify);
        post({ type: "result", id: request.id, json, wasmMs: performance.now() - started });
        break;
      }
      case "canonicalize": {
        post({ type: "canonical", id: request.id, yaml: canonicalize(request.source) });
        break;
      }
    }
  } catch (error) {
    // A trap leaves the instance unusable and wasm-bindgen's glue will
    // not re-initialise it; the client replaces the whole worker.
    const panic = lastConsoleError;
    lastConsoleError = "";
    post({
      type: "failed",
      id: request.id,
      message: panic ? `conseqa panicked: ${panic}` : describe(error),
      fatal: true,
    });
  }
};

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
