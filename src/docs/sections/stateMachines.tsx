import { Callout, Code, Means, P, Snippet, Sub, Terms } from "../parts";
import type { DocSection } from "./types";

export const stateMachines: DocSection = {
  id: "state-machines",
  title: "State machines",
  lede: "A state machine declares the legal states and legal transitions of a persistent object field. It declares legality — not concurrency safety, and not replayability. Both of those have to be proven from elsewhere.",
  items: [
    { id: "machine-parts", title: "Machines and transitions" },
    { id: "transition-step", title: "Applying a transition" },
    { id: "transition-effects", title: "Transition side effects" },
    { id: "transition-replay", title: "Why a transition forces a keyed commit" },
  ],
  Body: () => (
    <>
      <Sub id="machine-parts" title="Machines and transitions">
        <Terms
          rows={[
            {
              term: "subject: object",
              kind: "structure",
              body: (
                <>
                  The persistent object class the machine governs, and the field of its canonical schema storing
                  the logical state.
                </>
              ),
            },
            {
              term: "states",
              kind: "structure",
              body: <>The set of legal logical states.</>,
            },
            {
              term: "initial",
              kind: "structure",
              body: (
                <>
                  The state of a newly created instance. It does <em>not</em> imply that every existing record is
                  currently in it.
                </>
              ),
            },
            {
              term: "Transition.from / .to",
              kind: "structure",
              body: <>The states from which the transition is legal, and the single destination state.</>,
            },
          ]}
        />
      </Sub>

      <Sub id="transition-step" title="Applying a transition">
        <P>
          A <Code>transition</Code> transaction step selects a concrete persistent instance and applies the named
          transition. The guard on <Code>from</Code> and the update to <Code>to</Code> are one logical state
          transition inside the surrounding transaction.
        </P>
        <Callout variant="caution">
          The machine declares legality, not concurrency safety. Two individually legal transitions can still
          race. Ruling that out needs isolation, locks, serialization, ordering, or another declared fact — the
          transition graph alone proves nothing about concurrent histories.
        </Callout>
      </Sub>

      <Sub id="transition-effects" title="Transition side effects">
        <P>
          A transition may declare publication or request effects taken with it. These are not direct external
          executions inside the state transaction. They are treated as{" "}
          <strong>implicitly established effect-intent artifacts</strong>: they commit logically with the
          transition, enter the invocation's artifact context, and obey the same retention and recovery rules as
          an explicitly established intent.
        </P>
        <Terms
          rows={[
            {
              term: "the handle",
              kind: "structure",
              body: (
                <>
                  An operation-level <Code>EffectIntent</Code> whose effect is the transition side effect. The
                  operation declares the handle; the transition establishes the artifact. A later{" "}
                  <Code>execute_effect_intent</Code> step names it.
                </>
              ),
            },
            {
              term: "uniqueness",
              kind: "structure",
              body: <>At most one intent per transition side effect per operation — a transition establishes exactly one logical intent, so two declarations would leave no rule for which the commit fills.</>,
            },
            {
              term: "establishability",
              kind: "structure",
              body: <>The operation may declare such an intent only if one of its transactions applies the owning transition. Otherwise the handle names an artifact that can never exist.</>,
            },
            {
              term: "effect_values",
              kind: "structure",
              body: (
                <>
                  The derivation building each side effect's instance, keyed exactly to the transition's side
                  effects — no missing entries, no extras. Unknown provenance must be written as{" "}
                  <Code>unspecified</Code> rather than omitted, so an intentional gap stays distinguishable from
                  an accidental one.
                </>
              ),
            },
          ]}
        />
        <Callout variant="note">
          A transition side effect must not be established explicitly, and must not be run by a direct{" "}
          <Code>execute_effect</Code> step. Establishment belongs to the transition; execution belongs to{" "}
          <Code>execute_effect_intent</Code>.
        </Callout>
      </Sub>

      <Sub id="transition-replay" title="Why a transition forces a keyed commit">
        <Means>
          Every transaction containing a transition must declare explicit durable keyed commit deduplication.
        </Means>
        <P>
          A transaction containing any transition is <strong>not naturally replayable</strong>. Once it has
          committed, its state-dependent guard cannot be assumed to run again in a way that reproduces the
          original outcome and artifacts — the instance is no longer in the <Code>from</Code> state.
        </P>
        <Snippet>{`Transaction T   deduplicated_by(K)
    transition pending -> paid
        establishes effect intent E
COMMIT

<crash>

execute_effect_intent E`}</Snippet>
        <P>
          The purpose of the keyed commit is not merely to suppress a second transition. It is the{" "}
          <strong>durable recovery boundary</strong>: a later encounter resolves the prior commit and recovers
          its retained artifacts — here, the intent <Code>E</Code> — without reapplying the transition, so the
          flow can continue. A gate that only prevents a second commit does not do this.
        </P>
        <Callout variant="note">
          It is also what lets transition effect values depend on transaction-local reads that are not
          replay-stable: those derivations are evaluated only during the first successful keyed execution, and a
          retry recovers the exact original artifacts instead of recomputing them.
        </Callout>
        <Callout variant="caution">
          None of this implies exactly-once external execution. Recovering the same intent does not establish
          whether the effect already occurred; effect-level duplicate safety remains a separate obligation.
        </Callout>
      </Sub>
    </>
  ),
};
