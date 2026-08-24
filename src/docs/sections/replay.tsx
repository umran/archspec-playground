import { Callout, Code, Means, P, Sub } from "../parts";
import type { DocSection } from "./types";

export const replay: DocSection = {
  id: "replay",
  title: "Replay",
  lede: "Almost every requirement proof eventually reduces to one question: if this attempt runs again, does it reproduce the same logical outcome, and can it still get at what later steps need?",
  items: [
    { id: "stability", title: "Replay-stable roots" },
    { id: "natural-replay", title: "Natural replayability" },
    { id: "keyed-commit", title: "Keyed commit" },
  ],
  Body: () => (
    <>
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
    </>
  ),
};
