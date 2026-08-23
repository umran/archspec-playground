import { Badge } from "@cloudflare/kumo/components/badge";
import { LayerCard } from "@cloudflare/kumo/components/layer-card";
import { Table } from "@cloudflare/kumo/components/table";
import { Tooltip } from "@cloudflare/kumo/components/tooltip";
import type { ReactNode } from "react";

/**
 * The document's formatting vocabulary.
 *
 * Every kind of fact gets one shape and keeps it, so the page can be
 * skimmed: what a declaration *is* (`Kind`), what the checker will and
 * will not do with it (`Scope`, `Routes`), what discharges an obligation
 * without any work at all (`Vacuous`), and what the reader must not
 * conflate (`Distinctions`). A section that invents its own presentation
 * for one of these is a section the reader has to re-learn.
 */

/* ---------------------------------------------------------------- *
 * Declaration categories (§1)                                       *
 * ---------------------------------------------------------------- */

export type Kind = "structure" | "guarantee" | "requirement";

const KIND: Record<Kind, { label: string; variant: "blue" | "teal" | "purple"; hint: string }> = {
  structure: {
    label: "structural fact",
    variant: "blue",
    hint: "Describes what the modeled program can do, or how entities relate. Always true of the model by construction.",
  },
  guarantee: {
    label: "implementation guarantee",
    variant: "teal",
    hint: "A fact the model claims the implementation or an external system provides. The checker may rely on it — the proof is then conditional on the implementation actually conforming.",
  },
  requirement: {
    label: "requirement",
    variant: "purple",
    hint: "A property the architecture says must hold. Declaring it does not make it true: the checker must prove it from facts and structure.",
  },
};

/** The category a declaration belongs to, with its meaning on hover. */
export function KindBadge({ kind }: { kind: Kind }) {
  const { label, variant, hint } = KIND[kind];
  return <Tooltip content={hint} render={<Badge variant={variant}>{label}</Badge>} />;
}

/* ---------------------------------------------------------------- *
 * Verdicts                                                          *
 * ---------------------------------------------------------------- */

export type Verdict = "proven" | "unknown" | "disproven";

const VERDICT: Record<Verdict, { variant: "success" | "warning" | "error"; glyph: string }> = {
  proven: { variant: "success", glyph: "✓" },
  unknown: { variant: "warning", glyph: "?" },
  disproven: { variant: "error", glyph: "✗" },
};

export function VerdictBadge({ verdict, children }: { verdict: Verdict; children?: ReactNode }) {
  const { variant, glyph } = VERDICT[verdict];
  return (
    <Badge variant={variant}>
      <span className="font-mono">{glyph}</span> {children ?? verdict}
    </Badge>
  );
}

/** Marks a rule as the V1 checker's, not the contract's. */
export function V1() {
  return (
    <Tooltip
      content="A rule of the current checker, not of the semantics contract. The contract states the obligation; V1 states one sufficient way to discharge it, and may be extended without the obligation changing."
      render={<Badge variant="neutral">V1</Badge>}
    />
  );
}

/* ---------------------------------------------------------------- *
 * Structure                                                         *
 * ---------------------------------------------------------------- */

export function Section({ id, title, lede, children }: { id: string; title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 border-t border-kumo-hairline pt-10 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-semibold tracking-tight text-kumo-strong">{title}</h2>
      {lede && <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-kumo-subtle">{lede}</p>}
      <div className="mt-6 space-y-8">{children}</div>
    </section>
  );
}

export function Sub({ id, title, aside, children }: { id: string; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-semibold text-kumo-strong">{title}</h3>
        {aside}
      </div>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

/** Body copy, held to a readable measure. */
export function P({ children }: { children: ReactNode }) {
  return <p className="max-w-[68ch] text-[15px] leading-relaxed text-kumo-default">{children}</p>;
}

/** The contract's own words for what a declaration means. */
export function Means({ children }: { children: ReactNode }) {
  return (
    <blockquote className="max-w-[68ch] border-l-2 border-kumo-brand py-1 pl-4 text-[15px] leading-relaxed text-kumo-strong">
      {children}
    </blockquote>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-kumo-tint px-1 py-0.5 font-mono text-[12.5px] text-kumo-default">{children}</code>
  );
}

export function Snippet({ children }: { children: string }) {
  return (
    <pre className="max-w-[68ch] overflow-x-auto rounded-md border border-kumo-hairline bg-kumo-elevated/40 p-3 font-mono text-[12.5px] leading-relaxed text-kumo-default">
      {children}
    </pre>
  );
}

/* ---------------------------------------------------------------- *
 * Callouts                                                          *
 * ---------------------------------------------------------------- */

const CALLOUT = {
  note: { label: "note", ring: "border-l-kumo-info", tone: "text-kumo-info" },
  caution: { label: "caution", ring: "border-l-kumo-warning", tone: "text-kumo-warning" },
  vacuous: { label: "vacuously discharged", ring: "border-l-kumo-success", tone: "text-kumo-success" },
  conditional: { label: "conditional on conformance", ring: "border-l-kumo-brand", tone: "text-kumo-brand" },
} as const;

export function Callout({ variant, children }: { variant: keyof typeof CALLOUT; children: ReactNode }) {
  const { label, ring, tone } = CALLOUT[variant];
  return (
    <div className={`max-w-[68ch] rounded-r-md border-l-2 bg-kumo-elevated/40 py-3 pl-4 pr-3 ${ring}`}>
      <div className={`text-[11px] font-semibold uppercase tracking-wider ${tone}`}>{label}</div>
      <div className="mt-1 text-sm leading-relaxed text-kumo-default">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- *
 * Verifier scope                                                    *
 * ---------------------------------------------------------------- */

export interface Route {
  name: ReactNode;
  detail: ReactNode;
}

/** What the checker accepts as a proof, and what it pointedly does not. */
export function Routes({ credited, refused }: { credited: Route[]; refused?: Route[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <RouteList
        title="Accepted proof routes"
        hint="Any one of these discharges the obligation."
        tone="success"
        routes={credited}
      />
      {refused && refused.length > 0 && (
        <RouteList
          title="Not credited"
          hint="Declarations that look like proofs and are not."
          tone="danger"
          routes={refused}
        />
      )}
    </div>
  );
}

function RouteList({
  title, hint, tone, routes,
}: { title: string; hint: string; tone: "success" | "danger"; routes: Route[] }) {
  const bar = tone === "success" ? "bg-kumo-success" : "bg-kumo-danger";
  return (
    <LayerCard className="p-4">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-0.5 rounded-full ${bar}`} />
        <h4 className="text-[13px] font-semibold text-kumo-strong">{title}</h4>
      </div>
      <p className="mt-1 text-xs text-kumo-subtle">{hint}</p>
      <ol className="mt-3 space-y-2.5">
        {routes.map((route, i) => (
          <li key={i} className="text-sm leading-relaxed text-kumo-default">
            <span className="font-medium text-kumo-strong">{route.name}</span>
            <span className="text-kumo-subtle"> — {route.detail}</span>
          </li>
        ))}
      </ol>
    </LayerCard>
  );
}

/** What the checker reads, and how far out from the operation it reaches. */
export function Scope({
  population, reads, reach,
}: { population: ReactNode; reads: ReactNode; reach: ReactNode }) {
  const rows: [string, string, ReactNode][] = [
    ["population", "which invocations the obligation constrains", population],
    ["evidence", "what the checker reads to decide", reads],
    ["reach", "how far past the operation it follows", reach],
  ];
  return (
    <LayerCard className="p-0">
      <Table>
        <Table.Header variant="compact">
          <Table.Row>
            <Table.Head className="w-[9rem]">scope</Table.Head>
            <Table.Head>what it covers</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map(([name, gloss, value]) => (
            <Table.Row key={name}>
              <Table.Cell className="align-top">
                <div className="font-mono text-[12.5px] text-kumo-strong">{name}</div>
                <div className="mt-0.5 text-xs text-kumo-subtle">{gloss}</div>
              </Table.Cell>
              <Table.Cell className="align-top text-sm leading-relaxed text-kumo-default">{value}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </LayerCard>
  );
}

/** A two-column table of things that must not be conflated. */
export function Distinctions({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <LayerCard className="p-0">
      <Table>
        <Table.Header variant="compact">
          <Table.Row>
            <Table.Head className="w-[18rem]">not interchangeable</Table.Head>
            <Table.Head>why</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map(([pair, why], i) => (
            <Table.Row key={i}>
              <Table.Cell className="align-top text-sm font-medium text-kumo-strong">{pair}</Table.Cell>
              <Table.Cell className="align-top text-sm leading-relaxed text-kumo-subtle">{why}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </LayerCard>
  );
}

/**
 * A definition list: the declaration, its category, and what it means.
 *
 * `term` is normally the declaration as it is written, set in mono. Pass
 * `badgeAsTerm` where the category *is* the thing being defined, so the
 * label is not printed twice in two typefaces.
 */
export function Terms({
  rows, badgeAsTerm = false,
}: { rows: { term: string; kind?: Kind; body: ReactNode }[]; badgeAsTerm?: boolean }) {
  return (
    <dl className="divide-y divide-kumo-hairline rounded-md border border-kumo-hairline">
      {rows.map((row) => (
        <div key={row.term} className="grid gap-1 p-3 sm:grid-cols-[14rem_1fr] sm:gap-4">
          <dt className="min-w-0">
            {badgeAsTerm && row.kind ? (
              <KindBadge kind={row.kind} />
            ) : (
              <>
                <div className="break-words font-mono text-[12.5px] font-semibold text-kumo-strong">{row.term}</div>
                {row.kind && (
                  <div className="mt-1.5">
                    <KindBadge kind={row.kind} />
                  </div>
                )}
              </>
            )}
          </dt>
          <dd className="min-w-0 break-words text-sm leading-relaxed text-kumo-default">{row.body}</dd>
        </div>
      ))}
    </dl>
  );
}
