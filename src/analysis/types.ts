// Mirror of the JSON `archspec_wasm::analyze` returns (see wasm/src/lib.rs).

import type { PageData } from "../../vendor/archspec/viz/src/types/page";

export type { PageData };

export interface ParseError {
  message: string;
  /** 1-based line and column, 0-based byte index, when known. */
  line: number | null;
  column: number | null;
  index: number | null;
}

export interface Evidence {
  subject: string | null;
  message: string;
}

export type Severity = "error" | "warning" | "note";

export interface Diagnostic {
  phase: "validation" | "verification";
  /** The analyzer's diagnostic code, e.g. `UnknownReference`. */
  code: string;
  severity: Severity;
  subject: string | null;
  message: string;
  evidence: Evidence[];
}

export interface Tally {
  proven: number;
  disproven: number;
  unknown: number;
  total: number;
}

export interface Analysis {
  /** Page data for the visualization; null when the source does not parse. */
  page: PageData | null;
  parse_error: ParseError | null;
  diagnostics: Diagnostic[];
  /** The model parsed and passed validation. */
  valid: boolean;
  /** The model checker ran: requires a valid model and verification enabled. */
  verified: boolean;
  tally: Tally | null;
}
