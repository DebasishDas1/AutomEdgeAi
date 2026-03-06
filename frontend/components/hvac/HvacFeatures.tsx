'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = [
    {
        id: 'leads',
        label: 'Lead Management',
        features: [
            'Unified inbox: Google LSA, Angi, Thumbtack, web, phone',
            'Lead scoring by urgency (emergency vs general)',
            'Pipeline view: New → Contacted → Quoted → Booked → Done',
            'Source attribution: know which channels convert best'
        ],
        mockup: 'Pipelines'
    },
    {
        id: 'sms',
        label: 'Auto SMS/Email',
        features: [
            'First reply in 47 seconds — before competitor calls back',
            'Personalized with customer name + service requested',
            '5-touch follow-up on unseen quotes',
            'Branded sender name — looks like your team, not a bot'
        ],
        mockup: 'Chat'
    },
    {
        id: 'dispatch',
        label: 'Dispatch',
        features: [
            'Nearest available tech gets push notification',
            'Customer gets tech name + ETA via SMS',
            'Calendar sync: Google Calendar + Outlook',
            'Job notes attached automatically from lead details'
        ],
        mockup: 'Dispatch'
    },
    {
        id: 'reviews',
        label: 'Reviews',
        features: [
            'Sent 2 hours after job marked complete',
            'One-tap Google review link',
            'Only sends to satisfied customers (filters low ratings)',
            'Monthly review report emailed to owner'
        ],
        mockup: 'Reviews'
    }
];

export const HvacFeatures = () => {
    const [selectedTab, setSelectedTab] = useState('leads');

    const activeTab = tabs.find(t => t.id === selectedTab)!;

    return (
        <section className="py-32 px-6 bg-white dark:bg-slate-900 transition-colors duration-500" id="features">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black font-outfit text-[#1A1A1A] dark:text-white tracking-tighter mb-4">
                        Everything you need to <br className="hidden md:block" />
                        <span className="text-[#00C2A8]">dominate</span> your local market
                    </h2>
                </div>

                {/* Tab Navigation */}
                <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar mb-16 justify-center">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedTab(tab.id)}
                            className={`px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap transition-all border-2 ${selectedTab === tab.id
                                ? 'bg-[#00C2A8] text-white border-[#00C2A8] shadow-lg shadow-[#00C2A8]/20'
                                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-[#00C2A8]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="grid lg:grid-cols-2 gap-12 items-center"
                    >
                        {/* Features List */}
                        <div className="bg-[#EEF2F5] dark:bg-slate-800/50 p-8 md:p-12 rounded-[40px] border border-slate-200/50 dark:border-slate-700/50">
                            <h3 className="text-2xl md:text-3xl font-black font-outfit text-[#1A1A1A] dark:text-white mb-8 uppercase tracking-tight">{activeTab.label}</h3>
                            <div className="space-y-6">
                                {activeTab.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-6 h-6 rounded-full bg-[#00C2A8] text-white flex items-center justify-center font-bold mt-1 text-xs">✓</div>
                                        <p className="text-slate-600 dark:text-slate-300 font-medium text-lg leading-relaxed">{feature}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mockup Preview */}
                        <div className="relative aspect-square lg:aspect-[4/3] rounded-[40px] bg-slate-900 border-[8px] border-slate-800 dark:border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
                            {selectedTab === 'sms' ? (
                                <div className="p-8 w-full space-y-4">
                                    <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none max-w-[85%] text-sm text-white border border-slate-700/50">
                                        My AC is making a weird rattling noise. Can someone come out today?
                                    </div>
                                    <div className="bg-[#00C2A8] p-4 rounded-2xl rounded-tr-none max-w-[85%] ml-auto text-sm text-white shadow-lg shadow-[#00C2A8]/20">
                                        Hi Sarah! Mike here. We can have a tech there between 2-4pm. Does that work?
                                    </div>
                                    <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none max-w-[85%] text-sm text-white border border-slate-700/50">
                                        Yes please! See you then.
                                    </div>
                                </div>
                            ) : selectedTab === 'dispatch' ? (
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl w-[280px] shadow-2xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#00C2A8]/10 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-[#00C2A8]"></div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-[#1A1A1A] dark:text-white">Jake Thompson</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Technician</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Job</div>
                                            <div className="text-xs font-bold text-slate-700 dark:text-white">Central AC Repair</div>
                                        </div>
                                        <div className="p-3 bg-[#00C2A8]/5 rounded-xl border border-[#00C2A8]/20">
                                            <div className="text-[8px] font-black text-[#00C2A8] uppercase tracking-widest mb-1">Next Job (ETA 14m)</div>
                                            <div className="text-xs font-bold text-slate-700 dark:text-white">Sarah W. · Furnace Tune-up</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 animate-pulse">
                                        <div className="w-8 h-8 rounded-full border-2 border-[#00C2A8]/50"></div>
                                    </div>
                                    <div className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Simulation Loading...</div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
};
