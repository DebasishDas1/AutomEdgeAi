'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import { startChatSession, sendChatMessage } from '@/lib/api/chat';

interface QuickReply {
    id: string;
    text: string;
    action?: string;
}

interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
    quickReplies?: QuickReply[];
}

interface ChatbotProps {
    vertical?: 'hvac' | 'roofing' | 'plumbing' | 'general';
    accentColor?: string;
}

const VERTICAL_CONFIGS = {
    hvac: {
        title: 'HVAC Assistant',
        initialMessage: "Hi! I'm your HVAC assistant. Looking to automate your lead follow-ups or book a demo?",
        quickReplies: [
            { id: 'demo', text: 'Book Demo' },
            { id: 'pricing', text: 'View Pricing' },
            { id: 'how', text: 'How it works' }
        ]
    },
    roofing: {
        title: 'Roofing Assistant',
        initialMessage: "Hi! I'm your Roofing specialist. Need help capturing more storm leads?",
        quickReplies: [
            { id: 'demo', text: 'Book Demo' },
            { id: 'pricing', text: 'View Pricing' }
        ]
    },
    plumbing: {
        title: 'Plumbing Assistant',
        initialMessage: "Hi! Need an automated system for emergency plumbing leads?",
        quickReplies: [
            { id: 'demo', text: 'Book Demo' },
            { id: 'urgent', text: 'Emergency Support' }
        ]
    },
    general: {
        title: 'Automedge Assistant',
        initialMessage: "Hi there! How can Automedge help your business grow today?",
        quickReplies: [
            { id: 'demo', text: 'Book Demo' },
            { id: 'talk', text: 'Talk to human' }
        ]
    }
};

export const Chatbot = ({ vertical = 'general', accentColor = '#00C2A8' }: ChatbotProps) => {
    const config = VERTICAL_CONFIGS[vertical];
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    // Counter that survives re‑renders – provides stable incremental IDs
    const idCounter = useRef(0);
    const nextId = () => {
        idCounter.current += 1;
        return `msg-${idCounter.current}`;
    };
    const scrollRef = useRef<HTMLDivElement>(null);

    const startChat = async () => {
        if (sessionId) return;
        setIsTyping(true);
        try {
            const data = await startChatSession(vertical);
            if (data.session_id) {
                setSessionId(data.session_id);
                setMessages([{
                    id: nextId(),
                    text: data.message,
                    sender: 'bot',
                    timestamp: new Date(),
                    quickReplies: config.quickReplies
                }]);
            }
        } catch (error) {
            console.error('Failed to start chat:', error);
            // Fallback
            setMessages([{
                id: '1',
                text: config.initialMessage,
                sender: 'bot',
                timestamp: new Date(),
                quickReplies: config.quickReplies
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        if (isOpen && !sessionId && messages.length === 0) {
            startChat();
        }
    }, [isOpen, sessionId, messages.length]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (text: string = inputValue) => {
        const messageText = text.trim();
        if (!messageText || isComplete) return;

        const userMsg: Message = {
            id: nextId(),
            text: messageText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            if (!sessionId) return; // safety guard
            const data = await sendChatMessage(vertical, sessionId, messageText);
            
            if (data.is_complete) setIsComplete(true);

            const botMsg: Message = {
                id: nextId(),
                text: data.message || "An error occurred.",
                sender: 'bot',
                timestamp: new Date(),
                quickReplies: data.is_complete ? [] : []
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, {
                id: nextId(),
                text: "Sorry, I'm having trouble connecting to the server.",
                sender: 'bot',
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl z-50 flex items-center justify-center transition-colors group overflow-hidden"
                style={{ backgroundColor: accentColor, color: 'white' }}
                aria-label="Toggle Chatbot"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X size={28} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            className="relative"
                        >
                            <MessageSquare size={28} />
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-[calc(100vw-48px)] sm:w-[380px] h-[520px] max-h-[calc(100vh-120px)] bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.25)] z-50 flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800"
                    >
                        {/* Header */}
                        <div className="p-6 pb-4 flex items-center justify-between" style={{ backgroundColor: accentColor }}>
                            <div className="flex items-center gap-4 text-white">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
                                    <Bot size={26} strokeWidth={2.5} />
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="font-black text-lg leading-none tracking-tight truncate uppercase font-outfit">{config.title}</h3>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                                        <span className="text-[10px] text-white/80 font-black tracking-widest uppercase">Support Active</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/60 hover:text-white transition-colors p-2"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950/20 custom-scrollbar"
                        >
                            {messages.map((msg) => (
                                <div key={msg.id} className="space-y-3">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] font-bold leading-relaxed ${msg.sender === 'user'
                                            ? 'bg-[#1A1A1A] dark:bg-slate-100 text-white dark:text-slate-900 rounded-tr-none shadow-lg'
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700/50 shadow-sm'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </motion.div>

                                    {msg.quickReplies && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {msg.quickReplies.map((reply) => (
                                                <motion.button
                                                    key={reply.id}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleSend(reply.text)}
                                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-black uppercase tracking-widest text-[#1A1A1A] dark:text-white hover:border-[#00C2A8] dark:hover:border-[#00C2A8] transition-all shadow-sm"
                                                >
                                                    {reply.text}
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none flex gap-1.5 shadow-sm border border-slate-100 dark:border-slate-800">
                                        <div className="w-1.5 h-1.5 bg-[#00C2A8] rounded-full animate-bounce [animation-duration:0.8s]"></div>
                                        <div className="w-1.5 h-1.5 bg-[#00C2A8] rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-[#00C2A8] rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.3s]"></div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <div className="relative flex items-center gap-3">
                                <div className="flex-1 relative group">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Ask about Automedge..."
                                        className="w-full bg-slate-100 dark:bg-slate-800/80 border-2 border-transparent focus:border-[#00C2A8]/20 rounded-2xl py-4 pl-5 pr-4 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all outline-none"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600">
                                        <Sparkles size={14} />
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSend()}
                                    className="p-4 bg-[#1A1A1A] dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl hover:bg-black dark:hover:bg-white transition-colors shadow-xl"
                                >
                                    <Send size={18} strokeWidth={2.5} />
                                </motion.button>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 mt-4 opacity-30">
                                <div className="h-[1px] w-4 bg-slate-400"></div>
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
                                    AI-First Automation
                                </span>
                                <div className="h-[1px] w-4 bg-slate-400"></div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
