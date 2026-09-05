import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Workspace } from "./app/Workspace";
import "./index.css";
// The graph theme conseqa-viz ships with, so the embedded views render
// exactly as they do in the HTML the CLI writes.
import "virtual:conseqa-viz-theme.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Workspace />
  </StrictMode>,
);
