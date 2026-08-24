import { Callout, Code, Means, P, Sub, Terms, VerdictBadge } from "../parts";
import type { DocSection } from "./types";

export const orientation: DocSection = {
  id: "orientation",
  title: "Orientation",
  lede: "Archspec describes a logical architecture — not a deployment manifest, and not executable code. Reading a model correctly starts with knowing which of three very different things a given line is saying.",
  items: [
    { id: "categories", title: "Three kinds of declaration" },
    { id: "unspecified", title: "Unknown is not false" },
    { id: "verdicts", title: "Reading a verdict" },
  ],
  Body: () => (
    <>
      <Sub id="categories" title="Three kinds of declaration">
        <P>
          Every declaration in the DSL belongs to exactly one of these categories, and the checker treats
          them completely differently. Conflating them is the single most common way to misread a model.
        </P>
        <Terms
          badgeAsTerm
          rows={[
            {
              term: "structural fact",
              kind: "structure",
              body: (
                <>
                  Describes what the modeled program can do, or how entities relate — operations, flows,
                  effects, transactions, schemas. True of the model by construction; nothing needs proving.
                </>
              ),
            },
            {
              term: "implementation guarantee",
              kind: "guarantee",
              body: (
                <>
                  A fact the model claims the implementation or an external system provides — topic ordering,
                  delivery semantics, dispatch routing, isolation, locks, effect idempotency, concurrency
                  bounds, request and message identity. The checker may rely on it as an assumption.
                </>
              ),
            },
            {
              term: "requirement",
              kind: "requirement",
              body: (
                <>
                  A property the architecture says must hold — serialization, ordering, idempotency,
                  recoverability, response replay, object linearizability. It is <em>not</em> a guarantee
                  merely because it is declared. The checker must prove it from the other two categories.
                </>
              ),
            },
          ]}
        />
        <Callout variant="note">
          A structurally valid model is not necessarily a safe model. <strong>Validation</strong> establishes
          that declarations are coherent and references resolve. <strong>Verification</strong> establishes
          whether the declared requirements follow from the declared facts. The playground runs them in that
          order, and will not verify a model that does not validate — verdicts are only meaningful over a
          structurally coherent model.
        </Callout>
      </Sub>

      <Sub id="unspecified" title="Unknown is not false">
        <Means>
          <Code>unspecified</Code> means: the model provides no fact from which the property may be inferred.
        </Means>
        <P>
          It does not mean the property is false, and it does not license the implementation to violate
          anything. It means the checker must treat the fact as unknown — and an unknown fact can never be
          evidence for a proof.
        </P>
        <Terms
          rows={[
            {
              term: "ordering: unspecified",
              body: <>does not prove messages are unordered.</>,
            },
            {
              term: "concurrency: unspecified",
              body: <>does not prove concurrent execution exists.</>,
            },
            {
              term: "idempotency: unspecified",
              body: <>does not prove an external effect is non-idempotent.</>,
            },
            {
              term: "isolation: unspecified",
              body: <>does not prove transactions are weakly isolated.</>,
            },
          ]}
        />
        <P>
          <Code>unordered</Code>, <Code>unbounded</Code> and <Code>not_deduplicated</Code> are stronger,
          genuinely negative declarations: they say no guarantee is provided. Even these describe guarantees
          rather than observed behaviour — an unordered topic may happen to emit in order, and the checker
          simply may not rely on it.
        </P>
      </Sub>

      <Sub id="verdicts" title="Reading a verdict">
        <Terms
          rows={[
            {
              term: "proven",
              body: (
                <>
                  <VerdictBadge verdict="proven" /> The obligation follows from the declared facts, for every
                  execution the model admits — conditional on the implementation conforming to the facts the
                  proof used.
                </>
              ),
            },
            {
              term: "unknown",
              body: (
                <>
                  <VerdictBadge verdict="unknown" /> The checker could not establish the property. Typically a
                  required fact is <Code>unspecified</Code>, or no V1 verifier attempts that family. This is{" "}
                  <strong>epistemic</strong>: it is never evidence of a violation.
                </>
              ),
            },
            {
              term: "disproven",
              body: (
                <>
                  <VerdictBadge verdict="disproven" /> The checker found a counterexample and carries the
                  trace. V1 does not yet produce this verdict for any family.
                </>
              ),
            },
          ]}
        />
        <Callout variant="conditional">
          A successful proof reads: <em>given the declared architecture facts, given the semantic contract,
          and assuming the implementation conforms to the declarations the proof used, the requirement
          follows for all executions the model admits.</em> It does not read: <em>the implementation is
          correct.</em> Archspec's strength is that it forces a correctness argument to state which facts it
          depends on.
        </Callout>
      </Sub>
    </>
  ),
};
