import { useEffect, useRef, useState } from "react"
import { listSessions, createSession, loadMessages, sendPromptAsync, serverHealth, uploadFile, listProviders } from "./lib/api"
import type { Session, MessageRow, AttachedFile, Event, GlobalEvent } from "./lib/types"
import { cn, dayLabel, truncate } from "./lib/util"
import { IconPlus, IconSend, IconPaperclip } from "./components/icons"

export default function App() {
  const [healthy, setHealthy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [composerText, setComposerText] = useState("")
  const [attachments, setAttachments] = useState<AttachedFile[]>([])
  const [sending, setSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await serverHealth()
        setHealthy(health.healthy)
        if (health.healthy) {
          const [sesh, prov] = await Promise.all([listSessions(), listProviders()])
          setSessions(sesh.sort((a, b) => (b.time.updated ?? 0) - (a.time.updated ?? 0)))
          setProviders(prov.all || [])
          if (prov.default && Object.keys(prov.default).length > 0) {
            const [provId, modelId] = Object.entries(prov.default)[0] as [string, string]
            setSelectedModel(`${provId}/${modelId}`)
          }
          setLoading(false)
          subscribeToEvents()
        }
      } catch (e) {
        console.error("Health check failed:", e)
        setTimeout(checkHealth, 2000)
      }
    }
    checkHealth()
    return () => {
      eventSourceRef.current?.close()
    }
  }, [])

  const subscribeToEvents = () => {
    if (eventSourceRef.current) return
    try {
      const es = new EventSource("/event")
      eventSourceRef.current = es
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as GlobalEvent
          handleEvent(data.payload)
        } catch {}
      }
      es.onerror = () => {
        es.close()
        eventSourceRef.current = null
      }
    } catch {}
  }

  const handleEvent = (evt: Event) => {
    if (evt.type === "session.created" || evt.type === "session.updated") {
      setSessions((s) => {
        const idx = s.findIndex((x) => x.id === (evt as any).properties?.info?.id)
        if (idx >= 0) {
          const newS = [...s]
          newS[idx] = (evt as any).properties.info
          return newS.sort((a, b) => (b.time.updated ?? 0) - (a.time.updated ?? 0))
        }
        return [...s, (evt as any).properties.info].sort((a, b) => (b.time.updated ?? 0) - (a.time.updated ?? 0))
      })
    }
    if (evt.type === "message.part.updated") {
      const part = (evt as any).properties.part
      setMessages((m) => {
        const msgIdx = m.findIndex((x) => x.info.id === part.messageID)
        if (msgIdx < 0) return m
        const msg = m[msgIdx]
        const partIdx = msg.parts.findIndex((p) => p.id === part.id)
        const newParts = [...msg.parts]
        if (partIdx >= 0) {
          newParts[partIdx] = part
        } else {
          newParts.push(part)
        }
        const newM = [...m]
        newM[msgIdx] = { ...msg, parts: newParts }
        return newM
      })
    }
    chatEndRef.current?.scrollIntoView({ behavior: "auto" })
  }

  const handleNewChat = async () => {
    try {
      const s = await createSession()
      setSessions((prev) => [s, ...prev])
      setCurrentSession(s)
      setMessages([])
      setComposerText("")
      setAttachments([])
    } catch (e) {
      console.error("Failed to create session:", e)
    }
  }

  const handleSelectSession = async (s: Session) => {
    setCurrentSession(s)
    try {
      const msgs = await loadMessages(s.id)
      setMessages(msgs.sort((a, b) => (a.info.time.created ?? 0) - (b.info.time.created ?? 0)))
    } catch (e) {
      console.error("Failed to load messages:", e)
    }
  }

  const handleFileSelect = async (file: File) => {
    try {
      const uploaded = await uploadFile(file)
      setAttachments((prev) => [...prev, { id: uploaded.id, name: uploaded.name, mime: uploaded.mime, url: uploaded.url, size: uploaded.size }])
    } catch (e) {
      console.error("Upload failed:", e)
    }
  }

  const handleSend = async () => {
    if (!composerText.trim() && attachments.length === 0) return
    if (!currentSession) return

    setSending(true)
    try {
      const parts: any[] = []
      if (composerText.trim()) {
        parts.push({ type: "text", text: composerText })
      }
      parts.push(...attachments.map((a) => ({ type: "file", mime: a.mime, filename: a.name, url: a.url })))

      const [provId, modelId] = selectedModel.split("/")
      await sendPromptAsync(currentSession.id, parts, provId && modelId ? { providerID: provId, modelID: modelId } : undefined)

      setComposerText("")
      setAttachments([])
    } catch (e) {
      console.error("Send failed:", e)
    } finally {
      setSending(false)
    }
  }

  if (loading || !healthy) {
    return (
      <div className="connection-screen">
        <div className="connection-spinner" />
        <div className="connection-status">Connecting to OpenCode server...</div>
      </div>
    )
  }

  const groupedSessions = sessions.reduce(
    (acc, s) => {
      const label = dayLabel(s.time.updated || s.time.created)
      if (!acc[label]) acc[label] = []
      acc[label].push(s)
      return acc
    },
    {} as Record<string, Session[]>,
  )

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">✳ OpenCode</span>
        </div>
        <div className="sidebar-content">
          <button className="new-chat-btn" onClick={handleNewChat}>
            <IconPlus size={16} />
            New chat
          </button>

          {Object.entries(groupedSessions).map(([label, items]) => (
            <div key={label}>
              <div style={{ fontSize: "11px", color: "var(--text-faint)", padding: "8px 12px", marginTop: "12px" }}>{label}</div>
              {items.map((s) => (
                <div
                  key={s.id}
                  className={cn("session-item", currentSession?.id === s.id && "active")}
                  onClick={() => handleSelectSession(s)}
                  title={s.title}
                >
                  {truncate(s.title, 30)}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div>OpenCode v1.18.31</div>
          <div style={{ marginTop: "4px", fontSize: "11px" }}>Ready</div>
        </div>
      </div>

      <div className="main">
        <div className="main-header">
          <div className="main-title">{currentSession?.title || "Select a chat"}</div>
          <div className="model-selector">
            {providers.find((p) => selectedModel.startsWith(p.id + "/"))?.models?.[selectedModel.split("/")[1]]?.name || "Auto"}
          </div>
        </div>

        <div className="chat-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✳</div>
              <div className="empty-state-title">Let's build something</div>
              <div className="empty-state-cards">
                <div className="empty-state-card" onClick={() => setComposerText("Explain this project")}>
                  Explain this project
                </div>
                <div className="empty-state-card" onClick={() => setComposerText("Find and fix bugs")}>
                  Find and fix bugs
                </div>
                <div className="empty-state-card" onClick={() => setComposerText("Write tests")}>
                  Write tests
                </div>
                <div className="empty-state-card" onClick={() => setComposerText("Generate documentation")}>
                  Generate docs
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.info.id} className={cn("message", msg.info.role === "user" ? "user" : "assistant")}>
                <div className="message-content">
                  {msg.parts
                    .filter((p) => p.type === "text")
                    .map((p) => (
                      <div key={p.id}>{(p as any).text || ""}</div>
                    ))}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="loading">
              <div className="spinner" />
              OpenCode is thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="composer">
          {attachments.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {attachments.map((a) => (
                <div key={a.id} className="attachment-chip">
                  {truncate(a.name, 20)}
                  <button className="attachment-chip-remove" onClick={() => setAttachments((p) => p.filter((x) => x.id !== a.id))}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <textarea
              className="composer-textarea"
              placeholder="Ask something..."
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <button className="send-btn" onClick={handleSend} disabled={sending || (!composerText.trim() && attachments.length === 0)}>
              <IconSend size={16} />
            </button>
          </div>
          <div className="composer-actions">
            <div className="composer-left">
              <button className="composer-btn" onClick={() => fileInputRef.current?.click()}>
                <IconPaperclip size={16} />
                Attach
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => {
                  Array.from(e.currentTarget.files || []).forEach(handleFileSelect)
                  e.currentTarget.value = ""
                }}
              />
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-faint)" }}>OpenCode can make mistakes</div>
          </div>
        </div>
      </div>
    </div>
  )
}
