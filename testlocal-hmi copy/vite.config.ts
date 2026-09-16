import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const sdkRoot = fileURLToPath(new URL("../custom-hmi-sdk/src", import.meta.url));
const HMI_BASE = "/custom-hmi/";

function redirectRootToBase(): Plugin {
  return {
    name: "redirect-root-to-hmi-base",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "/";
        const q = url.includes("?") ? url.slice(url.indexOf("?")) : "";
        const path = url.split("?")[0] ?? "/";
        if (
          path === "/" ||
          path === "/index.html" ||
          path === "/custom-hmi" ||
          path === "/custom-hmi/custom-hmi" ||
          path === "/custom-hmi/custom-hmi/"
        ) {
          res.statusCode = 302;
          res.setHeader("Location", `${HMI_BASE}${q}`);
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: HMI_BASE,
  plugins: [react(), redirectRootToBase()],
  resolve: {
    alias: {
      "@neuraverse/custom-hmi-sdk/platform": `${sdkRoot}/platform.ts`,
      "@neuraverse/custom-hmi-sdk/runtime": `${sdkRoot}/runtime.ts`,
    },
  },
  server: {
    host: true,
    port: 5175,
    proxy: {
      "/envoy/project": {
        target: "https://app.dev.neuraverse.com",
        changeOrigin: true,
        secure: true,
      },
      "/envoy/node-engine": {
        target: process.env.NEURA_NODE_ENGINE || "http://127.0.0.1:8092",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/envoy\/node-engine/, ""),
      },
      "/http": {
        target: "https://app.dev.neuraverse.com",
        changeOrigin: true,
        secure: true,
      },
    },
    fs: {
      allow: [fileURLToPath(new URL("..", import.meta.url))],
    },
  },
});
