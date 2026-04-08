// lib/api/retell.ts
// Handles web call session creation for Retell AI.

const assertApiUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_URL. Set it in your environment before running the frontend."
    );
  }

  if (
    !url.startsWith("https://") &&
    !url.startsWith("http://localhost") &&
    !url.startsWith("http://127.0.0.1")
  ) {
    throw new Error("NEXT_PUBLIC_API_URL must use https:// in production.");
  }

  return url.replace(/\/+$/, "");
};

const baseUrl = assertApiUrl;

export interface WebCallSession {
  access_token: string;
  call_id:      string;
}

export async function createWebCall(type?: string): Promise<WebCallSession> {
  const res = await fetch(`${baseUrl()}/api/v1/retell/create-web-call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: type || null }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to create web call session");
  }

  return res.json();
}