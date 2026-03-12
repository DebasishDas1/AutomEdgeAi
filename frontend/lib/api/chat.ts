// lib/api/chat.ts
// All chat API calls go through here.
// Set NEXT_PUBLIC_API_URL in .env.local (dev) or Vercel env vars (prod).
//
// .env.local (local dev):
//   NEXT_PUBLIC_API_URL=http://localhost:8000
//
// Vercel dashboard (production):
//   NEXT_PUBLIC_API_URL=https://automedge-backend.onrender.com

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

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${detail}`);
  }
  return res.json();
}

// Maps "general" to "hvac" — backend has no /general vertical
const toApiVertical = (v: string) => (v === "general" ? "hvac" : v);

export const startChatSession = (vertical: string, source = "web_chat") =>
  post<StartChatResponse>(
    `/api/v1/chat/${toApiVertical(vertical)}/start`,
    { source }
  );

export const sendChatMessage = (
  vertical:   string,
  session_id: string,
  message:    string
) =>
  post<SendMessageResponse>(
    `/api/v1/chat/${toApiVertical(vertical)}/message`,
    { session_id, message }
  );