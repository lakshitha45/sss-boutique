import React from "react";

export default function ShopLoading() {
  return (
    <div className="animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Title skeleton */}
        <div className="text-center space-y-3 mb-12">
          <div className="h-3 bg-zinc-100 w-32 mx-auto rounded" />
          <div className="h-8 bg-zinc-100 w-48 mx-auto rounded" />
          <div className="w-12 h-[1px] bg-zinc-200 mx-auto mt-4" />
        </div>
        {/* Filters bar */}
        <div className="flex gap-4 mb-8">
          <div className="h-10 bg-zinc-100 flex-1 rounded" />
          <div className="h-10 bg-zinc-100 w-32 rounded" />
          <div className="h-10 bg-zinc-100 w-32 rounded" />
        </div>
        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[#121212]/5 p-4 space-y-4 border border-zinc-100">
              <div className="aspect-[3/4] bg-zinc-100 rounded" />
              <div className="space-y-2">
                <div className="h-3 bg-zinc-100 w-2/3 rounded" />
                <div className="h-4 bg-zinc-100 w-full rounded" />
                <div className="h-3 bg-zinc-100 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
