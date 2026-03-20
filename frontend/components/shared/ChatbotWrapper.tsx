// components/client/ChatbotWrapper.tsx
"use client";

import dynamic from "next/dynamic";

const Chatbot = dynamic(
  () => import("@/components/shared/Chatbot").then((m) => m.Chatbot),
  { ssr: false },
);

export function ChatbotWrapper({
  vertical,
}: {
  vertical: "hvac" | "plumbing" | "pest_control" | "roofing";
}) {
  return <Chatbot vertical={vertical} />;
}
