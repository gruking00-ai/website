import type { MessageRow } from "./types"

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function listSessions(): Promise<any[]> {
  return fetchJson("/session")
}

export async function getSession(id: string): Promise<any> {
  return fetchJson(`/session/${id}`)
}

export async function createSession(title?: string): Promise<any> {
  return fetchJson("/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title }),
  })
}

export async function deleteSession(id: string): Promise<boolean> {
  return fetchJson(`/session/${id}`, { method: "DELETE" })
}

export async function renameSession(id: string, title: string): Promise<any> {
  return fetchJson(`/session/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title }),
  })
}

export async function loadMessages(id: string): Promise<MessageRow[]> {
  return fetchJson(`/session/${id}/message`)
}

export async function sendPromptAsync(
  id: string,
  parts: { type: "text" | "file"; text?: string; mime?: string; filename?: string; url?: string }[],
  model?: { providerID: string; modelID: string },
) {
  await fetch(`/session/${id}/prompt_async`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      parts,
      ...(model ? { model } : {}),
    }),
  })
}

export async function abortSession(id: string): Promise<boolean> {
  return fetchJson(`/session/${id}/abort`, { method: "POST" })
}

export async function replyToPermission(
  sessionID: string,
  permissionID: string,
  response: "once" | "always" | "reject",
): Promise<boolean> {
  const res = await fetch(`/session/${sessionID}/permissions/${permissionID}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ response }),
  })
  if (!res.ok) throw new Error("permission reply failed")
  return true
}

export async function listProviders(): Promise<{ all: any[]; connected: string[]; default: Record<string, string> }> {
  return fetchJson("/provider")
}

export async function listProjects(): Promise<any[]> {
  return fetchJson("/project")
}

export async function currentPath(): Promise<{ worktree: string; directory: string }> {
  return fetchJson("/path")
}

export async function serverHealth(): Promise<{
  healthy: boolean
  starting: boolean
  serverUrl: string | null
  cwd: string | null
}> {
  const res = await fetch("/api/health")
  return res.json()
}

export async function switchProject(directory: string): Promise<{ ok: boolean; cwd: string }> {
  const res = await fetch("/api/switch-project", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ directory }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || "failed to switch project")
  }
  return res.json()
}

export async function uploadFile(file: File): Promise<{ id: string; name: string; mime: string; size: number; url: string }> {
  const res = await fetch("/api/upload", {
    method: "PUT",
    headers: {
      "content-type": "application/octet-stream",
      "x-filename": encodeURIComponent(file.name),
      "x-mime": encodeURIComponent(file.type || "application/octet-stream"),
    },
    body: file,
  })
  if (!res.ok) throw new Error("upload failed")
  return res.json()
}

export function partsOf(m: { info: any; parts: any[] }): { info: any; parts: any[] } {
  return m
}