import { motion } from "framer-motion";
import { User, Mail, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { UserInfo } from "./types";
import { Button } from "@/components/ui/button";

interface LeadFormProps {
  userInfo: UserInfo;
  isSubmitting: boolean;
  accentColor: string;
  onUserInfoChange: (info: UserInfo) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LeadForm({
  userInfo,
  isSubmitting,
  accentColor,
  onUserInfoChange,
  onSubmit,
}: LeadFormProps) {
  // Validation Logic
  const isEmailValid = userInfo.email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email) : false;
  const isPhoneValid = userInfo.phone ? /^\+?[\d\s\-()]{7,20}$/.test(userInfo.phone) : false;
  const isNameValid = userInfo.name.trim().length >= 2;
  const isFormValid = isNameValid && isEmailValid && isPhoneValid;

  const fields = [
    {
      label: "Full Name",
      icon: User,
      type: "text",
      placeholder: "e.g. John Doe",
      key: "name",
      isValid: isNameValid || !userInfo.name,
    },
    {
      label: "Business Email",
      icon: Mail,
      type: "email",
      placeholder: "john@abchvac.com",
      key: "email",
      isValid: isEmailValid || !userInfo.email,
    },
    {
      label: "Phone Number",
      icon: Phone,
      type: "tel",
      placeholder: "(555) 000-0000",
      key: "phone",
      isValid: isPhoneValid || !userInfo.phone,
    },
  ];

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex-1 flex flex-col p-6 overflow-hidden relative"
    >
      <div className="mb-4">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-2xl font-black text-slate-800 dark:text-white mb-1.5 tracking-tight"
        >
          Check Eligibility
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[13px] text-slate-500 dark:text-slate-400 leading-tight font-semibold opacity-80"
        >
          Experience our AI workflow first-hand.
        </motion.p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {fields.map((field, i) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                {field.label}
              </label>
              {!field.isValid && (
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider animate-pulse">
                  Invalid
                </span>
              )}
            </div>
            <div className="group relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 group-focus-within:text-accent group-focus-within:scale-110">
                <field.icon
                  size={16}
                  className="text-slate-300 dark:text-slate-600 group-focus-within:text-accent"
                />
              </div>
              <input
                required
                type={field.type}
                placeholder={field.placeholder}
                value={userInfo[field.key as keyof UserInfo]}
                onChange={(e) =>
                  onUserInfoChange({ ...userInfo, [field.key]: e.target.value })
                }
                className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                  !field.isValid && userInfo[field.key as keyof UserInfo]
                    ? "border-red-500/50"
                    : "border-slate-200 dark:border-white/10"
                } focus:border-accent focus:ring-4 focus:ring-accent/10 rounded-xl py-3 pl-10 pr-4 text-[14px] font-bold text-slate-700 dark:text-white outline-none transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-600`}
              />
              {field.isValid && userInfo[field.key as keyof UserInfo] && (
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-accent">
                    <CheckCircle2 size={14} className="animate-in fade-in zoom-in duration-300" />
                 </div>
              )}
            </div>
          </motion.div>
        ))}

        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="w-full mt-4 h-12 bg-accent text-white rounded-xl shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all font-black text-xs uppercase tracking-[0.15em] group disabled:opacity-50 disabled:grayscale disabled:shadow-none"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Authenticating...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              Start Live Case Study
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-2.5 grayscale opacity-40 hover:opacity-100 transition-all duration-500"
      >
        <ShieldCheck size={14} className="text-accent" />
        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold tracking-[0.2em] uppercase">
          Authorized Secure Data Transfer
        </p>
      </motion.div>
    </motion.div>
  );
}
