import Link from 'next/link';
import { Phone } from 'lucide-react';

export function HvacNavbar() {
    return (
        <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 bg-[#EEF2F5]/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-500">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00C2A8] flex items-center justify-center shadow-lg shadow-[#00C2A8]/20">
                    <div className="w-4 h-4 rounded-full border-2 border-white"></div>
                </div>
                <span className="font-outfit font-[800] text-xl tracking-tighter text-[#1A1A1A] dark:text-white">AUTOMEDGE</span>
            </div>

            <div className="hidden lg:flex items-center gap-6">
                <div className="flex items-center gap-8 font-sans font-black tracking-[0.25em] text-slate-500 dark:text-slate-400 uppercase">
                    <Link href="#solution" className="hover:text-[#00C2A8] transition-colors py-4">THE SOLUTION</Link>
                    <Link href="#features" className="hover:text-[#00C2A8] transition-colors py-4">FEATURES</Link>
                    <Link href="#contact" className="hover:text-[#00C2A8] transition-colors py-4">HVAC</Link>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <a href="tel:+1234567890" className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-[10px] font-sans font-black text-slate-600 dark:text-slate-300 uppercase shadow-sm">
                    <Phone className="w-3.5 h-3.5 text-[#00C2A8]" />
                    CALL US
                </a>
                <Link href="#contact">
                    <button className="px-6 py-2.5 bg-[#00C2A8] text-white rounded-full text-[10px] font-sans font-black hover:scale-105 active:scale-95 transition-all tracking-widest uppercase shadow-lg shadow-[#00C2A8]/10">
                        GET STARTED
                    </button>
                </Link>
            </div>
        </nav>
    );
}
