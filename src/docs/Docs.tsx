import { Button } from "@cloudflare/kumo/components/button";
import { Sidebar } from "@cloudflare/kumo/components/sidebar";
import { TableOfContents } from "@cloudflare/kumo/components/table-of-contents";
import { Tooltip, TooltipProvider } from "@cloudflare/kumo/components/tooltip";
import { ArrowLeftIcon, GithubLogoIcon, MoonIcon, SidebarSimpleIcon, SunIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { useTheme } from "../app/theme";
import { useMediaQuery } from "../app/useMediaQuery";
import { Section } from "./parts";
import { SECTIONS } from "./sections";

const REPO = "https://github.com/umran/archspec";
const SEMANTICS = "https://github.com/umran/archspec/blob/master/ARCHSPEC_DSL_SEMANTICS.md";

const ALL_IDS = SECTIONS.flatMap((section) => [section.id, ...section.items.map((item) => item.id)]);

/**
 * Highlights the heading the reader is at.
 *
 * The topmost section whose start has passed the reading line wins, so
 * the mark tracks what is being read rather than whatever happens to be
 * intersecting — which for short sections is several at once.
 */
function useActiveSection(scroller: HTMLElement | null): string {
  const [active, setActive] = useState(ALL_IDS[0]);

  useEffect(() => {
    if (!scroller) return;

    const pick = () => {
      const line = scroller.getBoundingClientRect().top + 96;
      let current = ALL_IDS[0];
      for (const id of ALL_IDS) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= line) current = id;
      }
      setActive(current);
    };

    pick();
    scroller.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      scroller.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [scroller]);

  return active;
}

export function Docs({ onBack }: { onBack: () => void }) {
  // A contents entry pointing at no heading, or a heading in no entry,
  // is exactly how a section goes missing without anyone noticing.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const missing = ALL_IDS.filter((id) => !document.getElementById(id));
    if (missing.length) console.warn("docs: contents entries with no section:", missing);
    const listed = new Set(ALL_IDS);
    const unlisted = [...document.querySelectorAll("section[id]")]
      .map((el) => el.id)
      .filter((id) => !listed.has(id));
    if (unlisted.length) console.warn("docs: sections missing from the contents:", unlisted);
  }, []);

  const [theme, setTheme] = useTheme();
  const wide = useMediaQuery("(min-width: 900px)");
  // Open beside the text where there is room for both, shut where the
  // two would have to share 375px.
  const [navOpen, setNavOpen] = useState(() => window.matchMedia("(min-width: 900px)").matches);
  const [scroller, setScroller] = useState<HTMLElement | null>(null);
  const active = useActiveSection(scroller);

  // Follow the breakpoint when it is crossed, but not otherwise: a
  // deliberate close on a wide screen should survive a scroll or a
  // re-render, and only a change of layout should overrule it.
  const wasWide = useRef(wide);
  useEffect(() => {
    if (wasWide.current !== wide) {
      wasWide.current = wide;
      setNavOpen(wide);
    }
  }, [wide]);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    // The hash is free here — the visualization, which owns it in the
    // playground, is not mounted on this page.
    history.replaceState(null, "", `?view=docs#${id}`);
    // Narrow, the contents cover the text they navigate: getting there
    // means getting them out of the way.
    if (!wide) setNavOpen(false);
  };

  const nav = (
    <nav aria-label="Document contents" className="h-full w-72 max-w-full overflow-y-auto px-3 py-4">
      <TableOfContents>
        <TableOfContents.Title>On this page</TableOfContents.Title>
        <TableOfContents.List>
          {SECTIONS.map((group) => (
            <TableOfContents.Group
              key={group.id}
              label={group.title}
              active={active === group.id}
              href={`#${group.id}`}
              onClick={(event: React.MouseEvent) => {
                event.preventDefault();
                go(group.id);
              }}
            >
              {group.items.map((item) => (
                <TableOfContents.Item
                  key={item.id}
                  active={active === item.id}
                  className="cursor-pointer"
                  onClick={() => go(item.id)}
                >
                  {item.title}
                </TableOfContents.Item>
              ))}
            </TableOfContents.Group>
          ))}
        </TableOfContents.List>
      </TableOfContents>
    </nav>
  );

  const body = (
    <main ref={setScroller} className="min-w-0 flex-1 overflow-y-auto">
      <div className="max-w-[60rem] px-5 py-10 sm:px-8 lg:px-12">
        <header className="pb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-kumo-strong">Archspec semantics</h1>
          <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-kumo-subtle">
            What each declaration in the DSL means, what it does not mean, and — for every operation
            requirement — exactly what the model checker examines before it will call the obligation proven,
            including how far upstream and downstream it follows the work.
          </p>
          <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-kumo-inactive">
            Condensed from the normative contract,{" "}
            <a className="text-kumo-link hover:underline" href={SEMANTICS} target="_blank" rel="noreferrer noopener">
              ARCHSPEC_DSL_SEMANTICS.md
            </a>
            , which remains the source of truth where the two differ.
          </p>
        </header>

        <div className="space-y-10 pb-24">
          {SECTIONS.map((section) => (
            <Section key={section.id} id={section.id} title={section.title} lede={section.lede}>
              <section.Body />
            </Section>
          ))}
        </div>
      </div>
    </main>
  );

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 flex-col bg-kumo-canvas text-kumo-default">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-kumo-hairline bg-kumo-base px-3 sm:gap-3 sm:px-4">
          <Tooltip
            content={navOpen ? "Hide the contents" : "Show the contents"}
            render={
              <Button
                variant="ghost"
                size="sm"
                shape="square"
                icon={SidebarSimpleIcon}
                aria-label={navOpen ? "Hide the contents" : "Show the contents"}
                aria-expanded={navOpen}
                className={`-ml-1 shrink-0 ${navOpen ? "" : "text-kumo-inactive"}`}
                onClick={() => setNavOpen((open) => !open)}
              />
            }
          />
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="font-semibold tracking-tight text-kumo-strong">archspec</span>
            <span className="truncate text-sm text-kumo-subtle">semantics</span>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <Button variant="secondary" size="sm" icon={ArrowLeftIcon} onClick={onBack}>
              <span className="hidden sm:inline">Playground</span>
            </Button>
            <Tooltip
              content={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  shape="square"
                  icon={theme === "dark" ? SunIcon : MoonIcon}
                  aria-label="Toggle color mode"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                />
              }
            />
            <Tooltip
              content="archspec on GitHub"
              render={
                <a
                  href={REPO}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="archspec on GitHub"
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-kumo-subtle transition-colors hover:bg-kumo-tint hover:text-kumo-default"
                >
                  <GithubLogoIcon size={17} />
                </a>
              }
            />
          </div>
        </header>

        {wide ? (
          <Sidebar.Provider
            contained
            side="left"
            collapsible="offcanvas"
            open={navOpen}
            onOpenChange={setNavOpen}
            mobileBreakpoint={1}
            className="min-h-0 flex-1"
          >
            <Sidebar contentClassName="whitespace-normal">{nav}</Sidebar>
            {body}
          </Sidebar.Provider>
        ) : (
          /* Narrow, the contents overlay the text rather than share the
             width with it: at 375px a 288px rail would leave the prose
             a column one word wide. */
          <div className="relative flex min-h-0 flex-1">
            {body}
            {navOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close the contents"
                  className="absolute inset-0 z-20 bg-kumo-overlay"
                  onClick={() => setNavOpen(false)}
                />
                <div className="absolute inset-y-0 left-0 z-30 w-72 max-w-[85%] border-r border-kumo-hairline bg-kumo-base shadow-xl">
                  {nav}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
