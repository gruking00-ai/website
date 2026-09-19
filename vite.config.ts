import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const backend = "http://127.0.0.1:6090"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": backend,
      "/event": backend,
      "/session": backend,
      "/project": backend,
      "/provider": backend,
      "/config": backend,
      "/global": backend,
      "/path": backend,
      "/agent": backend,
      "/command": backend,
      "/file": backend,
      "/find": backend,
      "/lsp": backend,
      "/mcp": backend,
      "/auth": backend,
      "/log": backend,
      "/tool": backend,
      "/experimental": backend,
      "/doc": backend,
      "/pty": backend,
      "/tui": backend,
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
})