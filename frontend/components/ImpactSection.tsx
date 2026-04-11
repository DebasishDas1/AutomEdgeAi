"use client";

type ImpactSectionProps = {
  impacts: {
    icon: React.ReactNode;
    stat: string;
    label: string;
  }[];
};

export function ImpactSection({ impacts }: ImpactSectionProps) {
  return (
    <section
      id="impact"
      className="py-20 md:py-28 px-4 md:px-8 border-y border-border/10 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-outfit font-extrabold tracking-tight leading-tight">
            What This Means For Your Business
          </h2>
        </div>

        {/* Grid */}
        <div className="flex flex-wrap justify-center gap-y-12 md:gap-y-16 gap-x-10">
          {impacts.map((item, index) => (
            <div
              key={index}
              className="w-full sm:w-[45%] lg:w-[30%] flex flex-col items-center text-center group"
            >
              {/* Icon */}
              <div className="mb-6 md:mb-8">
                <div className="p-4 md:p-6 rounded-full border-2 border-accent/20 shadow-md transition-all duration-300 group-hover:bg-accent/5 group-hover:scale-105">
                  {item.icon}
                </div>
              </div>

              {/* Stat */}
              <div className="text-4xl sm:text-5xl md:text-7xl font-outfit font-black tracking-tighter mb-3 md:mb-4">
                {item.stat}
              </div>

              {/* Label */}
              <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-bold uppercase tracking-[0.15em] md:tracking-[0.2em]">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
