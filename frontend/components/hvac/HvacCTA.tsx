'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

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

export const HvacCTA = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        resolver: zodResolver(formSchema)
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        console.log('Form data:', { ...data, vertical: 'hvac' });
        setIsSubmitted(true);
        setIsLoading(false);
    };

    return (
        <section className="py-32 px-6 bg-[#EEF2F5] dark:bg-slate-950 transition-colors duration-500" id="contact">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 p-8 md:p-16 overflow-hidden relative border border-slate-100 dark:border-slate-800">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C2A8]/5 rounded-bl-full"></div>

                <div className="text-center mb-16 relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black font-outfit text-[#1A1A1A] dark:text-white tracking-tighter mb-6 leading-tight">
                        See it running with <br className="hidden md:block" />
                        your business name
                    </h2>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
                        Book a 15-min call. We set it up live, using your leads, your branding.
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
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-4">Your Name</label>
                                    <input
                                        {...register('name')}
                                        placeholder="Mike Johnson"
                                        className={`w-full h-16 bg-[#EEF2F5] dark:bg-slate-800 border-none rounded-2xl px-6 font-bold text-[#1A1A1A] dark:text-white focus:ring-2 focus:ring-[#00C2A8] transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 ${errors.name ? 'ring-2 ring-red-500' : ''}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-4">Business Name</label>
                                    <input
                                        {...register('business')}
                                        placeholder="CoolAir HVAC"
                                        className={`w-full h-16 bg-[#EEF2F5] dark:bg-slate-800 border-none rounded-2xl px-6 font-bold text-[#1A1A1A] dark:text-white focus:ring-2 focus:ring-[#00C2A8] transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 ${errors.business ? 'ring-2 ring-red-500' : ''}`}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px) font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-4">Work Email</label>
                                    <input
                                        {...register('email')}
                                        placeholder="mike@coolair.com"
                                        className={`w-full h-16 bg-[#EEF2F5] dark:bg-slate-800 border-none rounded-2xl px-6 font-bold text-[#1A1A1A] dark:text-white focus:ring-2 focus:ring-[#00C2A8] transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-4">Phone (Optional)</label>
                                    <input
                                        {...register('phone')}
                                        placeholder="+1 555 000 0000"
                                        className="w-full h-16 bg-[#EEF2F5] dark:bg-slate-800 border-none rounded-2xl px-6 font-bold text-[#1A1A1A] dark:text-white focus:ring-2 focus:ring-[#00C2A8] transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-4">Team Size</label>
                                <div className="relative">
                                    <select
                                        {...register('teamSize')}
                                        className={`w-full h-16 bg-[#EEF2F5] dark:bg-slate-800 border-none rounded-2xl px-6 font-bold text-[#1A1A1A] dark:text-white focus:ring-2 focus:ring-[#00C2A8] transition-all appearance-none ${errors.teamSize ? 'ring-2 ring-red-500' : ''}`}
                                    >
                                        <option value="">Select Team Size</option>
                                        <option value="solo">Just me</option>
                                        <option value="2-5">2-5</option>
                                        <option value="6-15">6-15</option>
                                        <option value="15+">15+</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-16 bg-[#00C2A8] text-white rounded-full font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#00C2A8]/20 mt-4 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : "Book My Free Demo →"}
                            </button>

                            <div className="flex items-center justify-center gap-8 mt-8 opacity-50 grayscale dark:invert">
                                <div className="text-[8px] font-black tracking-widest uppercase">No Credit Card</div>
                                <div className="text-[8px] font-black tracking-widest uppercase">No Setup Fee</div>
                                <div className="text-[8px] font-black tracking-widest uppercase">Cancel Anytime</div>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-20 relative z-10"
                        >
                            <div className="w-24 h-24 bg-[#00C2A8]/10 text-[#00C2A8] rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner shadow-[#00C2A8]/5">✓</div>
                            <h3 className="text-4xl font-black font-outfit text-[#1A1A1A] dark:text-white mb-4 uppercase tracking-tight">You're Booked, {watch('name')}!</h3>
                            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">Check your email for the link. Let's grow your HVAC biz.</p>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="mt-12 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#00C2A8] transition-colors"
                            >
                                Send another request
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};
