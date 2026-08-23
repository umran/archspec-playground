import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const VIZ_THEME_ID = "virtual:archspec-viz-theme.css";
const VIZ_THEME_FILE = resolve("vendor/archspec/viz/src/index.css");

/**
 * The graph theme the archspec-viz front end ships with, served as plain
 * CSS. The vendored file also carries the Tailwind and Kumo setup an app
 * entry point needs; this project's own `src/index.css` does that once,
 * so those directives are dropped here rather than duplicating Tailwind's
 * whole utility layer. Everything below them — the `--arch-*` tokens and
 * the `.arch-*` rules the SVG views depend on — is used verbatim, so the
 * visualization keeps looking exactly as archspec renders it.
 */
function vizTheme(): Plugin {
  const load = () =>
    readFileSync(VIZ_THEME_FILE, "utf8")
      .split("\n")
      .filter((line: string) => !/^\s*@(source|import)\b/.test(line))
      .join("\n");

  return {
    name: "archspec-viz-theme",
    resolveId: (id) => (id === VIZ_THEME_ID ? "\0" + VIZ_THEME_ID : null),
    load: (id) => (id === "\0" + VIZ_THEME_ID ? load() : null),
    configureServer(server) {
      server.watcher.add(VIZ_THEME_FILE);
      server.watcher.on("change", (file) => {
        if (resolve(file) !== VIZ_THEME_FILE) return;
        const module = server.moduleGraph.getModuleById("\0" + VIZ_THEME_ID);
        if (module) server.reloadModule(module);
      });
    },
  };
}

/** The vendored archspec commit, shown in the app footer. */
function archspecRevision(): string {
  try {
    return execSync("git -C vendor/archspec rev-parse --short HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

// Everything runs client-side: the Rust pipeline is a WebAssembly module
// loaded by a worker, and the build is a static site. It is published at
// the root of its own domain, so the default base is right; BASE_PATH is
// there for serving it from a sub-path instead.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), tailwindcss(), vizTheme()],
  define: {
    __ARCHSPEC_REV__: JSON.stringify(archspecRevision()),
  },
  resolve: {
    // The viz front end is imported from the vendored tree, which grows
    // its own `node_modules` as soon as anyone builds it there. These
    // packages must stay single instances all the same: two Reacts break
    // hooks outright, and two Kumos would mean two provider contexts.
    dedupe: ["react", "react-dom", "@cloudflare/kumo", "@phosphor-icons/react"],
  },
  worker: {
    format: "es",
  },
  build: {
    target: "es2022",
    // The largest chunk is Kumo itself, which the app needs in full on
    // first paint; splitting it further would only add round trips.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split the stable third-party layers from the app so a change
        // to the demo does not invalidate the editor or the UI library
        // in visitors' caches.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react";
          if (id.includes("@codemirror") || id.includes("@lezer")) return "editor";
          if (id.includes("@cloudflare/kumo") || id.includes("@base-ui") || id.includes("motion")) {
            return "kumo";
          }
        },
      },
    },
  },
  optimizeDeps: {
    // The viz front end is imported straight from the vendored source
    // tree; scanning it up front avoids a dependency re-bundle mid-session.
    entries: ["index.html", "vendor/archspec/viz/src/**/*.{ts,tsx}"],
  },
});
