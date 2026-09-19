export type {
  Part,
  TextPart,
  ReasoningPart,
  ToolPart,
  FilePart,
  Message,
  UserMessage,
  AssistantMessage,
  Session,
  Project,
  Provider,
  Model,
  Permission,
  Event,
  GlobalEvent,
  EventMessageUpdated,
  EventMessagePartUpdated,
  EventMessagePartRemoved,
  EventMessageRemoved,
  EventSessionCreated,
  EventSessionUpdated,
  EventSessionDeleted,
  EventSessionStatus,
  EventSessionIdle,
  EventSessionError,
  EventPermissionUpdated,
  EventPermissionReplied,
  SessionStatus,
  TextPartInput,
  FilePartInput,
} from "@opencode-ai/sdk"

export type PartInput = {
  type: "text" | "file"
  text?: string
  mime?: string
  filename?: string
  url?: string
}

export type AttachedFile = {
  id: string
  name: string
  mime: string
  url: string
  size: number
  preview?: string
}

export type MessageRow = {
  info: any
  parts: any[]
}

export type ModelOption = {
  providerID: string
  modelID: string
  name: string
  providerName: string
  connected: boolean
  attachment: boolean
  reasoning: boolean
}

export type BusyState = { [sessionID: string]: boolean }