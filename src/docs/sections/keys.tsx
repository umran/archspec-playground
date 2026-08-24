import { Callout, Means, P, Sub, VerdictBadge } from "../parts";
import type { DocSection } from "./types";

export const keys: DocSection = {
  id: "keys",
  title: "Keys and populations",
  lede: "Which invocations an obligation constrains, and which it says nothing about at all.",
  items: [
    { id: "idempotency-key", title: "Idempotency keys" },
    { id: "governing-key", title: "The governing key" },
    { id: "propagation", title: "Key propagation" },
  ],
  Body: () => (
    <>
      <Sub id="idempotency-key" title="Idempotency keys">
        <P>
          An idempotency key is an ordered tuple of value references. Two attempts share a declared identity
          when all components are equal in the declared order. A composite key is one logical key, not a set
          of alternatives.
        </P>
      </Sub>

      <Sub id="governing-key" title="The governing key and the attempt population">
        <P>
          When an idempotency, recoverability, or response-replay obligation is verified, its key is the{" "}
          <strong>governing key</strong>. The analysis proceeds only when every component is sourced from{" "}
          <strong>one</strong> input — the <em>triggering input</em>. The population is then the invocations
          triggered by that input.
        </P>
        <Callout variant="caution">
          A component sourced from mutable persistent state, or from an artifact the invocation itself
          produces, cannot define a pre-execution equivalence class. The obligation is{" "}
          <VerdictBadge verdict="unknown" />. An empty governing key puts every attempt in one class, but no
          component roots exist, so essentially nothing is replay-stable relative to it.
        </Callout>
        <P>
          An invocation triggered by a <em>different</em> input has no value for the key, belongs to no
          class, and is not constrained by the obligation. This is why a verdict is never a statement about
          "every invocation of the operation".
        </P>
      </Sub>

      <Sub id="propagation" title="Key propagation">
        <Means>
          A propagation declares that the target values carry the same logical idempotency identity as the
          source values.
        </Means>
        <Callout variant="caution">
          This is a <strong>lineage assertion</strong>, not a mechanism. It lets the checker trace one logical
          key across an effect boundary — bridging renamed fields or different schemas. It deduplicates
          nothing. Only a guarantee or mechanism actually deduplicates.
        </Callout>
        <P>
          The checker reads it on the consumer's side: for a population resting on a topic's keyed message
          identity, each modeled producer either declares a propagation covering the identity fields — so the
          identity carries the producer's key — or declares none, and the identity rests on the topic
          declaration alone. Both facts are recorded next to the verdict; neither changes it.
        </P>
      </Sub>
    </>
  ),
};
