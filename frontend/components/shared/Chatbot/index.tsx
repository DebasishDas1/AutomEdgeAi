"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { startChatSession, streamChatMessage } from "@/lib/api/chat";
import { toast } from "sonner";

import { Message, ChatbotProps, UserInfo } from "./types";
import { CONFIGS, uid } from "./configs";
import { Toggle } from "./Toggle";
import { Header } from "./Header";
import { LeadForm } from "./LeadForm";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ShieldCheck } from "lucide-react";

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
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionInit = useRef(false);

  // ── THE CORE FIX ──────────────────────────────────────────────────────────
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
  const handleFormSubmit = async (data: UserInfo) => {
    setUserInfo(data);
    setIsSubmitting(true);
    setIsComplete(false);
    isCompleteRef.current = false;

    try {
      const resp = await startChatSession(apiVertical, data);
      setSession(resp.session_id);

      setTimeout(() => {
        setMessages([
          {
            id: uid(),
            text: `Hi ${data.name.split(" ")[0]}! ${cfg.initialMessage}`,
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
  const isTypingRef = useRef(false);
  const isCompleteRef = useRef(false);

  const handleBotComplete = useCallback(() => {
    if (isCompleteRef.current) return;

    setIsComplete(true);
    isCompleteRef.current = true;

    addBotMsg(
      "Thanks for all the details! We've got everything we need. Got any last questions, or want to lock in a time?",
      [
        { id: "follow-up", text: "One more question…" },
        { id: "appointment", text: "Book me an appointment" },
        { id: "more-info", text: "More info needed" },
      ],
    );

    toast.success("Your inquiry has been successfully received by our team.", {
      description: "We've received your message and will follow up shortly.",
      duration: 6000,
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      className:
        "bg-white dark:bg-slate-900 border-2 border-emerald-500/20 rounded-2xl shadow-xl",
    });
  }, [addBotMsg]);

  const handleSend = useCallback(
    async (textOverride?: string) => {
      const msg = (textOverride ?? "").trim();
      if (!msg) return;

      if (isTypingRef.current) return;

      // optimistic push
      setMessages((prev) => [
        ...prev,
        { id: uid(), text: msg, sender: "user" },
      ]);
      setInput("");

      setIsTyping(true);
      isTypingRef.current = true;

      try {
        const currentSessionId = sessionIdRef.current;
        if (!currentSessionId) {
          addBotMsg("Session is starting up… try again shortly.");
          return;
        }

        const botMsgId = uid();
        let hasAddedInitialBotChunk = false;

        await streamChatMessage(
          currentSessionId,
          msg,
          (chunk) => {
            if (!hasAddedInitialBotChunk) {
              hasAddedInitialBotChunk = true;
              setIsTyping(false);

              setMessages((prev) => [
                ...prev,
                { id: botMsgId, text: chunk, sender: "bot" },
              ]);
            } else {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId ? { ...m, text: m.text + chunk } : m,
                ),
              );
            }
          },
          (meta) => {
            if (meta?.is_complete) {
              handleBotComplete();
            }
          },
        );
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;

        if (status === 408) addBotMsg("Server is warming up… try again soon.");
        else if (status === 404)
          addBotMsg("Session expired. Refresh and restart.");
        else addBotMsg("Something went sideways… check your network.");

        console.error("send error:", err);
      } finally {
        setIsTyping(false);
        isTypingRef.current = false;
      }
    },
    [addBotMsg, handleBotComplete],
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
            className="fixed bottom-28 right-8 w-[calc(100vw-64px)] sm:w-105 h-[min(640px,calc(100vh-96px))] max-h-[calc(100vh-96px)] rounded-[2.5rem] shadow-[0_36px_120px_-30px_rgba(15,23,42,0.7)] z-50 flex flex-col overflow-hidden border border-slate-200/70 dark:border-white/10 bg-white/95 backdrop-blur-xl dark:bg-slate-950/95"
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
                    onFormComplete={handleFormSubmit}
                  />
                ) : (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    {isComplete && (
                      <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/10 bg-emerald-500/10 dark:bg-emerald-500/10 text-slate-900 dark:text-emerald-100">
                        <div className="rounded-3xl border border-emerald-500/20 bg-white/90 dark:bg-slate-950/95 px-4 py-3 shadow-sm text-[13px] font-medium leading-6">
                          ✨ All set! Your details are saved. Ask a follow-up,
                          request a quick estimate, or lock in your appointment.
                        </div>
                      </div>
                    )}

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
