import { Callout, Code, P, Sub, Terms } from "../parts";
import type { DocSection } from "./types";

export const transactions: DocSection = {
  id: "transactions",
  title: "Transactions and data",
  lede: "What a transaction is allowed to do to persistent state, how it addresses instances, and what it may declare about isolation and locking.",
  items: [
    { id: "transaction", title: "The transaction" },
    { id: "selectors", title: "Selectors and predicates" },
    { id: "steps", title: "Read, write, insert, delete" },
    { id: "locks", title: "Locks and isolation" },
  ],
  Body: () => (
    <>
      <Sub id="transaction" title="The transaction">
        <Terms
          rows={[
            {
              term: "data_model: <id>",
              kind: "structure",
              body: <>The application transactional boundary. Required once the transaction reads, writes, locks, inserts, deletes, or transitions an application object.</>,
            },
            {
              term: "data_model: null",
              kind: "structure",
              body: (
                <>
                  Permitted when the transaction only establishes framework artifacts — invocation results and
                  effect intents. Those participate atomically without belonging to an application data model.
                </>
              ),
            },
            {
              term: "deduplicated_by(key)",
              kind: "guarantee",
              body: (
                <>
                  Durable keyed commit: one successful commit per key, whose exact artifacts are retained and
                  recovered on a later encounter. Not a governing key, and exempt from the single-input rule that
                  governing keys obey.
                </>
              ),
            },
          ]}
        />
        <Callout variant="caution">
          Framework retention is not a hidden global transaction spanning arbitrary data models. An artifact's
          durability comes from the replay mechanism: a naturally replayable transaction may reconstruct a
          replay-deterministic artifact, while a keyed transaction must durably retain the exact artifacts of
          its one successful commit, because its body is not committed again.
        </Callout>
      </Sub>

      <Sub id="selectors" title="Selectors and predicates">
        <P>
          A selector identifies which instances of one declared object a step addresses. It is a logical
          predicate — not a claim about a query plan or an index.
        </P>
        <Terms
          rows={[
            { term: "all", kind: "structure", body: <>Every modeled instance. Broad, and may imply many concrete accesses.</> },
            {
              term: "eq",
              kind: "structure",
              body: <>A field equals a value reference or a literal. Because the selector exposes its references and literals, its provenance is derived structurally rather than asserted.</>,
            },
            { term: "and", kind: "structure", body: <>Conjunction of nested predicates. It defines no evaluation order.</> },
          ]}
        />
        <Callout variant="caution">
          A selector constraining <em>every</em> field of an object's identity addresses at most one instance.
          One constraining only part of a composite identity may match several, and the checker must never treat
          partial coverage as single-object selection.
        </Callout>
      </Sub>

      <Sub id="steps" title="Read, write, insert, delete">
        <Terms
          rows={[
            {
              term: "read",
              kind: "structure",
              body: (
                <>
                  Reads the selected instances; <Code>fields</Code> is the read set visible to conflict analysis,
                  and the step names a transaction-local result later steps may use as provenance. Reading{" "}
                  <Code>all</Code> fields of a partial schema does not prove undeclared fields absent.
                </>
              ),
            },
            {
              term: "write",
              kind: "structure",
              body: (
                <>
                  Mutates listed fields, with the written values' provenance declared as a derivation. Natural
                  replay additionally needs the target and every derivation root to be replay-stable — a
                  deterministic derivation alone is not enough. An <Code>unspecified</Code> derivation normally
                  leaves natural replayability unknown wherever the mutation matters.
                </>
              ),
            },
            {
              term: "insert",
              kind: "structure",
              body: (
                <>
                  Creates a new instance, declaring inserted-value provenance but never redeclaring identity —
                  the object's identity already governs. Whether a retried conflicting insert can support a
                  natural-replay proof is undefined until duplicate-identity outcomes are specified, so V1 does
                  not infer replayability from identity uniqueness.
                </>
              ),
            },
            {
              term: "delete",
              kind: "structure",
              body: (
                <>
                  Deletes the selected instances. Replay behaviour depends on what the model guarantees when the
                  instance is already absent, so the checker does not treat deletion as naturally replayable
                  merely because deleting twice leaves nothing.
                </>
              ),
            },
          ]}
        />
      </Sub>

      <Sub id="locks" title="Locks and isolation">
        <Terms
          rows={[
            {
              term: "Lock",
              kind: "guarantee",
              body: (
                <>
                  Acquired at that point in transaction program order, protecting the instances its target
                  selects, and held until the surrounding transaction ends. <Code>shared</Code> and{" "}
                  <Code>exclusive</Code> carry the usual meanings; <Code>LockOrder</Code> may declare an
                  acquisition order for deadlock reasoning.
                </>
              ),
            },
            {
              term: "isolation",
              kind: "guarantee",
              body: <>What the data model guarantees about concurrent transactions. Serializable admits an equivalent serial commit order — which is not the same as preventing concurrent execution.</>,
            },
          ]}
        />
        <Callout variant="caution">
          Neither is credited toward a serialization requirement. A lock covers only acquisition to transaction
          end, not the whole invocation, and whether two same-key invocations actually conflict on a common
          instance depends on runtime state the model cannot declare. Serializable isolation reorders commits;
          it does not stop two invocations overlapping.
        </Callout>
      </Sub>
    </>
  ),
};
