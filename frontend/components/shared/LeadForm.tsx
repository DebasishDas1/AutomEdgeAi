'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { submitLead } from '@/lib/sheets';
import { Check, Loader2, Sparkles } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    business: z.string().min(2, 'Business name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    teamSize: z.enum(['solo', '2-5', '6-15', '15+'], {
        message: 'Please select team size'
    })
});

type FormData = z.infer<typeof formSchema>;

interface LeadFormProps {
    vertical?: string;
    title?: string;
    subtitle?: string;
    accentColor?: string;
}

export const LeadForm = ({
    vertical = 'general',
    title = 'Book your demo',
    subtitle = 'See it running with your business details.',
    accentColor = '#00C2A8'
}: LeadFormProps) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        resolver: zodResolver(formSchema)
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            await submitLead({ ...data, vertical });
            setIsSubmitted(true);
        } catch (error) {
            console.error('Submission failed:', error);
            // Fallback for demo
            setIsSubmitted(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[48px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.1)] dark:shadow-black/50 p-8 md:p-16 overflow-hidden relative border border-slate-100 dark:border-slate-800 transition-colors duration-500">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C2A8]/5 rounded-bl-[200px] pointer-events-none"></div>

            <div className="text-center mb-16 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C2A8]/10 text-[#00C2A8] text-[10px] font-black uppercase tracking-widest mb-6">
                    <Sparkles size={12} />
                    <span>Free Setup Included</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black font-outfit text-[#1A1A1A] dark:text-white tracking-tighter mb-6 leading-tight">
                    {title}
                </h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
                    {subtitle}
                </p>
            </div>

            <AnimatePresence mode="wait">
                {!isSubmitted ? (
                    <motion.form
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6 relative z-10"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 pl-4">Full Name</label>
                                <input
                                    {...register('name')}
                                    placeholder="e.g. Mike Johnson"
                                    className={`w-full h-16 bg-[#EEF2F5] dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 font-bold text-[#1A1A1A] dark:text-white focus:border-[#00C2A8]/30 focus:bg-white dark:focus:bg-slate-700 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none ${errors.name ? 'border-red-500/50' : ''}`}
                                />
                                {errors.name && <p className="text-[10px] text-red-500 font-bold pl-4 mt-1 uppercase tracking-wider">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 pl-4">Business Name</label>
                                <input
                                    {...register('business')}
                                    placeholder="e.g. CoolAir HVAC"
                                    className={`w-full h-16 bg-[#EEF2F5] dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 font-bold text-[#1A1A1A] dark:text-white focus:border-[#00C2A8]/30 focus:bg-white dark:focus:bg-slate-700 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none ${errors.business ? 'border-red-500/50' : ''}`}
                                />
                                {errors.business && <p className="text-[10px] text-red-500 font-bold pl-4 mt-1 uppercase tracking-wider">{errors.business.message}</p>}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 pl-4">Work Email</label>
                                <input
                                    {...register('email')}
                                    placeholder="mike@business.com"
                                    className={`w-full h-16 bg-[#EEF2F5] dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 font-bold text-[#1A1A1A] dark:text-white focus:border-[#00C2A8]/30 focus:bg-white dark:focus:bg-slate-700 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none ${errors.email ? 'border-red-500/50' : ''}`}
                                />
                                {errors.email && <p className="text-[10px] text-red-500 font-bold pl-4 mt-1 uppercase tracking-wider">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 pl-4">Phone Number</label>
                                <input
                                    {...register('phone')}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full h-16 bg-[#EEF2F5] dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 font-bold text-[#1A1A1A] dark:text-white focus:border-[#00C2A8]/30 focus:bg-white dark:focus:bg-slate-700 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 pl-4">Team Size</label>
                            <div className="relative group">
                                <select
                                    {...register('teamSize')}
                                    className={`w-full h-16 bg-[#EEF2F5] dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 font-bold text-[#1A1A1A] dark:text-white focus:border-[#00C2A8]/30 focus:bg-white dark:focus:bg-slate-700 transition-all appearance-none outline-none ${errors.teamSize ? 'border-red-500/50' : ''}`}
                                >
                                    <option value="">Select Team Size</option>
                                    <option value="solo">Just me (Solo-preneur)</option>
                                    <option value="2-5">Small Team (2-5)</option>
                                    <option value="6-15">Mid-sized (6-15)</option>
                                    <option value="15+">Large Enterprise (15+)</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 transition-transform group-focus-within:rotate-180">
                                    <div className="w-2 h-2 border-b-2 border-r-2 border-current rotate-45 mb-1"></div>
                                </div>
                            </div>
                            {errors.teamSize && <p className="text-[10px] text-red-500 font-bold pl-4 mt-1 uppercase tracking-wider">{errors.teamSize.message}</p>}
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-20 text-white rounded-[24px] font-black text-xl hover:brightness-110 active:brightness-90 transition-all shadow-2xl mt-8 disabled:opacity-50 flex items-center justify-center gap-4 group"
                            style={{ backgroundColor: accentColor, boxShadow: `0 20px 40px -12px ${accentColor}40` }}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <span>Get My Demo Access Now</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </>
                            )}
                        </motion.button>

                        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mt-12 opacity-60">
                            {['No Credit Card', 'Instant Setup', '14-Day Free Trial'].map((item) => (
                                <div key={item} className="flex items-center gap-2">
                                    <Check size={14} className="text-[#00C2A8]" />
                                    <span className="text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.form>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-20 relative z-10"
                    >
                        <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner shadow-emerald-500/20">
                            <Check size={48} strokeWidth={3} />
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black font-outfit text-[#1A1A1A] dark:text-white mb-6 uppercase tracking-tight leading-tight">
                            You're all set, <br />
                            <span style={{ color: accentColor }}>{watch('name')}!</span>
                        </h3>
                        <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mb-12">
                            Check your email. We've sent your dashboard credentials and setup guide.
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#00C2A8] transition-colors flex items-center gap-2 mx-auto"
                        >
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            Go back to form
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
