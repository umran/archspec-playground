import { Callout, Code, KindBadge, Means, P, Section, Snippet, Sub, Terms, VerdictBadge } from "../parts";

/** What a declaration means before any particular declaration is read. */
export function FoundationsSections() {
  return (
    <>
      <Section
        id="orientation"
        title="Orientation"
        lede="Archspec describes a logical architecture — not a deployment manifest, and not executable code. Reading a model correctly starts with knowing which of three very different things a given line is saying."
      >
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
      </Section>

      <Section
        id="structure"
        title="The model"
        lede="A model is a revision, a set of services, the schemas and data they exchange and keep, the topics they publish to, the state machines they drive, and the operations that do the work."
      >
        <Sub id="schemas" title="Schemas, fields, and value identity">
          <Terms
            rows={[
              {
                term: "Schema::Canonical",
                kind: "structure",
                body: <>A named field set. Fields have a type and an optionality; the schema declares whether it is a <Code>complete</Code> or <Code>partial</Code> description of the payload.</>,
              },
              {
                term: "Schema::Fragment",
                kind: "structure",
                body: (
                  <>
                    A projection of another schema through a field mapping. The mapping <strong>asserts semantic
                    identity</strong> of the referenced value across the boundary — which is how the checker
                    recognises one logical value under two names.
                  </>
                ),
              },
              {
                term: "FieldPath",
                kind: "structure",
                body: (
                  <>
                    A path into a schema. Two paths denote the same logical value when their fully expanded
                    canonical forms are equal — equality is sufficient for identity, not necessary. Unequal forms
                    mean identity is <em>not established</em>, not that the values differ.
                  </>
                ),
              },
              {
                term: "DataObject.identity",
                kind: "structure",
                body: <>The field paths that identify one logical instance of a persistent object.</>,
              },
            ]}
          />
        </Sub>

        <Sub id="topics" title="Topics: ordering and message identity">
          <P>
            A topic declares which schemas it carries, what order it guarantees, and what identifies one
            logical message. These are three independent declarations, and none implies another.
          </P>
          <Terms
            rows={[
              {
                term: "ordering: global",
                kind: "guarantee",
                body: <>Every message on the topic is ordered relative to every other.</>,
              },
              {
                term: "ordering: keyed",
                kind: "guarantee",
                body: <>Messages sharing a topic key are ordered relative to one another. Different keys are unordered.</>,
              },
              {
                term: "ordering: unordered",
                kind: "guarantee",
                body: <>No ordering guarantee is provided.</>,
              },
              {
                term: "message_identity",
                kind: "guarantee",
                body: (
                  <>
                    What makes two deliveries the <em>same logical message</em>. Independent of the ordering key:
                    the ordering key sequences messages, the identity identifies one. They may coincide; neither
                    implies the other.
                  </>
                ),
              },
            ]}
          />
          <Callout variant="caution">
            Topic order is not execution serialization. Ordered delivery can still lead to concurrent or
            overtaking execution in the consumer — what closes that gap is the dispatch composition below. And
            ordered transport does not invent business order: a broker serializing concurrent producers does not
            establish a happens-before relation between them.
          </Callout>
        </Sub>

        <Sub id="operations" title="Operations, flows, and effects">
          <Terms
            rows={[
              {
                term: "Operation",
                kind: "structure",
                body: <>Inputs that start an invocation, transactions, effects, effect intents, invocation results, responses, flows, and the requirements to prove.</>,
              },
              {
                term: "effects",
                kind: "structure",
                body: (
                  <>
                    <strong>Capabilities, not executions.</strong> A declared effect says the operation may
                    perform it; only a flow step executing it says an invocation does.
                  </>
                ),
              },
              {
                term: "transactions",
                kind: "structure",
                body: <><strong>Declarations, not executions.</strong> Same rule: a flow step runs one.</>,
              },
              {
                term: "flows",
                kind: "structure",
                body: (
                  <>
                    <strong>Alternative complete paths.</strong> An invocation takes exactly one — which is why
                    the visualization shows flows as tabs rather than side by side.
                  </>
                ),
              },
            ]}
          />
        </Sub>
      </Section>

      <Section
        id="dispatch"
        title="Inputs and dispatch"
        lede="How an invocation starts. This is where serialization and ordering proofs get their mechanism, so the three declarations below compose rather than stand alone."
      >
        <Sub id="input-kinds" title="Request and subscription inputs">
          <Terms
            rows={[
              {
                term: "RequestInput",
                kind: "structure",
                body: (
                  <>
                    Invoked directly. Carries an optional <Code>identity</Code> — a{" "}
                    <KindBadge kind="guarantee" /> fixing what the payload of one logical request is. It supplies
                    no ordering fact: the arrival order of unmodeled callers is not a logical precedence.
                  </>
                ),
              },
              {
                term: "SubscriptionInput",
                kind: "structure",
                body: <>Driven by a topic, admitting all messages or only selected schemas.</>,
              },
            ]}
          />
        </Sub>

        <Sub id="delivery" title="Delivery, routing, and lane concurrency">
          <P>
            Three separate guarantees on a subscription. A serialization or ordering proof needs the
            composition, not any one of them.
          </P>
          <Terms
            rows={[
              {
                term: "delivery",
                kind: "guarantee",
                body: (
                  <>
                    <Code>at_least_once</Code> admits duplicate deliveries and is a retry <em>driver</em>;{" "}
                    <Code>at_most_once</Code> admits none. Neither encodes retry timing, count, backoff, or a
                    bounded eventual-delivery guarantee.
                  </>
                ),
              },
              {
                term: "dispatch routing",
                kind: "guarantee",
                body: (
                  <>
                    <Code>single_lane</Code> puts every delivery in one lane; <Code>by_topic_key</Code> puts
                    same-topic-key deliveries in one lane. A lane dispatches in the order deliveries entered it
                    and re-dispatches a failed delivery at its head.
                  </>
                ),
              },
              {
                term: "lane concurrency",
                kind: "guarantee",
                body: (
                  <>
                    <Code>bounded(1)</Code> is what actually stops overtaking within a lane. Anything greater
                    permits overlap, and no proof survives it.
                  </>
                ),
              },
            ]}
          />
          <Snippet>{`topic  keyed by order_id        ← the precedence source
  ↓
routing  by_topic_key           ← same key, one lane
  ↓
lane concurrency  bounded(1)    ← no overtaking within the lane
  ↓
serialization + ordering both provable for a key
carrying order_id for every admitted schema`}</Snippet>
        </Sub>
      </Section>

      <Section
        id="keys"
        title="Keys and populations"
        lede="Which invocations an obligation constrains, and which it says nothing about at all."
      >
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
      </Section>
    </>
  );
}
