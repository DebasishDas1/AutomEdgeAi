"use client";

export function PositioningSection() {
  return (
    <section className="py-24 md:py-32 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Top Label */}
        <div className="text-center mb-16">
          <div className="text-[10px] font-semibold tracking-[0.3em] uppercase text-muted-foreground">
            Positioning
          </div>
        </div>

        {/* Main Statement */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-outfit font-semibold tracking-tight leading-[1.1]">
            This is not another
            <span className="block text-muted-foreground line-through opacity-60 mt-2">
              software tool
            </span>
            <span className="block mt-3 text-foreground">It’s a system.</span>
          </h2>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Designed to capture, convert, and manage every patient interaction —
            automatically.
          </p>
        </div>

        {/* Divider */}
        <div className="my-16 h-px bg-linear-to-r from-transparent via-border to-transparent" />

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {[
            {
              title: "Capture",
              desc: "Every call, message, and inquiry — instantly recorded and responded to.",
            },
            {
              title: "Convert",
              desc: "Engage leads within seconds and turn interest into booked appointments.",
            },
            {
              title: "Operate",
              desc: "Run your front desk workflows seamlessly without manual effort.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group p-6 md:p-8 rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-foreground/20"
            >
              {/* Number */}
              <div className="text-3xl font-outfit font-semibold text-muted-foreground/40 mb-4">
                {`0${i + 1}`}
              </div>

              {/* Title */}
              <h3 className="text-xl font-medium mb-2">{item.title}</h3>

              {/* Desc */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
