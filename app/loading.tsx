import React from "react";

export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[90vh] bg-zinc-100" />
      {/* Category cards */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-4 bg-zinc-100 w-48 mx-auto mb-2 rounded" />
        <div className="h-8 bg-zinc-100 w-64 mx-auto mb-12 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-zinc-100 rounded" />
          ))}
        </div>
      </div>
      {/* Product grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-4 bg-zinc-100 w-40 mx-auto mb-2 rounded" />
        <div className="h-8 bg-zinc-100 w-56 mx-auto mb-12 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] bg-zinc-100 rounded" />
              <div className="space-y-2">
                <div className="h-3 bg-zinc-100 w-2/3 mx-auto rounded" />
                <div className="h-4 bg-zinc-100 w-full rounded" />
                <div className="h-3 bg-zinc-100 w-1/3 mx-auto rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
