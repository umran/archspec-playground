import { Callout, Code, Distinctions, Means, P, Section, Sub, Terms, VerdictBadge } from "../parts";

/** The machinery the requirement proofs are built out of, and how to read what comes back. */
export function MechanismSections() {
  return (
    <>
      <Section
        id="effects"
        title="Effects and duplicate safety"
        lede="An effect is a capability the operation declares; a flow step executing it is what makes an invocation perform it. Whether a duplicate execution is safe is decided per effect kind — and, for two of the three kinds, by following the work into other operations."
      >
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
      </Section>

      <Section
        id="replay"
        title="Transactions and replay"
        lede="Almost every requirement proof eventually reduces to one question: if this attempt runs again, does it reproduce the same logical outcome, and can it still get at what later steps need?"
      >
        <Sub id="stability" title="Replay-stable roots">
          <Means>
            A value reference is replay-stable when any two attempts in the same class that evaluate it obtain
            equal logical values.
          </Means>
          <P>
            Stability is <strong>definitional</strong> (a component of the governing key),{" "}
            <strong>declared</strong> (a request or message identity pinned by that key), or{" "}
            <strong>derived</strong> (a recovered or reconstructed artifact, and congruence over those).
            Everything else is a recorded gap, never an assumption.
          </P>
          <Callout variant="caution">
            A transaction-read result is <strong>never</strong> stable. Deterministic derivation is not replay
            stability: the same sources produce the same value, but those source values may differ on retry —
            including because the transaction itself changed them.
          </Callout>
        </Sub>

        <Sub id="natural-replay" title="Natural replayability">
          <P>
            A transaction is naturally replayable when re-executing its body for the same logical invocation
            reproduces the same committed state. V1 requires: no <Code>transition</Code>, no{" "}
            <Code>insert</Code>, no <Code>delete</Code>, and every <Code>write</Code> with a stable target and a
            replay-deterministic derivation. Reads and locks do not mutate state and do not block the route.
          </P>
        </Sub>

        <Sub id="keyed-commit" title="Keyed commit, and artifact availability">
          <P>
            The alternative route is an explicit <Code>deduplicated_by</Code> on the transaction: a single
            successful commit per key, durably retaining the exact artifacts it established. A retry resolves
            the prior commit instead of committing the body again.
          </P>
          <Callout variant="caution">
            These two routes are <strong>not interchangeable</strong>. A transaction that merely prevents a
            second commit is not necessarily naturally replayable, because a retry may still need to reproduce
            artifacts that later flow steps consume. Preventing a second commit and being able to reconstruct
            the first are different properties.
          </Callout>
        </Sub>
      </Section>

      <Section
        id="distinctions"
        title="Distinctions the checker preserves"
        lede="Pairs of concepts that are routinely conflated, and that the checker deliberately keeps apart. Most unknown verdicts trace back to one of these."
      >
        <Distinctions
          rows={[
            ["Requirement vs guarantee", "A declared requirement still needs proof."],
            ["Validation vs verification", "A coherent model can still describe an unsafe architecture."],
            ["Unspecified vs negative guarantee", "Unknown is not the same as explicitly unordered, unbounded, or non-deduplicated."],
            ["Topic ordering vs execution ordering", "Ordered delivery can still lead to concurrent or overtaking execution."],
            ["Ordering vs serialization", "Serialization prevents overlap; ordering preserves the correct precedence."],
            ["Transport order vs semantic order", "A broker can serialize concurrent producers without establishing a business-level happens-before."],
            ["Operation concurrency vs lane concurrency", "One is global to the deployed operation; the other is per dispatch lane."],
            ["Serializability vs linearizability", "Serializable histories need not respect real-time precedence."],
            ["Atomic transaction vs external side effect", "Local atomic commit does not make an external publication or request atomic with it."],
            ["Idempotency lineage vs deduplication", "Propagating a key lets the checker trace identity; only a mechanism deduplicates."],
            ["Deterministic derivation vs replay stability", "The same sources produce the same value, but those source values may differ on retry."],
            ["Natural replayability vs at-most-once commit", "Preventing a second commit does not mean a retry can reconstruct the original outcome or artifacts."],
            ["Artifact availability vs intrinsic durability", "An artifact may be reconstructed or recovered; its declaration alone implies no durable storage."],
            ["Read determinism vs read invariance", "A deterministic computation from a read can still change on retry, because the observed state may have changed."],
            ["Object identity vs ordering key", "They may coincide, but neither declaration implies the other."],
            ["Ordering key vs message identity", "The ordering key sequences messages; the identity identifies one logical message."],
            ["Object identity vs message identity", "order_id identifies the order, not the message about the order."],
            ["State-machine legality vs replayability", "A legal transition graph does not make a transition-containing transaction naturally replayable."],
            ["Effect-intent recovery vs exactly once", "Recovering an intent does not establish whether the effect already occurred."],
            ["Idempotency vs recoverability", "Idempotency bounds what retries may do and is satisfied by never retrying; recoverability obliges the flow to reach its terminal step."],
            ["Resumable vs guaranteed completion", "Being able to resume is a property of the flow's artifacts; being re-driven requires a modeled driver."],
            ["Duplicate-delivery fact vs liveness", "at_least_once and may_repeat say a retry may happen, not that retries continue until success."],
            ["Key equality vs payload equality", "Class membership equates the governing key's components only; payload equality needs a declared identity pinned by that key."],
            ["Stimulus identity vs deduplication", "An identity fixes what a payload is; only a mechanism limits how often work happens."],
          ]}
        />
      </Section>

      <Section
        id="report"
        title="Reading the report"
        lede="What the checker hands back, and how to act on it."
      >
        <Terms
          rows={[
            {
              term: "obligation",
              body: <>One per declared requirement, anchored to the operation, flow, transaction, object, machine, or topic it constrains.</>,
            },
            {
              term: "status",
              body: (
                <>
                  <VerdictBadge verdict="proven" /> <VerdictBadge verdict="unknown" />{" "}
                  <VerdictBadge verdict="disproven" /> — see <a className="text-kumo-link hover:underline" href="#verdicts">Reading a verdict</a>.
                </>
              ),
            },
            {
              term: "assumptions",
              body: (
                <>
                  The declared facts the proof relies on. This is the list to re-read when the implementation
                  changes: a proof is only as good as the declarations it used.
                </>
              ),
            },
            {
              term: "evidence",
              body: <>The obstacles the checker hit. On an unknown verdict this names the missing fact — usually the fastest route to making it provable.</>,
            },
            {
              term: "counterexample",
              body: <>For a disproof, the trace that violates the requirement.</>,
            },
            {
              term: "notes",
              body: <>Model-wide warnings belonging to no single obligation — such as a subscription admitting duplicate deliveries while its operation declares no idempotency requirement keyed from it.</>,
            },
          ]}
        />
        <Callout variant="note">
          In the playground, turn <strong>Verify</strong> on and open <strong>Obligations</strong> in the
          visualization. Filter to unknown, expand a card to see its assumptions and evidence, and use{" "}
          <em>focus subject</em> to jump to the entity it constrains.
        </Callout>
      </Section>
    </>
  );
}
