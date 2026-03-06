'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RotateCcw, Monitor } from 'lucide-react';

const steps = [
    { id: 1, icon: '📥', label: 'Lead Captured', delay: '0s', status: 'Google LSA' },
    { id: 2, icon: '📱', label: 'SMS Sent to Mike', delay: '47s', status: 'Inbound' },
    { id: 3, icon: '🔔', label: 'Technician Alerted', delay: '1m 12s', status: 'Dispatched' },
    { id: 4, icon: '📅', label: 'Appointment Booked', delay: '8m 34s', status: 'Scheduled' },
    { id: 5, icon: '⭐', label: 'Review Requested', delay: '+2 days', status: 'Follow-up' },
];

export const HvacWorkflowDemo = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [key, setKey] = useState(0);

    useEffect(() => {
        let interval: any;
        if (activeStep < steps.length) {
            interval = setInterval(() => {
                setActiveStep(prev => prev + 1);
            }, 1800);
        } else {
            // Loop functionality
            setTimeout(() => {
                reset();
            }, 5000);
        }

        return () => clearInterval(interval);
    }, [activeStep, key]);

    useEffect(() => {
        setProgress((activeStep / steps.length) * 100);
    }, [activeStep]);

    const reset = () => {
        setActiveStep(0);
        setProgress(0);
        setKey(prev => prev + 1);
    };

    return (
        <section className="py-24 px-6 bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-500" id="solution">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                {/* Copy Side */}
                <div className="text-left">
                    <div className="inline-block px-3 py-1 rounded-full bg-[#00C2A8]/10 text-[#00C2A8] text-[10px] font-black tracking-[0.3em] uppercase mb-6">
                        LIVE AUTOMATION DEMO
                    </div>
                    <h2 className="text-5xl lg:text-7xl font-outfit font-[900] tracking-tighter text-[#1A1A1A] dark:text-white leading-[1.1] mb-8">
                        Watch your next lead <br />
                        get handled automatically
                    </h2>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10 max-w-xl">
                        This is exactly what happens the moment an HVAC lead hits your inbox — no human needed, no lead dropped.
                    </p>
                    <button className="h-16 px-10 bg-[#00C2A8] text-white rounded-full font-bold text-xl hover:scale-105 transition-all shadow-xl shadow-[#00C2A8]/20 group">
                        Try It With Your Business <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>

                {/* Demo Side */}
                <div className="relative">
                    <div className="bg-[#0D1B2A] rounded-[40px] p-8 md:p-12 shadow-2xl border border-slate-800 overflow-hidden relative">
                        {/* Fake UI Header */}
                        <div className="flex items-center justify-between mb-10 border-b border-slate-800 pb-6">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Monitor className="w-3 h-3" />
                                automedge — HVAC
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[#00C2A8] font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8] animate-pulse"></span>
                                LIVE
                            </div>
                        </div>

                        {/* Incoming Lead Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 mb-10 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#F97316] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20">MJ</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-white font-bold text-lg tracking-tight">Mike Johnson</h4>
                                    <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black px-2 py-1 rounded-full uppercase border border-amber-500/20 tracking-widest">Google LSA</span>
                                </div>
                                <p className="text-slate-400 text-sm">AC not cooling · 3-bed home · Dallas TX</p>
                            </div>
                        </motion.div>

                        {/* Steps Vertical List */}
                        <div className="space-y-4 relative">
                            {/* Filling Path */}
                            <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-slate-800 z-0"></div>
                            <motion.div
                                className="absolute left-[23px] top-6 w-[2px] bg-[#00C2A8] z-0 origin-top"
                                animate={{ scaleY: progress / 100 }}
                                transition={{ duration: 0.5 }}
                            ></motion.div>

                            {steps.map((step, i) => (
                                <div
                                    key={step.id}
                                    className={`relative z-10 flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${activeStep >= i + 1 ? 'opacity-100' : 'opacity-20'
                                        }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${activeStep > i + 1 ? 'bg-[#00C2A8] border-[#00C2A8]' :
                                            activeStep === i + 1 ? 'bg-[#00C2A8]/10 border-[#00C2A8] shadow-[0_0_20px_rgba(0,194,168,0.3)]' :
                                                'bg-slate-900 border-slate-800'
                                            }`}>
                                            {activeStep > i + 1 ? <Check className="w-6 h-6 text-slate-950" strokeWidth={3} /> :
                                                activeStep === i + 1 ? <div className="w-2.5 h-2.5 rounded-full bg-[#00C2A8] animate-ping" /> :
                                                    <span className="text-xl grayscale opacity-50">{step.icon}</span>}
                                        </div>
                                        <div>
                                            <p className={`font-bold transition-colors ${activeStep === i + 1 ? 'text-white' : 'text-slate-400'}`}>{step.label}</p>
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{step.status}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-[#00C2A8] uppercase tracking-widest">{step.delay}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Replay Button */}
                        <div className="mt-8 flex justify-center border-t border-slate-800 pt-6">
                            <button
                                onClick={reset}
                                className="flex items-center gap-2 text-slate-600 hover:text-[#00C2A8] transition-colors text-[10px] font-black uppercase tracking-widest"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Replay Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
