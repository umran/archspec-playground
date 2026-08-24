import { Distinctions } from "../parts";
import type { DocSection } from "./types";

export const distinctions: DocSection = {
  id: "distinctions",
  title: "Distinctions the checker preserves",
  lede: "Pairs of concepts that are routinely conflated, and that the checker deliberately keeps apart. Most unknown verdicts trace back to one of these.",
  items: [],
  Body: () => (
    <>
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
    </>
  ),
};
