import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, Sparkles, User, Mail, Phone, ArrowRight } from "lucide-react";
import { startChatSession, sendChatMessage } from "@/lib/api/chat";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  quickReplies?: { id: string; text: string }[];
}

type Vertical = "hvac" | "roofing" | "plumbing" | "pest_control" | "general";

interface ChatbotProps {
  vertical?: Vertical;
  accentColor?: string;
}

// ─── Vertical config ──────────────────────────────────────────────────────────

const CONFIGS: Record<
  Vertical,
  {
    title: string;
    initialMessage: string;
    quickReplies: { id: string; text: string }[];
  }
> = {
  hvac: {
    title: "HVAC Assistant",
    initialMessage:
      "Hi! I'm your HVAC specialist. What's going on with your system today?",
    quickReplies: [
      { id: "ac", text: "AC not cooling" },
      { id: "heat", text: "Heating issue" },
      { id: "maint", text: "Maintenance" },
    ],
  },
  roofing: {
    title: "Roofing Assistant",
    initialMessage:
      "Hi! I'm your roofing specialist. Are you dealing with a leak or storm damage?",
    quickReplies: [
      { id: "leak", text: "Active leak" },
      { id: "storm", text: "Storm damage" },
      { id: "inspect", text: "Get inspection" },
    ],
  },
  plumbing: {
    title: "Plumbing Assistant",
    initialMessage:
      "Hi! I'm your plumbing specialist. Is this an emergency or a routine issue?",
    quickReplies: [
      { id: "emergency", text: "Emergency!" },
      { id: "drain", text: "Clogged drain" },
      { id: "leak", text: "Pipe leak" },
    ],
  },
  pest_control: {
    title: "Pest Control",
    initialMessage:
      "Hi! I'm your pest specialist. What kind of pest problem are you dealing with?",
    quickReplies: [
      { id: "rodents", text: "Rodents" },
      { id: "insects", text: "Insects" },
      { id: "termites", text: "Termites" },
    ],
  },
  general: {
    title: "Automedge Assistant",
    initialMessage: "Hi there! How can Automedge help your business today?",
    quickReplies: [
      { id: "demo", text: "Book Demo" },
      { id: "price", text: "View Pricing" },
      { id: "how", text: "How it works" },
    ],
  },
};

// ─── ID generator (stable, no crypto) ────────────────────────────────────────

let _id = 0;
const uid = () => `m${++_id}`;

// ─── Component ────────────────────────────────────────────────────────────────

export function Chatbot({
  vertical = "general",
  accentColor = "#00C2A8",
}: ChatbotProps) {
  const cfg = CONFIGS[vertical];

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"form" | "chat">("form");
  const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "" });
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionInit = useRef(false);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && step === "chat" && sessionInit.current) {
        setTimeout(() => inputRef.current?.focus(), 320);
    }
  }, [isOpen, step]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.email || !userInfo.phone) return;
    
    setIsSubmitting(true);
    try {
        const apiVertical = vertical === "general" ? "hvac" : vertical;
        const data = await startChatSession(apiVertical, userInfo);
        setSessionId(data.session_id);
        
        // Show the local initial message
        setMessages([
          {
            id: uid(),
            text: `Thanks ${userInfo.name}! ${cfg.initialMessage}`,
            sender: "bot",
            quickReplies: cfg.quickReplies,
          },
        ]);
        
        setStep("chat");
        sessionInit.current = true;
    } catch (err) {
        console.error("Failed to start session:", err);
    } finally {
        setIsSubmitting(false);
    }
  };

  const addBotMsg = useCallback(
    (text: string, quickReplies?: Message["quickReplies"]) => {
      setMessages((prev) => [
        ...prev,
        { id: uid(), text, sender: "bot", quickReplies },
      ]);
    },
    [],
  );

  const handleSend = useCallback(
    async (text: string = input) => {
      const msg = text.trim();
      if (!msg || isComplete || isTyping) return;

      setMessages((prev) => [
        ...prev,
        { id: uid(), text: msg, sender: "user" },
      ]);
      setInput("");
      setIsTyping(true);

      try {
        if (!sessionId) {
          addBotMsg("Still connecting — please try again in a moment.");
          return;
        }
        const apiVertical = vertical === "general" ? "hvac" : vertical;
        const data = await sendChatMessage(apiVertical, sessionId, msg);
        if (data.is_complete) setIsComplete(true);
        addBotMsg(data.message || "Something went wrong.");
      } catch {
        addBotMsg("Sorry, I'm having trouble connecting. Please try again.");
      } finally {
        setIsTyping(false);
      }
    },
    [input, isComplete, isTyping, sessionId, vertical, addBotMsg],
  );

  return (
    <>
      {/* ── Toggle FAB ─────────────────────────────────────────────────── */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl z-50 flex items-center justify-center overflow-hidden transition-colors"
        style={{ backgroundColor: accentColor }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="x"
              initial={{ rotate: -80, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 80, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <X size={26} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="msg"
              initial={{ rotate: 80, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -80, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative"
            >
              <MessageSquare size={26} className="text-white" />
              <motion.span
                animate={{ scale: [1, 1.25, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Chat window ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            className="fixed bottom-24 right-6 w-[calc(100vw-48px)] sm:w-[380px] h-[520px] max-h-[calc(100vh-120px)] rounded-[28px] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.3)] z-50 flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between shrink-0"
              style={{ background: accentColor }}
            >
              <div className="flex items-center gap-3 text-white min-w-0">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Bot size={22} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-[15px] leading-none tracking-tight uppercase truncate">
                    {cfg.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[9px] text-white/75 font-bold tracking-widest uppercase">
                      Active
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {step === "form" ? (
              /* Lead Form Step */
              <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/30">
                <div className="mb-6">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                        Let's get started!
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Please provide your details to begin the chat.
                    </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
                            Full Name
                        </label>
                        <div className="relative">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                required
                                type="text"
                                placeholder="John Doe"
                                value={userInfo.name}
                                onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 focus:border-[#00C2A8]/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-200 outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                required
                                type="email"
                                placeholder="john@example.com"
                                value={userInfo.email}
                                onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 focus:border-[#00C2A8]/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-200 outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                required
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={userInfo.phone}
                                onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 focus:border-[#00C2A8]/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-200 outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !userInfo.name || !userInfo.email || !userInfo.phone}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-[#00C2A8]/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                        style={{ backgroundColor: accentColor }}
                    >
                        {isSubmitting ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Start Chatting
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
                
                <div className="mt-auto pt-6 text-center">
                    <p className="text-[10px] text-slate-400 font-medium">
                        By starting, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>
              </div>
            ) : (
              /* Chat Step */
              <>
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/30"
                  style={{ scrollbarWidth: "none" }}
                >
                  {messages.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[84%] px-4 py-3 rounded-2xl text-[13px] font-medium leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-[#1A1A1A] dark:bg-slate-100 text-white dark:text-slate-900 rounded-tr-sm"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-slate-700/50 shadow-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </motion.div>

                      {msg.quickReplies && msg.quickReplies.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.15 }}
                          className="flex flex-wrap gap-1.5 pl-1"
                        >
                          {msg.quickReplies.map((r) => (
                            <button
                              key={r.id}
                              onClick={() => handleSend(r.text)}
                              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-bold tracking-wide text-slate-700 dark:text-slate-200 hover:border-[#00C2A8] hover:text-[#00C2A8] dark:hover:border-[#00C2A8] transition-all"
                            >
                              {r.text}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: accentColor }}
                            animate={{ y: [0, -4, 0] }}
                            transition={{
                              duration: 0.7,
                              repeat: Infinity,
                              delay: i * 0.15,
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && !e.shiftKey && handleSend()
                        }
                        placeholder={
                          isComplete ? "Chat complete" : "Type a message…"
                        }
                        disabled={isComplete}
                        className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-[#00C2A8]/30 rounded-xl py-3 pl-4 pr-9 text-[13px] text-slate-700 dark:text-slate-200 transition-all outline-none disabled:opacity-50"
                      />
                      <Sparkles
                        size={13}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isComplete || isTyping}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Send
                        size={16}
                        strokeWidth={2.5}
                        className="text-white"
                      />
                    </motion.button>
                  </div>
                  <p className="text-center text-[8px] font-bold tracking-[0.18em] uppercase text-slate-400 mt-2.5 opacity-50">
                    Powered by automedge AI
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Chatbot;

