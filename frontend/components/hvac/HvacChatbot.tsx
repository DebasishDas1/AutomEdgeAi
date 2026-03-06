'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Check } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
    {
        id: '1',
        text: "Hi! I'm your HVAC assistant. Looking to automate your lead follow-ups?",
        sender: 'bot',
        timestamp: new Date()
    }
];

export const HvacChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate bot response
        setTimeout(() => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "That sounds great! Our AI can handle that. Would you like to see a live demo with your business details?",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-[#00C2A8] text-white rounded-full shadow-2xl z-50 flex items-center justify-center hover:bg-[#00A892] transition-colors"
                aria-label="Toggle Chatbot"
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="fixed bottom-24 right-6 w-[380px] h-[520px] bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800"
                    >
                        {/* Header */}
                        <div className="bg-[#00C2A8] p-6 text-white flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">HVAC Assistant</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-white/80 font-medium">Online & ready to help</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/20"
                        >
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${msg.sender === 'user'
                                            ? 'bg-[#00C2A8] text-white rounded-tr-none'
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none flex gap-1 shadow-sm border border-slate-100 dark:border-slate-800">
                                        <div className="w-1.5 h-1.5 bg-[#00C2A8]/40 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-[#00C2A8]/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-[#00C2A8] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your message..."
                                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-4 pl-4 pr-12 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#00C2A8] transition-all outline-none"
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-2 p-2 bg-[#00C2A8] text-white rounded-xl hover:bg-[#00A892] transition-colors shadow-lg shadow-[#00C2A8]/20"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 mt-3 font-bold uppercase tracking-widest">
                                Powered by Automedge AI
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
