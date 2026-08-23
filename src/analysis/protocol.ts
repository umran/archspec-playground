// Messages between the page and the analysis worker.

export interface AnalyzeRequest {
  type: "analyze";
  id: number;
  source: string;
  title: string;
  verify: boolean;
}

export interface CanonicalizeRequest {
  type: "canonicalize";
  id: number;
  source: string;
}

export type WorkerRequest = AnalyzeRequest | CanonicalizeRequest;

export type WorkerResponse =
  | { type: "ready" }
  | { type: "result"; id: number; json: string; wasmMs: number }
  | { type: "canonical"; id: number; yaml: string }
  | { type: "failed"; id: number; message: string; fatal: boolean }
  | { type: "boot-failed"; message: string };
