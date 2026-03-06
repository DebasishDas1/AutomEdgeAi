import React from 'react';
import Link from 'next/link';

export const HvacFooter = () => {
    return (
        <footer className="bg-[#1A1A1A] dark:bg-black text-white pt-32 pb-16 px-6 overflow-hidden relative transition-colors duration-500">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] bg-[#00C2A8] rounded-full blur-[300px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid md:grid-cols-4 gap-16 mb-24">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 rounded-full bg-[#00C2A8] flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full border-2 border-[#1A1A1A]"></div>
                            </div>
                            <span className="font-outfit font-[800] text-xl tracking-tighter uppercase whitespace-nowrap">AUTOMEDGE</span>
                        </div>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-xs">
                            Stop losing jobs to slow replies. We help HVAC and home service owners capture more jobs automatically.
                        </p>
                    </div>

                    {/* Solutions */}
                    <div>
                        <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#00C2A8] mb-8">Solutions</h4>
                        <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <li><Link href="/hvac" className="text-white hover:text-[#00C2A8] transition-colors">HVAC Automation</Link></li>
                            <li><Link href="/roofing" className="hover:text-white transition-colors">Roofing CRM</Link></li>
                            <li><Link href="/plumbing" className="hover:text-white transition-colors">Plumbing Lead Gen</Link></li>
                            <li><Link href="/pest-control" className="hover:text-white transition-colors">Pest Control</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#00C2A8] mb-8">Company</h4>
                        <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <li><Link href="/" className="hover:text-white transition-colors">Our Mission</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Contact Support</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#00C2A8] mb-8">Connect</h4>
                        <div className="flex gap-4">
                            {['tw', 'li', 'fb'].map((social) => (
                                <div key={social} className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700/30 flex items-center justify-center text-[10px] font-black hover:bg-[#00C2A8] hover:text-white transition-all cursor-pointer">
                                    {social.toUpperCase()}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">© 2026 AUTOMEDGE INC. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        <span className="hover:text-white cursor-help">MADE WITH ♡ IN DALLAS</span>
                        <span className="hover:text-white cursor-help">SOC2 TYPE II COMPLIANT</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
