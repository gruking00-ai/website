import { spawn, execFileSync } from "node:child_process"
import { existsSync, mkdirSync, createReadStream, createWriteStream } from "node:fs"
import { tmpdir } from "node:os"
import { join, dirname, resolve, basename, sep } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { randomBytes } from "node:crypto"
import net from "node:net"
import express from "express"
import httpProxy from "http-proxy"

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB_PORT = Number(process.env.OPENCODE_WEB_PORT || 6090)
const UPLOAD_DIR = join(tmpdir(), "opencode-web", "uploads")
mkdirSync(UPLOAD_DIR, { recursive: true })

const log = (...args) => console.log("[opencode-web]", ...args)
const err = (...args) => console.error("[opencode-web]", ...args)

function findOpenCodeBin() {
  try {
    const root = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim()
    const exe = join(root, "opencode-ai", "bin", "opencode.exe")
    if (existsSync(exe)) return exe
  } catch {
    /* fall through */
  }
  try {
    const res = execFileSync("where", ["opencode"], { encoding: "utf8" })
    for (const line of res.split(/\r?\n/)) {
      const t = line.trim()
      if (/\.exe$/i.test(t) && existsSync(t)) return t
    }
  } catch {
    /* fall through */
  }
  return "opencode"
}

const OPENCODE_BIN = findOpenCodeBin()

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.listen(0, "127.0.0.1", () => {
      const port = srv.address().port
      srv.close(() => resolve(port))
    })
    srv.on("error", reject)
  })
}

const state = {
  proc: null,
  url: null,
  cwd: null,
  port: null,
  starting: false,
}

function startOpenCode(cwd) {
  state.starting = true
  return new Promise(async (resolve, reject) => {
    try {
      const port = state.port ?? (state.port = await freePort())
      const bin = OPENCODE_BIN
      log("starting opencode server:", bin, `(port ${port})`)
      const proc = spawn(bin, ["serve", `--port=${port}`, "--hostname=127.0.0.1"], {
        cwd,
        env: { ...process.env },
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      })
      state.proc = proc

      let output = ""
      let done = false
      const timer = setTimeout(() => {
        if (!done) {
          done = true
          try {
            proc.kill()
          } catch {
            /* ignore */
          }
          reject(new Error(`Timed out waiting for opencode server (cwd: ${cwd})`))
        }
      }, 20000)

      const onData = (chunk) => {
        if (done) return
        output += chunk.toString()
        for (const line of output.split("\n")) {
          const m = line.match(/opencode server listening on\s+(https?:\/\/[^\s]+)/i)
          if (m) {
            done = true
            clearTimeout(timer)
            state.url = m[1]
            state.cwd = cwd
            state.starting = false
            state.proc = proc
            log("opencode server listening on", state.url, "(cwd:", cwd + ")")
            output = ""
            resolve()
            return
          }
        }
        if (output.length > 4000) output = output.slice(-2000)
      }

      proc.stdout?.on("data", onData)
      proc.stderr?.on("data", (chunk) => {
        const text = chunk.toString().trim()
        if (text) err("opencode:", text)
        onData(chunk)
      })
      proc.on("error", (e) => {
        if (!done) {
          done = true
          clearTimeout(timer)
          reject(e)
        }
      })
      proc.on("exit", (code) => {
        if (!done) {
          done = true
          clearTimeout(timer)
          reject(new Error(`opencode server exited with code ${code}`))
        }
      })
    } catch (e) {
      state.starting = false
      reject(e)
    }
  })
}

async function stopOpenCode() {
  if (state.proc) {
    try {
      state.proc.kill()
    } catch {
      /* ignore */
    }
    state.proc = null
  }
  state.url = null
}

async function switchProject(cwd) {
  await stopOpenCode()
  state.port = null
  await startOpenCode(cwd)
  return state
}

const app = express()
app.disable("x-powered-by")

const proxy = httpProxy.createProxyServer({})

const password = process.env.OPENCODE_SERVER_PASSWORD
const username = process.env.OPENCODE_SERVER_USERNAME || "opencode"
proxy.on("proxyReq", (proxyReq) => {
  if (password && !proxyReq.getHeader("authorization")) {
    proxyReq.setHeader(
      "Authorization",
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
    )
  }
})
proxy.on("error", (_e, _req, res) => {
  if (res && !res.headersSent) {
    res.writeHead(502, { "content-type": "application/json" })
    res.end(JSON.stringify({ error: "opencode server not reachable" }))
  }
})

app.use(express.json({ limit: "1mb" }))

app.get("/api/health", (_req, res) => {
  res.json({
    healthy: !!state.url,
    starting: state.starting,
    version: null,
    serverUrl: state.url,
    cwd: state.cwd,
  })
})

app.get("/api/uploads/:name", (req, res) => {
  const name = basename(req.params.name)
  const file = join(UPLOAD_DIR, name)
  if (!existsSync(file)) return res.status(404).json({ error: "not found" })
  res.sendFile(file)
})

app.put("/api/upload", (req, res) => {
  const filename = String(req.headers["x-filename"] || "file")
  const mime = String(req.headers["x-mime"] || "application/octet-stream")
  const safe = randomBytes(6).toString("hex") + "-" + basename(filename).replace(/[^\w.\- ]+/g, "_")
  const file = join(UPLOAD_DIR, safe)
  const out = createWriteStream(file)
  req.on("error", () => out.destroy())
  out.on("error", () => res.status(500).json({ error: "write failed" }))
  out.on("finish", () => {
    res.json({
      id: safe,
      filename,
      mime,
      size: out.bytesWritten,
      url: pathToFileURL(file).href,
    })
  })
  req.pipe(out)
})

app.post("/api/switch-project", async (req, res) => {
  const directory = String(req.body?.directory || "").trim()
  if (!directory) return res.status(400).json({ error: "directory is required" })
  const resolved = resolve(directory)
  if (!existsSync(resolved)) return res.status(400).json({ error: "directory does not exist: " + resolved })
  try {
    const result = await switchProject(resolved)
    res.json({ ok: true, serverUrl: result.url, cwd: result.cwd })
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
})

app.post("/api/stop", async (_req, res) => {
  await stopOpenCode()
  res.json({ ok: true })
})

const apiProxy = (req, res) => {
  if (!state.url) {
    res.status(503).json({ error: "opencode server is starting...", starting: state.starting })
    return
  }
  proxy.web(req, res, { target: state.url, changeOrigin: false, xfwd: false })
}
proxy.on("error", (e) => err("proxy error:", e.message))

for (const prefix of [
  "/event",
  "/session",
  "/project",
  "/provider",
  "/config",
  "/global",
  "/path",
  "/agent",
  "/command",
  "/file",
  "/find",
  "/lsp",
  "/mcp",
  "/auth",
  "/log",
  "/tool",
  "/experimental",
  "/doc",
  "/pty",
  "/tui",
]) {
  app.use(prefix, apiProxy)
}

const dist = join(__dirname, "..", "dist")
if (existsSync(join(dist, "index.html"))) {
  app.use(express.static(dist))
  app.get("*", (_req, res) => res.sendFile(join(dist, "index.html")))
}

app.use((req, res) => {
  res.status(404).json({ error: "not found", path: req.path })
})

async function main() {
  const startCwd = process.cwd()
  try {
    await startOpenCode(startCwd)
  } catch (e) {
    err("failed to start opencode server:", e.message)
    err("make sure `opencode` is installed and on PATH (npm install -g opencode-ai)")
    process.exit(1)
  }

  const srv = app.listen(WEB_PORT, "127.0.0.1", () => {
    log(`OpenCode web running at   http://localhost:${WEB_PORT}`)
    log(`proxying to opencode at   ${state.url}`)
    log(`working directory:        ${state.cwd}`)
  })

  const shutdown = async () => {
    log("shutting down...")
    await stopOpenCode()
    srv.close(() => process.exit(0))
    setTimeout(() => process.exit(0), 2000)
  }
  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)
}

main()