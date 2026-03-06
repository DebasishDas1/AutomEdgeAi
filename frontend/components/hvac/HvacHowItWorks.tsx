import React from 'react';

const steps = [
    {
        num: '1',
        icon: '📡',
        title: 'Lead Arrives',
        desc: 'Google, Angi, phone, web form — all in one inbox'
    },
    {
        num: '2',
        icon: '⚡',
        title: 'Instant Reply',
        desc: 'Personalized SMS + email in under 60 seconds'
    },
    {
        num: '3',
        icon: '🔄',
        title: 'Follow-Up Runs',
        desc: '5-touch sequence, fully automated, no manual work'
    },
    {
        num: '4',
        icon: '📅',
        title: 'Job Scheduled',
        desc: 'Customer self-books. Tech dispatched automatically.'
    },
    {
        num: '5',
        icon: '✅',
        title: 'Review Collected',
        desc: '2 hours after job close. Automatic. Every time.'
    }
];

export const HvacHowItWorks = () => {
    return (
        <section className="py-32 px-6 bg-white overflow-hidden" id="how-it-works">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <div className="text-[10px] font-black tracking-[0.3em] text-[#00C2A8] uppercase mb-6">HOW IT WORKS</div>
                    <h2 className="text-5xl lg:text-7xl font-outfit font-[900] tracking-tighter text-[#1A1A1A] leading-[1.1]">
                        From lead in — to job <br /> booked in under 10 minutes
                    </h2>
                </div>

                {/* Desktop Flow */}
                <div className="hidden lg:flex items-start justify-between relative">
                    {/* Connecting Line */}
                    <div className="absolute top-[60px] left-[50px] right-[50px] h-[2px] bg-slate-100 z-0"></div>

                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center max-w-[200px] relative z-10 group">
                            <div className="w-[120px] h-[120px] rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-5xl mb-8 shadow-sm transition-all duration-300 group-hover:border-[#00C2A8] group-hover:shadow-lg group-hover:-translate-y-2">
                                {step.icon}
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black">
                                    {step.num}
                                </div>
                            </div>
                            <h3 className="text-xl font-black font-outfit text-[#1A1A1A] mb-3">{step.title}</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Mobile Timeline */}
                <div className="lg:hidden space-y-12 relative pl-10">
                    <div className="absolute left-[34px] top-6 bottom-6 w-[2px] bg-slate-100"></div>

                    {steps.map((step, i) => (
                        <div key={i} className="relative">
                            <div className="absolute -left-[30px] w-[60px] h-[60px] rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-3xl shadow-sm z-10">
                                {step.icon}
                            </div>
                            <div className="pl-12 pt-1 transition-all">
                                <h3 className="text-2xl font-black font-outfit text-[#1A1A1A] mb-2">{step.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
