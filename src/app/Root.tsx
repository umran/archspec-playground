import { useEffect } from "react";

import { Docs } from "../docs/Docs";
import { Workspace } from "./Workspace";
import { useView } from "./useView";

/** The two pages: the playground, and the semantics document. */
export function Root() {
  const [view, setView] = useView();

  useEffect(() => {
    document.title = view === "docs" ? "Archspec semantics" : "archspec playground";
  }, [view]);

  // Landing directly on a document anchor should open the document.
  useEffect(() => {
    if (view === "docs" && window.location.hash) {
      const id = window.location.hash.slice(1);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    }
  }, [view]);

  return view === "docs" ? <Docs onBack={() => setView("playground")} /> : <Workspace onOpenDocs={() => setView("docs")} />;
}
