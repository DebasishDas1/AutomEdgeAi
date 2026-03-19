"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { startChatSession, sendChatMessage } from "@/lib/api/chat";

import { Message, ChatbotProps, UserInfo } from "./types";
import { CONFIGS, uid } from "./configs";
import { Toggle } from "./Toggle";
import { Header } from "./Header";
import { LeadForm } from "./LeadForm";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

export function Chatbot({ vertical = "general" }: ChatbotProps) {
  const cfg = CONFIGS[vertical];
  const accentColor = "#1D9E75";
  const apiVertical = vertical === "general" ? "hvac" : vertical;

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"form" | "chat">("form");
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    email: "",
    phone: "",
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionInit = useRef(false);

  // ── THE CORE FIX ──────────────────────────────────────────────────────────
  // sessionId is captured by the handleSend closure at creation time.
  // When handleSend is created (during form step), sessionId === null.
  // When the user sends their FIRST message, the closure still sees the null
  // from when it was created, even though setSessionId() was called later.
  //
  // React state updates are async — the closure does NOT automatically see
  // new state values. The handleSend useCallback re-creates when its deps
  // change, but the dep array had [sessionId] which was null at mount,
  // and the closure was being read from a stale snapshot.
  //
  // The reliable fix: store sessionId in a ref so it's always the live value,
  // regardless of when the closure was created. The ref is mutable and shared —
  // reading sessionIdRef.current always gives the current value.
  const sessionIdRef = useRef<string | null>(null);

  // Keep ref in sync with state (state drives UI reactivity, ref drives logic)
  const setSession = (id: string) => {
    setSessionId(id);
    sessionIdRef.current = id;
  };

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping, step]);

  // ── Focus input when chat opens ────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && step === "chat" && sessionInit.current) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen, step]);

  // ── addBotMsg ──────────────────────────────────────────────────────────────
  const addBotMsg = useCallback(
    (text: string, quickReplies?: Message["quickReplies"]) => {
      setMessages((prev) => [
        ...prev,
        { id: uid(), text, sender: "bot", quickReplies },
      ]);
    },
    [],
  );

  // ── Form submit ────────────────────────────────────────────────────────────
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.email || !userInfo.phone) return;

    setIsSubmitting(true);
    try {
      const data = await startChatSession(apiVertical, userInfo);
      // FIX: use setSession() so both state AND ref are updated atomically.
      // Previously only setSessionId(data.session_id) was called — the ref
      // was never set, so handleSend always read null from sessionIdRef.
      setSession(data.session_id);

      setTimeout(() => {
        setMessages([
          {
            id: uid(),
            text: `Hi ${userInfo.name.split(" ")[0]}! ${cfg.initialMessage}`,
            sender: "bot",
            quickReplies: cfg.quickReplies,
          },
        ]);
        setStep("chat");
        sessionInit.current = true;
        setIsSubmitting(false);
      }, 400);
    } catch (err) {
      console.error("Failed to start session:", err);
      setIsSubmitting(false);
    }
  };

  // ── Send message ───────────────────────────────────────────────────────────
  // FIX: removed sessionId from deps array — we read sessionIdRef.current
  // instead so the closure is never stale. isTyping and isComplete are also
  // read from refs below for the same reason (they're guards, not UI values).
  const isTypingRef = useRef(false);
  const isCompleteRef = useRef(false);

  const handleSend = useCallback(
    async (text: string = input) => {
      const msg = text.trim();

      // FIX: read from refs, not closure-captured state values.
      // The old code used isComplete and isTyping from the closure — on the
      // second message, isTyping was still true in the stale closure even
      // after setIsTyping(false) had been called, so the guard blocked the send.
      if (!msg || isCompleteRef.current || isTypingRef.current) return;

      setMessages((prev) => [
        ...prev,
        { id: uid(), text: msg, sender: "user" },
      ]);
      setInput("");
      setIsTyping(true);
      isTypingRef.current = true;

      try {
        // FIX: read sessionId from ref, not closure-captured state.
        const currentSessionId = sessionIdRef.current;
        if (!currentSessionId) {
          addBotMsg("Session not ready. Please try again in a moment.");
          return;
        }

        const data = await sendChatMessage(apiVertical, currentSessionId, msg);

        if (data.is_complete) {
          setIsComplete(true);
          isCompleteRef.current = true;
        }

        addBotMsg(
          data.message || "My apologies, an unexpected interruption occurred.",
        );
      } catch {
        addBotMsg("Connectivity disruption. Please verify your connection.");
      } finally {
        setIsTyping(false);
        isTypingRef.current = false;
      }
    },
    // FIX: deps are now only the values this closure genuinely needs to
    // re-create for: `input` (user typed text) and `apiVertical` (config).
    // sessionId, isTyping, isComplete removed — all read from refs now.
    [input, apiVertical, addBotMsg],
  );

  return (
    <>
      <Toggle
        isOpen={isOpen}
        accentColor={accentColor}
        onClick={() => setIsOpen((o) => !o)}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-28 right-8 w-[calc(100vw-64px)] sm:w-[410px] h-[640px] max-h-[calc(100vh-140px)] rounded-[32px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] z-50 flex flex-col overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950"
          >
            <Header
              title={cfg.title}
              accentColor={accentColor}
              onClose={() => setIsOpen(false)}
            />

            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Background Pattern */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
                style={{
                  backgroundImage: `radial-gradient(${accentColor} 0.5px, transparent 0.5px)`,
                  backgroundSize: "24px 24px",
                }}
              />

              <AnimatePresence mode="wait">
                {step === "form" ? (
                  <LeadForm
                    userInfo={userInfo}
                    isSubmitting={isSubmitting}
                    accentColor={accentColor}
                    onUserInfoChange={setUserInfo}
                    onSubmit={handleFormSubmit}
                  />
                ) : (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <MessageList
                      messages={messages}
                      isTyping={isTyping}
                      scrollRef={scrollRef}
                      onQuickReply={handleSend}
                    />

                    <ChatInput
                      input={input}
                      isComplete={isComplete}
                      isTyping={isTyping}
                      accentColor={accentColor}
                      inputRef={inputRef}
                      onInputChange={setInput}
                      onSend={handleSend}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Chatbot;
