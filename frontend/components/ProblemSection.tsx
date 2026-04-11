type ProblemSectionProps = {
  problems: {
    icon: React.ReactNode;
    text: string;
    desc: string;
  }[];
};

export function ProblemSection({ problems }: ProblemSectionProps) {
  return (
    <section
      id="problem"
      className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto scroll-mt-24"
    >
      {/* Header */}
      <div className="text-center mb-16 md:mb-24 space-y-5">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-destructive/20 bg-destructive/5 text-destructive font-black text-[10px] uppercase tracking-[0.2em]">
          The Problem
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-outfit font-black tracking-tighter leading-[0.92] max-w-5xl mx-auto">
          Leads go cold in{" "}
          <span className="text-accent underline decoration-accent/20 decoration-4 md:decoration-8 underline-offset-4 md:underline-offset-8">
            5 minutes.
          </span>
        </h2>

        <p className="text-lg md:text-2xl lg:text-3xl text-muted-foreground font-bold tracking-tight max-w-2xl mx-auto leading-tight">
          Most service businesses lose{" "}
          <span className="text-foreground underline decoration-destructive/30 decoration-2 md:decoration-4 underline-offset-4">
            30–60%
          </span>{" "}
          of their leads to friction and slow responses.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {problems.map((item, index) => (
          <div
            key={index}
            className="relative group p-6 md:p-10 rounded-[2.5rem] border border-border/50 bg-card/40 backdrop-blur-xl hover:border-accent/40 transition-all duration-500 shadow-sm hover:shadow-2xl flex flex-col items-center text-center"
          >
            {/* Icon */}
            <div className="mb-6 md:mb-8 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center bg-primary/10 shadow-inner transition-transform duration-300 group-hover:scale-110 [&_svg]:w-8 [&_svg]:h-8 md:[&_svg]:w-10 md:[&_svg]:h-10">
              {item.icon}
            </div>

            {/* Content */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-xl md:text-2xl font-outfit font-black leading-tight tracking-tight">
                {item.text}
              </h3>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
