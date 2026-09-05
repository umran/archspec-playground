import { Empty } from "@cloudflare/kumo/components/empty";
import { Loader } from "@cloudflare/kumo/components/loader";
import { GraphIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { memo } from "react";

import { App as VizApp } from "../../vendor/conseqa/viz/src/App";
import type { Theme } from "../../vendor/conseqa/viz/src/state/AppState";
import type { PageData } from "../analysis/types";

interface Props {
  page: PageData | null;
  /** The WebAssembly module is still loading. */
  booting: boolean;
  /** An analysis is pending, so "does not parse" is not yet known. */
  working: boolean;
  bootError: string | null;
  /** The colour mode; this app owns it, so the views follow it and
   *  render no toggle of their own. */
  theme: Theme;
}

/**
 * The conseqa-viz front end, mounted directly from the vendored source.
 *
 * It is the same React application `conseqa-viz` embeds in the HTML it
 * writes — the system graph, operation and machine views, the detail and
 * obligations panels — given the page data the WebAssembly build
 * produces instead of an injected `window.CONSEQA`. It is mounted once
 * and fed new data as the model changes, so selection, the open route,
 * and the canvas's pan and zoom survive every keystroke.
 *
 * The colour mode is passed in rather than left to the views: this app
 * has a control for it in its own header, and the views hide theirs when
 * given one, so the page has exactly one.
 */
export const VizPane = memo(function VizPane({ page, booting, working, bootError, theme }: Props) {
  if (bootError) {
    return (
      <Centered>
        <Empty
          icon={<WarningCircleIcon size={48} className="text-kumo-danger" />}
          title="conseqa could not be loaded"
          description={bootError}
        />
      </Centered>
    );
  }

  // Whether the model parses is only known once an analysis has come
  // back. Until then — booting, or the first run after a model opens —
  // say what is happening rather than blaming the source.
  if (!page) {
    return (
      <Centered>
        {booting || working ? (
          <div className="flex flex-col items-center gap-3">
            <Loader />
            <span className="text-sm text-kumo-subtle">
              {booting ? "loading the conseqa model checker…" : "analyzing the model…"}
            </span>
          </div>
        ) : (
          <Empty
            icon={<GraphIcon size={48} className="text-kumo-inactive" />}
            title="Nothing to visualize yet"
            description="The model does not parse. Fix the reported error and the visualization appears here."
          />
        )}
      </Centered>
    );
  }

  return (
    <div className="h-full min-h-0">
      <VizApp data={page} theme={theme} />
    </div>
  );
});

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full items-center justify-center bg-kumo-canvas p-6">{children}</div>;
}
