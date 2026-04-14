export const SectionSkeleton = () => (
  <div className="w-full max-w-7xl mx-auto px-4 py-12 space-y-8 animate-pulse">
    <div className="h-10 w-1/3 bg-muted/40 rounded-lg mx-auto" />
    <div className="space-y-4">
      <div className="h-4 w-full bg-muted/20 rounded" />
      <div className="h-4 w-5/6 bg-muted/20 rounded mx-auto" />
      <div className="h-4 w-4/6 bg-muted/20 rounded mx-auto" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 bg-muted/30 rounded-2xl" />
      ))}
    </div>
  </div>
);

