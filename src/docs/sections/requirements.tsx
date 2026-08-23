import { Callout, Code, Means, P, Routes, Scope, Section, Snippet, Sub, V1, VerdictBadge } from "../parts";

/**
 * The six obligation families.
 *
 * Each is presented the same way: what the declaration means, what the
 * checker looks at to decide, what it accepts as a proof, what it
 * refuses to accept, and what discharges it with no work at all. The
 * uniformity is the point — the interesting differences between the
 * families are then the only differences on the page.
 */
export function RequirementsSections() {
  return (
    <>
      <Section
        id="requirements"
        title="Operation requirements"
        lede={
          <>
            Requirements are proof obligations. Declaring one asserts nothing about the operation; it asks the
            checker to establish the property from the model's facts and structure. A requirement the checker
            cannot establish is reported <VerdictBadge verdict="unknown" />, which is a statement about the
            proof, not about the architecture.
          </>
        }
      >
        <P>
          Every obligation below is scoped the same way. Its <em>population</em> is the set of invocations it
          constrains — never simply "every invocation", because a key sourced from one input has no value for
          an invocation triggered by another. Its <em>evidence</em> is the declarations the checker reads. Its{" "}
          <em>reach</em> is how far past the operation the checker must follow the work before it can answer.
        </P>
        <Callout variant="caution">
          A requirement no route establishes is <Code>unproven</Code>, never <VerdictBadge verdict="disproven" />
          . Concurrency and delivery declarations are upper bounds, and nothing in a model can prove that a
          violating execution actually occurs. The checker reports what it could not show, not what it caught.
        </Callout>
      </Section>

      <Sub id="serialization" title="Serialization" aside={<V1 />}>
        <Means>Invocations with the same logical key must not execute concurrently.</Means>
        <P>
          Serialization establishes mutual exclusion. It says nothing about <em>which</em> same-key invocation
          should come first — that is ordering's obligation, and the two are deliberately separate. A non-FIFO
          mutex serializes without ordering.
        </P>
        <Scope
          population={
            <>
              For a key sourced from input <Code>i</Code>, the invocations triggered by <Code>i</Code>. For a
              key sourced from anything else, no dispatch fact says which invocations share a key, so the
              population is conservatively every invocation — and only a global bound of one can serialize it.
            </>
          }
          reads={
            <>
              Operation <Code>execution.concurrency</Code>; the triggering subscription's dispatch routing and
              lane concurrency; the topic's ordering domain; and, for the keyed-lane route, whether the
              serialization key carries the topic key for every admitted message schema.
            </>
          }
          reach={<>The operation and its triggering input only. Nothing downstream affects the verdict.</>}
        />
        <Routes
          credited={[
            {
              name: "Operation-serial",
              detail: (
                <>
                  <Code>concurrency: bounded(1)</Code> admits one active invocation across the whole operation,
                  so no two overlap at all.
                </>
              ),
            },
            {
              name: "Subscription-serial",
              detail: (
                <>
                  <Code>single_lane</Code> routing puts every delivery in one lane, and lane concurrency{" "}
                  <Code>bounded(1)</Code> prevents overlap within it.
                </>
              ),
            },
            {
              name: "Keyed-lane-serial",
              detail: (
                <>
                  a keyed topic, <Code>by_topic_key</Code> routing, lane concurrency <Code>bounded(1)</Code>,
                  and the key established to carry the topic key for every admitted schema — so same-key
                  invocations share a lane.
                </>
              ),
            },
            {
              name: "Vacuous population",
              detail: <>the key's subscription admits no message schemas, so the population is empty.</>,
            },
          ]}
          refused={[
            {
              name: "Locks",
              detail: (
                <>
                  a lock protects the instances its selector selects; whether two same-key invocations conflict
                  on a common instance is runtime state the model cannot declare. It also covers only
                  acquisition to commit, not the whole invocation.
                </>
              ),
            },
            {
              name: "Serializable isolation",
              detail: <>an equivalent serial commit order does not prevent concurrent execution.</>,
            },
            {
              name: "Topic ordering alone",
              detail: <>delivery order does not serialize consumer execution.</>,
            },
            {
              name: (
                <>
                  <Code>bounded(n)</Code>, n &gt; 1
                </>
              ),
              detail: <>anywhere in the chain: it permits overlap.</>,
            },
          ]}
        />
      </Sub>

      <Sub id="ordering" title="Ordering" aside={<V1 />}>
        <Means>
          Same-key invocations for which a meaningful logical precedence exists must preserve that precedence
          through the operation's semantically relevant execution.
        </Means>
        <P>
          Ordering is strictly stronger than serialization: a proof must say <em>where the precedence comes
          from</em> and show the mechanism preserves it. Arbitrarily serializing concurrent inputs satisfies
          serialization but cannot invent a semantic precedence.
        </P>
        <Scope
          population={<>The invocations triggered by the key's input, as for serialization.</>}
          reads={
            <>
              The topic's ordering declaration as the sole precedence source; then the dispatch composition —
              routing, lane concurrency, and head-of-line redelivery — as the mechanism. A request input
              carries no precedence: the arrival order of unmodeled callers is not a logical precedence.
            </>
          }
          reach={
            <>
              Upstream to the topic that supplies the precedence. Sideways to the operation's own idempotency
              requirement, to record which obligation answers for a duplicate of an already-completed message.
            </>
          }
        />
        <Routes
          credited={[
            {
              name: "Keyed-topic precedence",
              detail: (
                <>
                  a keyed topic orders same-key messages, which is a precedence for <em>this</em> key only when
                  the key is established to carry the topic key for every admitted schema.
                </>
              ),
            },
            {
              name: "Global-topic precedence",
              detail: <>a global topic orders every message, so any key inherits the order.</>,
            },
            {
              name: "Lane preservation",
              detail: (
                <>
                  the mechanism, required in addition to a source: same-key deliveries enter one lane, the lane
                  does not advance past an incomplete delivery, and lane concurrency one stops overtaking.
                </>
              ),
            },
          ]}
          refused={[
            {
              name: "Request inputs",
              detail: <>the DSL carries no ordering fact for them; unproven, never violated.</>,
            },
            {
              name: "Non-input keys",
              detail: <>a key sourced from anything but an input selects no population.</>,
            },
            {
              name: "Ordered transport alone",
              detail: (
                <>
                  a broker serializing concurrent producers does not establish a business-level happens-before.
                </>
              ),
            },
          ]}
        />
        <Callout variant="note">
          Redelivery cannot invert the precedence. A failure-driven redelivery precedes every later message of
          its lane; a duplicate of an already-completed message is a repeated attempt at an invocation that
          already took effect in order. What that attempt <em>does</em> is idempotency's obligation, and the
          report records which requirement answers for it — or that none does.
        </Callout>
        <Callout variant="vacuous">A subscription admitting no message schemas.</Callout>
      </Sub>

      <Sub id="idempotency" title="Idempotency" aside={<V1 />}>
        <Means>
          Repeated attempts representing the same logical invocation must not cause externally distinguishable
          duplicate logical work beyond what the declared idempotency contract permits.
        </Means>
        <P>
          This is the obligation with the widest reach, because duplicate work an attempt causes{" "}
          <em>downstream</em> is still work it caused. The checker analyses the complete admitted retry path
          and then follows every effect the attempt executes into the operations it reaches.
        </P>
        <Scope
          population={<>The governing key's attempt class — the invocations triggered by that one input.</>}
          reads={
            <>
              Every step of every admitted flow, in two legs. The <strong>state leg</strong>: each transaction
              step must be retry-safe, by a keyed commit over a stable key or by natural replayability. The{" "}
              <strong>effect leg</strong>: each effect-executing step must be duplicate-safe under the §13
              rules.
            </>
          }
          reach={
            <>
              <strong>Downstream, transitively.</strong> A request is safe only when its target operation
              collapses duplicate invocations; a publication only when <em>every</em> modeled consumer of that
              message collapses duplicate deliveries — each through its own proven requirement. The verdict
              therefore covers the whole cascade the operation starts.
            </>
          }
        />
        <Callout variant="note">
          Because verdicts depend on one another, the checker computes them as a least fixpoint: requirements
          are re-checked as their request targets and message consumers become proven, and cyclic dependencies
          settle unproven — the conservative answer.
        </Callout>
        <P>
          There is <strong>no final-step exemption</strong>. A duplicate delivery re-drives the whole flow even
          after terminal completion, so every committed transaction may be re-encountered. And duplicate
          execution is possible at every effect site: even a recovered intent may execute again, because a
          crash can hide a prior success.
        </P>
        <Routes
          credited={[
            {
              name: "Keyed commit",
              detail: (
                <>
                  a transaction declaring <Code>deduplicated_by</Code> over a key that is stable across the
                  class commits once per class.
                </>
              ),
            },
            {
              name: "Natural replayability",
              detail: <>a body whose re-execution reproduces the same logical committed state.</>,
            },
            {
              name: "External deduplication",
              detail: (
                <>
                  an external effect's declared <Code>deduplicated_by</Code> over a stable key.
                </>
              ),
            },
            {
              name: "Request into a safe target",
              detail: (
                <>
                  a class-fixed instance sent to an input whose operation carries a <em>proven</em> idempotency
                  requirement keyed from that input.
                </>
              ),
            },
            {
              name: "Same logical message",
              detail: (
                <>
                  a class-fixed instance published to a topic whose message identity maps the schema,{" "}
                  <em>and</em> every modeled consumer collapsing duplicate deliveries of it.
                </>
              ),
            },
          ]}
          refused={[
            {
              name: "A field named idempotency_key",
              detail: <>naming is not a mechanism.</>,
            },
            {
              name: "An InvocationResult existing",
              detail: <>existence implies neither durable memoization nor transaction idempotency.</>,
            },
            {
              name: "An EffectIntent existing",
              detail: <>recovering an intent does not establish whether the effect already occurred.</>,
            },
            {
              name: "Key propagation",
              detail: (
                <>
                  a lineage assertion. It lets the checker trace one logical key across a boundary; it
                  deduplicates nothing.
                </>
              ),
            },
            {
              name: "At-most-once commit",
              detail: (
                <>
                  preventing a second commit is not natural replayability: a retry may still need to reproduce
                  artifacts that later steps consume.
                </>
              ),
            },
          ]}
        />
        <Callout variant="vacuous">
          An empty population; no admitted flow, so an attempt performs no modeled work; and a triggering
          subscription with <Code>at_most_once</Code> delivery whose payload is identity-pinned by the key —
          same-class messages are then one logical message delivered at most once, so a class holds at most one
          attempt.
        </Callout>
      </Sub>

      <Sub id="response-replay" title="Response replay consistency" aside={<V1 />}>
        <Means>Retries for the same logical invocation must resolve the same logical response.</Means>
        <P>
          Declared as <Code>response: replay_consistent</Code> on an idempotency requirement. It is a separate
          obligation from the side-effect safety above: <Code>response: unspecified</Code> waives nothing about
          effects.
        </P>
        <Scope
          population={<>The governing key's attempt class.</>}
          reads={
            <>
              The flows terminating with a response declared for the triggering <em>request</em> input, and for
              each, whether the result the response resolves is replay-available at the end of the flow.
            </>
          }
          reach={
            <>
              Within the operation, but across <em>all</em> its responding flows: when more than one flow
              responds, every site must resolve the same result through the same establishing transaction and
              the same replay route.
            </>
          }
        />
        <Routes
          credited={[
            {
              name: "Natural reconstruction",
              detail: (
                <>
                  the establishing transaction is naturally replayable and the result derivation is
                  replay-deterministic.
                </>
              ),
            },
            {
              name: "Keyed recovery",
              detail: (
                <>
                  the establishing transaction is <Code>deduplicated_by</Code> over a stable key, and the exact
                  result of the prior successful commit is durably retained and recovered.
                </>
              ),
            },
          ]}
          refused={[
            {
              name: "ResponseSource::invocation_result alone",
              detail: <>it implies neither durable memoization nor transaction idempotency.</>,
            },
            {
              name: "response: unspecified",
              detail: <>no source, so no proof is possible.</>,
            },
            {
              name: "Differing routes across flows",
              detail: <>equal routes fix one value for the class; differing ones leave it unproven.</>,
            },
          ]}
        />
        <Callout variant="vacuous">
          A key triggered by a subscription, or an operation whose admitted flows resolve no such response —
          there is nothing to stabilize.
        </Callout>
      </Sub>

      <Sub id="recoverability" title="Recoverability" aside={<V1 />}>
        <Means>
          The logical invocation identified by the key must reach terminal execution of a declared flow.
        </Means>
        <P>
          Recoverability is a <strong>progress</strong> obligation; idempotency is a <strong>safety</strong>{" "}
          obligation. Neither implies the other, and the DSL deliberately does not couple them. Idempotency is
          satisfied vacuously by never retrying: an invocation that crashes after its transaction commits and
          is never re-driven produces no duplicate work, and so violates nothing — while the remaining steps of
          the flow never execute at all.
        </P>
        <Snippet>{`Transaction T   deduplicated_by(K)
    transition pending -> paid
        establishes effect intent E
COMMIT

<crash>

execute_effect_intent E        ← nothing obliges this to happen`}</Snippet>
        <P>
          The keyed commit makes the intent <em>recoverable</em>, and the idempotency requirement is satisfied.
          But nothing yet obliges anyone to come back and execute it. The order is durably paid and the payment
          capture never happens. A recoverability requirement is what makes that a declared violation rather
          than an unremarked silence.
        </P>
        <Scope
          population={<>The governing key's attempt class.</>}
          reads={
            <>
              Per admitted flow — one with no response, or one whose response belongs to the triggering input —
              every prefix at which the attempt may fail. Each committed transaction must resolve on
              re-encounter; each artifact a later step consumes must be replay-available.
            </>
          }
          reach={
            <>
              Within the flow for resumability. For <Code>guaranteed</Code>, <strong>upstream</strong> to the
              retry driver: the triggering subscription's delivery, or a modeled caller's request effect —
              including one declared as a state-machine transition side effect.
            </>
          }
        />
        <Routes
          credited={[
            {
              name: "Same-flow continuation",
              detail: (
                <>
                  re-driving the same flow from its first step reaches terminal completion. A sufficient route
                  that deliberately does not prejudge which <em>other</em> flows a resumed attempt may take.
                </>
              ),
            },
            {
              name: "Re-encounter resolution",
              detail: (
                <>
                  every committed transaction resolves by keyed commit or natural replay — except one that is
                  the final step of a response-less flow, after which no failing prefix exists.
                </>
              ),
            },
            {
              name: "Artifact availability",
              detail: (
                <>
                  every consumed artifact is recoverable or reconstructible. References inside the establishing
                  transaction are exempt by atomicity.
                </>
              ),
            },
            {
              name: "A modeled driver",
              detail: (
                <>
                  for <Code>guaranteed</Code> only: <Code>at_least_once</Code> delivery, or an inbound{" "}
                  <Code>may_repeat</Code> request effect.
                </>
              ),
            },
          ]}
          refused={[
            {
              name: "Re-executing an unresolvable commit",
              detail: (
                <>
                  a transaction that resolves by neither route is not a continuation of the same logical
                  invocation, so progress cannot be discharged through it.
                </>
              ),
            },
            {
              name: "A request input as driver",
              detail: (
                <>
                  the caller is outside the model, so <Code>guaranteed</Code> on a request-only operation is
                  normally not dischargeable unless the calling side is itself modeled.
                </>
              ),
            },
          ]}
        />
        <Callout variant="conditional">
          <Code>at_least_once</Code> and <Code>may_repeat</Code> are duplicate-delivery facts, not
          bounded-liveness facts. Neither encodes retry timing, count, backoff, or eventual delivery. A{" "}
          <Code>guaranteed</Code> proof is conditional on the delivery abstraction genuinely re-driving until
          the invocation succeeds.
        </Callout>
        <Callout variant="caution">
          A <Code>guaranteed</Code> proof for an operation that declares no idempotency requirement keyed from
          the triggering input carries a warning: the driver makes retries expected, and nothing declares them
          safe.
        </Callout>
      </Sub>

      <Sub id="object-history" title="Object history" aside={<V1 />}>
        <Means>
          For each logical object instance, all modeled operations observing or mutating it must collectively
          admit a legal sequential history that respects real-time precedence.
        </Means>
        <P>
          Declared as <Code>linearizable</Code> on a data object. It is stronger than serializability because it
          includes real-time precedence, and it is per logical object identity: linearizability of one object
          implies nothing about atomicity across different identities.
        </P>
        <Scope
          population={<>Every modeled operation that observes or mutates the object.</>}
          reads={<>Nothing yet — no V1 verifier attempts this family.</>}
          reach={<>Model-wide, once attempted.</>}
        />
        <Callout variant="note">
          Every object-history obligation is reported <VerdictBadge verdict="unknown" /> today. That is the
          epistemic verdict in its purest form: the obligation is enumerated and carried in the report, and the
          checker states plainly that it has no argument either way. It is not evidence of a violation.
        </Callout>
      </Sub>
    </>
  );
}
