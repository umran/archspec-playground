// The demo catalog: archspec's own example models, imported from the
// vendored source tree so they track the DSL as it evolves, plus a blank
// model to start from.

import scratch from "./models/scratch.yaml?raw";
import flashCheckout from "../../vendor/archspec/tests/fixtures/flash_checkout.yaml?raw";
import invalidServiceKind from "../../vendor/archspec/tests/fixtures/invalid_service_kind.yaml?raw";
import keyedTopic from "../../vendor/archspec/tests/fixtures/keyed_topic.yaml?raw";
import minimal from "../../vendor/archspec/tests/fixtures/minimal.yaml?raw";
import videoStreaming from "../../vendor/archspec/tests/fixtures/video_streaming.yaml?raw";

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
  /** How this entry exercises the pipeline. */
  expect: "proven" | "unknown" | "invalid" | "parse-error" | "trivial";
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
    id: "keyed_topic",
    title: "Keyed topic",
    blurb: "A topic with keyed ordering and keyed message identity, and a schema fragment that projects the key.",
    notes: [
      "No operations yet — a good starting point for adding a publisher and a subscriber by hand.",
      "Try changing the ordering kind to `unordered` or removing the fragment to watch validation react.",
    ],
    path: "tests/fixtures/keyed_topic.yaml",
    source: keyedTopic,
    expect: "trivial",
  },
  {
    id: "minimal",
    title: "Minimal",
    blurb: "The smallest model that parses and validates: one service, one schema, one topic.",
    notes: [
      "Every top-level section the DSL requires is present, most of them empty.",
      "Rename `OrderCreated` in the topic's message list to see an unknown-reference validation error.",
    ],
    path: "tests/fixtures/minimal.yaml",
    source: minimal,
    expect: "trivial",
  },
  {
    id: "invalid_service_kind",
    title: "Parse failure",
    blurb: "A model the parser rejects: an unknown service kind.",
    notes: [
      "The parser reports the offending line and column and the variants it would accept; the visualization keeps showing the last model that parsed.",
      "Fix the kind (backend, frontend, worker, or job) and the model becomes valid.",
    ],
    path: "tests/fixtures/invalid_service_kind.yaml",
    source: invalidServiceKind,
    expect: "parse-error",
  },
  {
    id: "scratch",
    title: "Start from scratch",
    blurb: "A blank model with one service, one schema, and one topic — and comments describing each section.",
    notes: [
      "Every top-level section the DSL requires is present, so the model parses from the first keystroke.",
      "Add an operation with an input, a transaction, and a requirement, and the checker starts producing obligations.",
      "Nothing is verified yet: obligations exist only where a requirement is declared.",
    ],
    path: "scratch.yaml",
    source: scratch,
    expect: "trivial",
  },
];

export const DEFAULT_ENTRY = CATALOG[0];

export function catalogEntry(id: string | null | undefined): CatalogEntry | undefined {
  return CATALOG.find((entry) => entry.id === id);
}
