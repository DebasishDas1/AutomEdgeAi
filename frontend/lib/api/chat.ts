// front end

// lib/api/chat.ts

const getApiBase = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface StartChatResponse {
    session_id: string;
    vertical: string;
    message: string;
    turn: number;
}

export interface SendMessageResponse {
    session_id: string;
    message: string;
    turn: number;
    is_complete: boolean;
    appt_booked: boolean;
    fields_collected: Record<string, any>;
}

export async function startChatSession(
  vertical: string,
  source: string = 'web_chat'
): Promise<StartChatResponse> {

  const apiBase = getApiBase()

  const res = await fetch(`${apiBase}/api/v1/chat/${vertical}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source })
  })

  if (!res.ok) {
    throw new Error(`Failed to start chat: ${res.statusText}`)
  }

  return res.json()
}


export async function sendChatMessage(
  vertical: string,
  sessionId: string,
  message: string
): Promise<SendMessageResponse> {

  const apiBase = getApiBase()

  const res = await fetch(`${apiBase}/api/v1/chat/${vertical}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      message
    })
  })

  if (!res.ok) {
    throw new Error(`Failed to send message: ${res.statusText}`)
  }

  return res.json()
}