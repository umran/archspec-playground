import { Callout, Code, Means, P, Snippet, Sub, Terms } from "../parts";
import type { DocSection } from "./types";

export const surface: DocSection = {
  id: "surface",
  title: "Canonical form and shorthand",
  lede: "Every declaration has one canonical form: the form serialization emits and the form tooling reads. Four kinds of declaration may also be written short, under a rule that follows directly from the epistemics above.",
  items: [
    { id: "canonical-form", title: "One form for tooling" },
    { id: "shorthand-rule", title: "What a shorthand may compress" },
    { id: "shorthand-forms", title: "The four shorthands" },
    { id: "shorthand-refused", title: "Where two readings collide" },
    { id: "shorthand-format", title: "Formatting expands it" },
  ],
  Body: () => (
    <>
      <Sub id="canonical-form" title="One form for tooling, another for the author">
        <Means>
          A shorthand is accepted on input. It is never a second representation of the model.
        </Means>
        <P>
          A shorthand is gone by the time a model exists: parsing produces the same structure either
          spelling was written in, and nothing downstream — the validator, the checker, the report, the
          graph this page draws — can tell which one the author typed. That is why compressing a
          declaration is a question about writing rather than about meaning, and why the rule below is
          about what a spelling may leave out, not about what it may say.
        </P>
      </Sub>

      <Sub id="shorthand-rule" title="What a shorthand may compress">
        <P>
          Three things, and nothing else. In each case the short spelling withholds no fact the canonical
          form states.
        </P>
        <Terms
          rows={[
            {
              term: "optional → ?",
              body: (
                <>
                  <strong>A total two-valued claim</strong> may become a marker. Optionality has exactly two
                  members and no epistemic one, so <Code>note: string?</Code> withholds nothing the long form
                  states.
                </>
              ),
            },
            {
              term: "[customer, id] → customer.id",
              body: (
                <>
                  <strong>A re-spelling</strong> may become a name. A field path is written the way it is
                  already rendered back — a diagnostic names <Code>customer.id</Code>, so a declaration may
                  too — and a value source states its kind and its id in one string.
                </>
              ),
            },
            {
              term: "{kind: literal, …} → pending",
              body: (
                <>
                  <strong>A discriminant the shape already carries</strong> may be dropped. A selector value
                  is a map when it is a reference and a scalar when it is a literal; nothing has to be
                  resolved to tell which, so naming it says nothing the shape has not.
                </>
              ),
            },
          ]}
        />
        <Callout variant="caution">
          A shorthand may never supply a value for a vocabulary carrying <Code>unspecified</Code>. Ordering,
          delivery, dispatch, idempotency, and derivation acquire no defaults from being written short,
          because a default would let silence be read as a fact — which is exactly what{" "}
          <strong>unknown is not false</strong> forbids. This is why <Code>optional</Code> may become a{" "}
          <Code>?</Code> while a value source's kind is always written out: the five sources are all ids,
          differing only in which namespace they name, so inferring one would silently pick a winner.
        </Callout>
      </Sub>

      <Sub id="shorthand-forms" title="The four shorthands">
        <Snippet>{`# a field and its type
fields:
  order_id: uuid             # scalar, required
  note: string?              # the ? marks the field optional
  customer: schema.Customer  # a non-scalar name is a schema
  items: [schema.LineItem]   # a list holds one element type
  tags: "[string]?"          # an optional list

# a field path, written the way it is read back
path: customer.id

# a value source, kind:id
- source: input:input.create_order.request
  path: idempotency_key

# a selector value: a map is a reference, a scalar is a literal
value: pending`}</Snippet>
        <P>
          The type grammar is <Code>scalar-name | schema-id | [type]</Code>, with an optional trailing{" "}
          <Code>?</Code> on the field as a whole. A name matching a scalar — <Code>string</Code>,{" "}
          <Code>bool</Code>, <Code>int</Code>, <Code>float</Code>, <Code>decimal</Code>, <Code>uuid</Code>,{" "}
          <Code>timestamp</Code> — is that scalar; every other name is a schema reference, so a mistyped
          scalar is not a parse error but a schema that fails to resolve, reported by validation as an
          unknown reference. A canonical schema with no prose may leave <Code>description</Code> out rather
          than declare an explicit null.
        </P>
        <P>
          The canonical form of every one of these is still accepted, and is what{" "}
          <Code>order_id: uuid</Code> expands to:
        </P>
        <Snippet>{`fields:
  order_id:
    ty:
      kind: scalar
      value: uuid
    optional: false`}</Snippet>
        <P>
          Both spellings are accepted everywhere, including inside each other: <Code>ty: [schema.Tag]</Code>{" "}
          may sit in the canonical map beside <Code>optional: true</Code>. The models in the catalogue are
          written short throughout.
        </P>
      </Sub>

      <Sub id="shorthand-refused" title="Where two readings collide">
        <P>
          Where two readings of a shorthand could collide, it does not pick between them: the spelling is
          either refused outright or reserved for one reading, and the canonical form states the other. What
          is turned away is a way of writing a declaration, never the declaration itself.
        </P>
        <Terms
          rows={[
            {
              term: "[string?]",
              body: (
                <>
                  <Code>?</Code> states optionality of the <em>field</em>, not of a type, so it may not
                  appear inside one. An optional list is <Code>"[string]?"</Code>.
                </>
              ),
            },
            {
              term: "schema id spelled like a scalar",
              body: (
                <>
                  Reserved, not refused: a bare name is read as a scalar first. A schema whose id collides
                  with a scalar name, or ends in <Code>?</Code>, is referred to in the canonical map form.
                </>
              ),
            },
            {
              term: "path component containing a dot",
              body: (
                <>
                  Reserved too: the dotted form splits at every dot, so a component that contains one is
                  written as a sequence of components instead.
                </>
              ),
            },
            {
              term: "value: input:…",
              body: (
                <>
                  A string literal opening with a value source kind —{" "}
                  <Code>value: input:input.transfer_stock.request</Code> — is almost certainly a reference
                  that lost its <Code>path</Code>. Reading it as the text it spells would quietly turn a
                  provenance-bearing comparison into a comparison with a constant, so it is refused and says
                  so. A string that genuinely spells one is declared in the canonical form.
                </>
              ),
            },
          ]}
        />
      </Sub>

      <Sub id="shorthand-format" title="Formatting expands it">
        <P>
          The editor's format button rewrites the model as archspec serializes it, which is the canonical
          form throughout — so the catalogue's models, written short, come back half again as long, with
          every field, path, value source, and selector value spelled out. That is not the button undoing the author's work: it
          is the one explicit shape the serialized model is required to have, and the same text the CLI
          writes. The shorthand is an input affordance, and there is nothing to serialize it back to.
        </P>
      </Sub>
    </>
  ),
};
