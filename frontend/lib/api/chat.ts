// lib/api/chat.ts
// All chat API calls go through here.
//
// .env.local:        NEXT_PUBLIC_API_URL=http://localhost:8000
// Vercel dashboard:  NEXT_PUBLIC_API_URL=https://automedge-backend.onrender.com

const baseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "https://automedge-backend.onrender.com";

export interface StartChatResponse {
  session_id: string;
  vertical:   string;
  turn:       number;
}

export interface SendMessageResponse {
  session_id:       string;
  message:          string;
  turn:             number;
  is_complete:      boolean;
  appt_booked:      boolean;
  fields_collected: Record<string, unknown>;
}

// Typed API error so callers can distinguish network vs HTTP failures
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(`${status}: ${detail}`);
    this.name = "ApiError";
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
// FIX: added AbortController + timeout so a hung Render.com cold-start doesn't
// freeze the UI forever. Default 15 s — generous enough for cold starts.
// FIX: throws ApiError (typed) instead of bare Error so callers can branch on
// status code (e.g. show "session expired" on 404, not generic error message).

async function post<T>(
  path: string,
  body: unknown,
  timeoutMs = 15_000,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
      signal:  controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => res.statusText);
      throw new ApiError(res.status, detail);
    }

    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // AbortError from timeout or network failure
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(408, "Request timed out. The server may be waking up — try again.");
    }
    throw new ApiError(0, err instanceof Error ? err.message : "Network error");
  } finally {
    clearTimeout(timer);
  }
}

// Maps "general" → "hvac" — backend has no /general vertical
const toApiVertical = (v: string) => (v === "general" ? "hvac" : v);

// ── API calls ─────────────────────────────────────────────────────────────────

export const startChatSession = (
  vertical: string,
  userInfo?: { name: string; email: string; phone: string },
  source = "web_chat",
) =>
  post<StartChatResponse>(
    `/api/v1/chat/${toApiVertical(vertical)}/start`,
    { source, ...userInfo },
    20_000, // longer timeout for session start (cold start on Render)
  );

export const sendChatMessage = (
  vertical:   string,
  session_id: string,
  message:    string,
) =>
  post<SendMessageResponse>(
    `/api/v1/chat/${toApiVertical(vertical)}/message`,
    { session_id, message },
  );

export interface MessageMetadata {
  is_complete:      boolean;
  turn:             number;
  appt_booked:      boolean;
  fields_collected: Record<string, unknown>;
}

/**
 * SSE streaming wrapper for chat messages.
 */
export async function streamChatMessage(
  vertical:   string,
  session_id: string,
  message:    string,
  onChunk:    (chunk: string) => void,
  onMetadata: (meta: MessageMetadata) => void,
) {
  const res = await fetch(`${baseUrl()}/api/v1/chat/${toApiVertical(vertical)}/message/stream`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ session_id, message }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, detail);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("Stream reader not available");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    // SSE emits chunks separated by double newline
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() || ""; // last piece might be partial

    for (const chunk of chunks) {
      const line = chunk.trim();
      if (!line.startsWith("data: ")) continue;
      
      const raw = line.slice(6).trim();
      if (raw === "[DONE]") return;

      try {
        const payload = JSON.parse(raw);
        if (payload.chunk) {
          onChunk(payload.chunk);
        } else if (payload.metadata) {
          onMetadata(payload.metadata);
        } else if (payload.error) {
          throw new Error(payload.error);
        }
      } catch (e) {
        console.warn("Failed to parse SSE payload", e);
      }
    }
  }
}