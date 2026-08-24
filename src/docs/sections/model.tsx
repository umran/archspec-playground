import { Callout, Code, Sub, Terms } from "../parts";
import type { DocSection } from "./types";

export const model: DocSection = {
  id: "model",
  title: "The model",
  lede: "A revision, the services that run code, the schemas they exchange, the data they keep, and the topics they publish to. Everything an operation later refers to is declared here first.",
  items: [
    { id: "services", title: "Services and revision" },
    { id: "schemas", title: "Schemas and value identity" },
    { id: "data", title: "Data models and objects" },
    { id: "topics", title: "Topics" },
  ],
  Body: () => (
    <>
      <Sub id="services" title="Services and revision">
        <Terms
          rows={[
            {
              term: "revision",
              kind: "structure",
              body: (
                <>
                  A monotonically meaningful version of the model. A report records the revision it was produced
                  against, so a stale report can be recognised rather than silently trusted.
                </>
              ),
            },
            {
              term: "Service",
              kind: "structure",
              body: (
                <>
                  A deployment boundary that owns operations. Its <Code>kind</Code> is one of{" "}
                  <Code>backend</Code>, <Code>frontend</Code>, <Code>worker</Code>, <Code>job</Code> — a
                  description of how it runs, carrying no verification consequence by itself.
                </>
              ),
            },
            {
              term: "Id",
              kind: "structure",
              body: <>Globally unique across the whole model. Two declarations may never share one.</>,
            },
          ]}
        />
      </Sub>

      <Sub id="schemas" title="Schemas, fields, and value identity">
        <Terms
          rows={[
            {
              term: "Schema::Canonical",
              kind: "structure",
              body: (
                <>
                  A named field set. Fields have a type and an optionality; <Code>completeness</Code> declares
                  whether it is a <Code>complete</Code> or <Code>partial</Code> description of the real payload.
                  A partial schema never proves that undeclared real-world fields do not exist.
                </>
              ),
            },
            {
              term: "Schema::Fragment",
              kind: "structure",
              body: (
                <>
                  A projection of another schema through a field mapping. The mapping{" "}
                  <strong>asserts semantic identity</strong> of the referenced value across the boundary — which
                  is how the checker recognises one logical value under two names.
                </>
              ),
            },
            {
              term: "FieldPath",
              kind: "structure",
              body: (
                <>
                  A path into a schema. Two paths denote the same logical value when their fully expanded
                  canonical forms are equal. Equality is <em>sufficient</em> for identity, not necessary:
                  unequal forms mean identity is not established, not that the values differ.
                </>
              ),
            },
          ]}
        />
      </Sub>

      <Sub id="data" title="Data models and persistent objects">
        <Terms
          rows={[
            {
              term: "DataModel",
              kind: "structure",
              body: <>A transactional boundary. A transaction touching application data must declare which one it acts in.</>,
            },
            {
              term: "DataObject",
              kind: "structure",
              body: <>A persistent object class, shaped by a canonical schema.</>,
            },
            {
              term: "identity",
              kind: "structure",
              body: (
                <>
                  The field paths identifying one logical instance. Strict and non-empty: two successful inserts
                  cannot create two instances with the same complete identity. A selector constraining every
                  identity field addresses at most one instance; one constraining only part of a composite
                  identity may match many, and the checker must not read partial coverage as single-object
                  selection.
                </>
              ),
            },
            {
              term: "requirements.history",
              kind: "requirement",
              body: <>An obligation, not a guarantee — see object history under the requirements below.</>,
            },
          ]}
        />
      </Sub>

      <Sub id="topics" title="Topics: ordering and message identity">
        <Terms
          rows={[
            {
              term: "messages",
              kind: "structure",
              body: <>The schemas the topic carries.</>,
            },
            {
              term: "ordering: global",
              kind: "guarantee",
              body: <>Every message on the topic is ordered relative to every other.</>,
            },
            {
              term: "ordering: keyed",
              kind: "guarantee",
              body: (
                <>
                  Messages sharing a topic key are ordered relative to one another. Different keys are unordered.
                  The mapping names, per admitted schema, the fields carrying the key.
                </>
              ),
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
    </>
  ),
};
