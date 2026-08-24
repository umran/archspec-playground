// The demo catalogue.
//
// Worked examples only: complete architectures that carry declared
// requirements the checker actually has something to say about. A
// fragment that parses but declares nothing teaches nothing here — the
// blank model is the place to start from nothing, and it starts from
// nothing entirely.
//
// The examples are imported from the vendored archspec tree rather than
// copied, so they track the DSL as it changes.

import flashCheckout from "../../vendor/archspec/tests/fixtures/flash_checkout.yaml?raw";
import videoStreaming from "../../vendor/archspec/tests/fixtures/video_streaming.yaml?raw";
import blank from "./models/blank.yaml?raw";

export interface CatalogEntry {
  id: string;
  title: string;
  /** One line for the picker. */
  blurb: string;
  /** What to look for once it is open. */
  notes: string[];
  /** Where the source comes from, shown above the editor. */
  path: string;
  source: string;
  /** How this entry exercises the checker. */
  expect: "proven" | "unknown" | "blank";
}

export const CATALOG: CatalogEntry[] = [
  {
    id: "flash_checkout",
    title: "Flash checkout",
    blurb: "Orders, inventory reservation, and card payments across three services — the canonical worked example.",
    notes: [
      "Six operations in three services share one topic; an external card charge and an order-lifecycle state machine round it out.",
      "The checker proves 10 obligations and leaves 6 unknown: the non-deduplicated, read-dependent tx.reserve_inventory is neither provably idempotent nor recoverable.",
      "Open the Obligations panel, filter to unknown, and follow the evidence into operation.reserve_inventory.",
    ],
    path: "tests/fixtures/flash_checkout.yaml",
    source: flashCheckout,
    expect: "unknown",
  },
  {
    id: "video_streaming",
    title: "Video streaming",
    blurb: "Upload, transcode, publish, and notify — a pipeline whose every verifiable obligation is proven.",
    notes: [
      "Four services, five operations, and two state machines (video and transcode-job lifecycles) driven through transitions.",
      "15 of 17 obligations are proven; the remaining two are object-history requirements, which the V1 checker does not attempt.",
      "Double-click operation.transcode_video in the system view to see its flows and the transactions that take machine transitions.",
    ],
    path: "tests/fixtures/video_streaming.yaml",
    source: videoStreaming,
    expect: "proven",
  },
  {
    id: "blank",
    title: "Blank model",
    blurb: "Nothing but the seven sections the DSL requires, each of them empty.",
    notes: [
      "Every top-level section is required, so the empty frame is the least a model can be and still parse.",
      "Declare a service, a schema, and an operation with an input and a flow, and the pipeline starts having something to check.",
      "Obligations appear only where a requirement is declared — until then the checker has nothing to prove.",
    ],
    path: "blank.yaml",
    source: blank,
    expect: "blank",
  },
];

export const DEFAULT_ENTRY = CATALOG[0];

export function catalogEntry(id: string | null | undefined): CatalogEntry | undefined {
  return CATALOG.find((entry) => entry.id === id);
}
