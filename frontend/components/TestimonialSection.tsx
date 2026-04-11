import CircularTestimonials from "@/components/ui/circular-testimonials";

type CircularTestimonialsDemoProps = {
  testimonials: {
    quote: string;
    name: string;
    designation: string;
    src: string;
  }[];
};

export function CircularTestimonialsDemo({
  testimonials,
}: CircularTestimonialsDemoProps) {
  return (
    <section>
      <div className="p-16 rounded-lg min-h-[300px] flex flex-col gap-6 items-center justify-center relative">
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
            Testimonials
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-foreground mt-4">
            What Our Customers Say
          </h2>
        </div>
        <div
          className="items-center justify-center relative flex"
          style={{ maxWidth: "1024px" }}
        >
          <CircularTestimonials
            testimonials={testimonials}
            autoplay={true}
            colors={{
              name: "text-primary",
              designation: "text-primary/80",
              testimony: "text-primary/60",
              arrowBackground: "#0582CA",
              arrowForeground: "#141414",
              arrowHoverBackground: "#f7f7ff",
            }}
            fontSizes={{
              name: "28px",
              designation: "20px",
              quote: "20px",
            }}
          />
        </div>
      </div>
    </section>
  );
}
