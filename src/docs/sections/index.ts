import { artifacts } from "./artifacts";
import { dispatch } from "./dispatch";
import { distinctions } from "./distinctions";
import { effects } from "./effects";
import { keys } from "./keys";
import { model } from "./model";
import { operations } from "./operations";
import { orientation } from "./orientation";
import { replay } from "./replay";
import { report } from "./report";
import { requirements } from "./requirements";
import { stateMachines } from "./stateMachines";
import { transactions } from "./transactions";
import type { DocSection } from "./types";

export type { DocSection };

/**
 * The document, in order.
 *
 * This list is the whole contents: the page renders from it and the
 * table of contents is derived from it, so neither can drift from the
 * other. To rewrite a section, replace one file; to reorder or add one,
 * move or add a line here.
 *
 * The order runs from what a declaration means, through the things a
 * model is made of, to the obligations over them and how the checker
 * discharges them — so that by the time a requirement names a
 * transition, an artifact, or a lane, all three have been defined.
 */
export const SECTIONS: DocSection[] = [
  orientation,
  model,
  operations,
  dispatch,
  stateMachines,
  transactions,
  artifacts,
  effects,
  keys,
  requirements,
  replay,
  distinctions,
  report,
];
