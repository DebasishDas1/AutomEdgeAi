import React from 'react';

const painPoints = [
    {
        icon: '📞',
        title: 'Missed the call while on a job',
        body: 'A homeowner calls, hits voicemail, calls your competitor next. You never even knew.',
        fix: 'Automedge texts them within 60s of any missed call'
    },
    {
        icon: '🗂️',
        title: 'Leads coming from 5 different apps',
        body: 'Google, Angi, Thumbtack, your website, Facebook — you check 5 apps and still miss leads.',
        fix: 'All sources in one inbox, deduplicated, automatic'
    },
    {
        icon: '📄',
        title: 'Sent a quote, never heard back',
        body: 'You did the estimate, sent it, they went cold. No follow-up system means money left on the table.',
        fix: '5-touch follow-up sequence runs after every quote'
    },
    {
        icon: '⭐',
        title: 'Forget to ask for reviews',
        body: 'You do great work. Your Google rating doesn\'t show it because asking feels awkward and easy to forget.',
        fix: 'Review request sent automatically 2hrs after job close'
    }
];

export const HvacPainPoints = () => {
    return (
        <section className="py-32 px-6 bg-[#EEF2F5]" id="problem">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <div className="text-[10px] font-black tracking-[0.3em] text-[#00C2A8] uppercase mb-6">WHAT WE FIX</div>
                    <h2 className="text-5xl lg:text-7xl font-outfit font-[900] tracking-tighter text-[#1A1A1A] leading-[1.1]">
                        Every problem HVAC <br /> owners tell us about
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {painPoints.map((item, i) => (
                        <div
                            key={i}
                            className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#00C2A8]/10 flex items-center justify-center text-3xl mb-8 group-hover:bg-[#00C2A8] transition-colors group-hover:rotate-6">
                                {item.icon}
                            </div>
                            <h3 className="text-2xl font-black font-outfit text-[#1A1A1A] mb-4">{item.title}</h3>
                            <p className="text-slate-500 text-lg mb-8 leading-relaxed">{item.body}</p>

                            <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                                <div className="text-[#00C2A8] font-bold text-xl">✓</div>
                                <p className="text-[#00C2A8] font-black text-sm uppercase tracking-tight">{item.fix}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
