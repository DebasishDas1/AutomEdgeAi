// lib/api/booking.ts
// Handles direct booking requests from the Calendar component.

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

export interface BookingRequest {
  name:         string;
  email:        string;
  business:     string;  // Maps to "Company Website" or similar
  vertical:     string;  // "hvac", etc.
  message?:      string;  // Notes/questions
  scheduled_at: string | null;  // ISO string
  team_size?:   string;
}

export interface BookingResponse {
  id:           string;
  name:         string;
  email:        string;
  business:     string;
  vertical:     string;
  scheduled_at: string;
  created_at:   string;
}

export async function createBooking(data: BookingRequest): Promise<BookingResponse> {
  const res = await fetch(`${baseUrl()}/api/v1/bookings/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to submit booking");
  }

  return res.json();
}
