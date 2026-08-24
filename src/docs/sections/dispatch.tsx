import { Code, KindBadge, P, Snippet, Sub, Terms } from "../parts";
import type { DocSection } from "./types";

export const dispatch: DocSection = {
  id: "dispatch",
  title: "Inputs and dispatch",
  lede: "How an invocation starts. This is where serialization and ordering proofs get their mechanism, so the three declarations below compose rather than stand alone.",
  items: [
    { id: "input-kinds", title: "Request and subscription" },
    { id: "delivery", title: "Delivery, routing, lanes" },
  ],
  Body: () => (
    <>
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
    </>
  ),
};
