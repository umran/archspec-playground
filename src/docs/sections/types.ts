import type { ReactNode } from "react";

/**
 * One top-level section of the document.
 *
 * The registry in `./index.ts` is the single source of truth: the page
 * renders from it and the table of contents is derived from it, so a
 * section cannot exist without appearing in the navigation, and an entry
 * cannot point at a section nobody wrote. Adding, reordering, or
 * replacing a section is one entry and one file.
 */
export interface DocSection {
  id: string;
  title: string;
  /** One or two sentences under the heading. */
  lede?: ReactNode;
  /** Sub-headings, in document order. Each must match a `Sub` id in `Body`. */
  items: { id: string; title: string }[];
  /** The section's contents, without its own heading. */
  Body: () => ReactNode;
}
