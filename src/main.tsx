import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Root } from "./app/Root";
import "./index.css";
// The graph theme archspec-viz ships with, so the embedded views render
// exactly as they do in the HTML the CLI writes.
import "virtual:archspec-viz-theme.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
