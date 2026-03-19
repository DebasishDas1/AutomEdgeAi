"use client";

import { Clock, ChevronRight, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

type TimeSlotPickerProps = {
  selectedDate: Date | undefined;
  selectedSlot: Date | null;
  onSelectSlot: (slot: Date) => void;
  slots: Date[];
  onContinue: () => void;
};

export const TimeSlotPicker = ({
  selectedDate,
  selectedSlot,
  onSelectSlot,
  slots,
  onContinue,
}: TimeSlotPickerProps) => {
  return (
    <div className="flex-1 flex flex-col h-full min-h-[400px]">
      <h3 className="text-xl font-outfit font-bold tracking-tight mb-6 flex items-center gap-2 text-foreground">
        <Clock className="w-5 h-5 text-accent" />
        {selectedDate ? format(selectedDate, "EEEE, MMMM do") : "Select a Time"}
      </h3>

      {!selectedDate ? (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border/40 rounded-3xl bg-muted/5 min-h-[300px]">
          <p className="text-muted-foreground text-sm flex flex-col items-center gap-3">
            <CalendarIcon className="w-10 h-10 opacity-10" />
            <span className="font-medium">Please select a date</span>
          </p>
        </div>
      ) : slots.length === 0 ? (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border/40 rounded-3xl bg-muted/5 min-h-[300px]">
          <p className="text-muted-foreground text-sm flex flex-col items-center gap-3">
            <Clock className="w-10 h-10 opacity-10" />
            <span className="font-medium">No slots available on this date</span>
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full gap-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
            {slots.map((slot) => {
              const active = selectedSlot?.toISOString() === slot.toISOString();
              return (
                <button
                  key={slot.toISOString()}
                  onClick={() => onSelectSlot(slot)}
                  className={`
                    h-14 flex items-center justify-center px-2 rounded-xl border-2 text-sm font-black tabular-nums transition-all duration-300
                    ${
                      active
                        ? "bg-accent border-accent text-white shadow-lg shadow-accent/30 scale-[1.02] ring-2 ring-accent/20"
                        : "bg-background/40 border-border/60 text-foreground hover:border-accent/40 hover:bg-accent/5"
                    }
                  `}
                >
                  {format(slot, "h:mm a")}
                </button>
              );
            })}
          </div>

          {/* Sticky CTA Area */}
          <div className="mt-auto pt-8 border-t border-border/40">
            <button
              onClick={onContinue}
              disabled={!selectedSlot}
              className={`w-full group py-5 px-6 rounded-2xl font-black flex items-center justify-center gap-3 transition-all duration-500 ${
                selectedSlot
                  ? "bg-cta glow-cta shadow-xl text-foreground hover:-translate-y-1 active:scale-95"
                  : "bg-muted text-muted-foreground/40 cursor-not-allowed border-2 border-border/50"
              }`}
            >
              {selectedSlot ? (
                <>
                  <span>Continue to Booking</span>
                  <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                </>
              ) : (
                "Select a time slot"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
