"use client";

import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { RefObject } from "react";

interface ChatInputProps {
  input: string;
  isComplete: boolean;
  isTyping: boolean;
  accentColor: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onInputChange: (val: string) => void;
  onSend: (val: string) => void;
}

export function ChatInput({
  input,
  isComplete,
  isTyping,
  accentColor,
  inputRef,
  onInputChange,
  onSend,
}: ChatInputProps) {
  return (
    <div className="px-6 py-5 bg-slate-100 dark:bg-slate-950/95 border-t border-slate-200/70 dark:border-white/10 shrink-0 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative group">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend(input)}
            placeholder={
              isComplete
                ? "Ask anything or type 'schedule'…"
                : "Compose your message…"
            }
            disabled={isTyping}
            className="w-full bg-white/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-full py-4 pl-5 pr-14 text-[14px] font-medium text-slate-700 dark:text-slate-100 transition-all duration-300 outline-none disabled:opacity-50 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <motion.div
            animate={{ opacity: input ? 1 : 0.4 }}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <Sparkles size={16} className="text-emerald-500/70" />
          </motion.div>
        </div>
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: `0 14px 28px -18px ${accentColor}99`,
          }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSend(input)}
          disabled={!input.trim() || isTyping}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:grayscale"
          style={{ backgroundColor: accentColor }}
          aria-label="Send message"
        >
          <Send
            size={20}
            strokeWidth={2}
            className="text-white"
          />
        </motion.button>
      </div>
      <div className="mt-4 flex items-center justify-center text-[11px] text-slate-500 dark:text-slate-400">
        <span>Powered by Automedge AI</span>
      </div>
    </div>
  );
}
