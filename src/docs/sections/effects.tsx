import { Callout, Code, P, Sub, Terms } from "../parts";
import type { DocSection } from "./types";

export const effects: DocSection = {
  id: "effects",
  title: "Effects and duplicate safety",
  lede: "An effect is a capability the operation declares; a flow step executing it is what makes an invocation perform it. Whether a duplicate execution is safe is decided per effect kind — and, for two of the three kinds, by following the work into other operations.",
  items: [
    { id: "effect-kinds", title: "The three effect kinds" },
    { id: "cascade", title: "The cascade" },
  ],
  Body: () => (
    <>
      <Sub id="effect-kinds" title="The three effect kinds">
        <Terms
          rows={[
            {
              term: "publication",
              kind: "structure",
              body: (
                <>
                  Sends a message to a topic. Duplicate-safe when the instance is class-fixed and the topic's
                  message identity maps the schema — making the duplicates <em>the same logical message</em> —{" "}
                  <strong>and</strong> every modeled consumer collapses duplicate deliveries of it.
                </>
              ),
            },
            {
              term: "request",
              kind: "structure",
              body: (
                <>
                  Invokes another operation's input. Duplicate-safe when the target carries a{" "}
                  <em>proven</em> idempotency requirement keyed from that input, fed by a class-fixed instance.
                  Its <Code>retry</Code> declaration says whether a repeat may happen.
                </>
              ),
            },
            {
              term: "external",
              kind: "structure",
              body: (
                <>
                  Reaches a system Archspec does not model. Duplicate-safe only through its declared{" "}
                  <Code>deduplicated_by</Code> over a stable key. <Code>not_deduplicated</Code> says duplicates
                  are distinguishable; <Code>unspecified</Code> says nothing is known.
                </>
              ),
            },
          ]}
        />
        <Callout variant="caution">
          An <strong>effect intent</strong> is not a safety mechanism. Recovering the same intent does not
          establish whether the external effect already occurred, or whether another attempt is safe. Even a
          recovered intent may execute again, because a crash can hide a prior success.
        </Callout>
      </Sub>

      <Sub id="cascade" title="The cascade">
        <P>
          Because a request or publication is only safe when what it reaches is safe, an idempotency verdict
          covers the whole cascade the operation starts. The checker resolves those edges through a{" "}
          <strong>trigger graph</strong>: a request names its target directly; a publication reaches every
          subscription on its topic whose selection admits the schema — the model's closed world of consumers.
        </P>
        <Callout variant="note">
          This makes verdicts mutually dependent, so they are computed as a <strong>least fixpoint</strong>:
          requirements are re-checked as their targets and consumers become proven, and cyclic dependencies
          settle unproven — the conservative answer. One unproven consumer therefore holds back every producer
          upstream of it, which is the intended reading rather than a limitation.
        </Callout>
      </Sub>
    </>
  ),
};
