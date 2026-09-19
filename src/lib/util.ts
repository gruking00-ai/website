export function cn(...args: (string | false | null | undefined)[]): string {
  return args.filter(Boolean).join(" ")
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const DAY = 24 * 60 * 60 * 1000

export function dayLabel(timestamp: number, now = Date.now()): string {
  const d = new Date(timestamp)
  const today = new Date(now)
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diff = Math.round((startOfToday - startOfDay) / DAY)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  if (diff < 7) return "Previous 7 days"
  if (diff < 30) return "Previous 30 days"
  return "Earlier"
}

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
  if (sameDay) return time
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${time}`
}

export function truncate(text: string, n = 60): string {
  const t = text.replace(/\s+/g, " ").trim()
  return t.length > n ? t.slice(0, n) + "…" : t
}

export function prettyJSON(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function basename(p: string): string {
  const parts = p.split(/[\\/]/)
  return parts[parts.length - 1] || p
}

export function fileIcon(mime: string): "file" | "code" | "image" | "text" {
  if (mime.startsWith("image/")) return "image"
  const code = ["json", "javascript", "typescript", "sql", "xml", "html", "css", "markdown", "text/x-"]
  if (mime.startsWith("text/") || code.some((c) => mime.includes(c))) return "code"
  return "file"
}