"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Video } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

type SuccessDisplayProps = {
  formData: { name: string; email: string; website: string; teamSize: string };
  selectedSlot: Date | null;
  onReschedule: () => void;
};

export const SuccessDisplay = ({
  formData,
  selectedSlot,
  onReschedule,
}: SuccessDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-16 md:py-24 px-6 md:px-10 flex flex-col items-center justify-center text-center bg-accent/5"
    >
      <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-green-500/10 flex items-center justify-center mb-6 md:mb-10 shadow-inner ring-4 ring-green-500/5">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
          <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
        </div>
      </div>
      <h3 className="text-3xl md:text-5xl font-outfit font-black text-foreground mb-4 md:mb-6 tracking-tight">
        You&apos;re all set!
      </h3>
      <p className="text-lg md:text-2xl text-muted-foreground max-w-lg mb-8 md:mb-12 leading-relaxed font-medium">
        Thanks,{" "}
        <span className="text-foreground font-black">{formData.name}</span>!{" "}
        <br className="hidden sm:block" />
        We&apos;ve sent a calendar invite to{" "}
        <span className="text-accent underline decoration-2 md:decoration-4 underline-offset-2 md:underline-offset-4">
          {formData.email}
        </span>{" "}
        for{" "}
        <span className="font-black text-foreground italic">
          {selectedSlot ? format(selectedSlot, "MMMM do 'at' h:mm a") : ""}
        </span>
        .
      </p>
      <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-md px-4">
        <Button
          variant="outline"
          className="flex-1 h-14 md:h-16 rounded-xl md:rounded-2xl font-black border-2 border-border/60 text-base md:text-lg hover:text-cta transition-all active:scale-95"
          onClick={onReschedule}
        >
          Reschedule
        </Button>
      </div>
    </motion.div>

  );
};
