import React from "react";

export default function ProductDetailLoading() {
  return (
    <div className="animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center space-x-2 mb-10">
          <div className="h-3 bg-zinc-100 w-12 rounded" />
          <div className="h-3 bg-zinc-100 w-12 rounded" />
          <div className="h-3 bg-zinc-100 w-20 rounded" />
        </div>
        {/* Product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Image gallery */}
          <div className="lg:col-span-7 flex gap-4">
            <div className="hidden md:flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-16 h-20 bg-zinc-100 rounded" />
              ))}
            </div>
            <div className="flex-1 aspect-[3/4] bg-zinc-100 rounded" />
          </div>
          {/* Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="h-3 bg-zinc-100 w-24 rounded" />
            <div className="h-8 bg-zinc-100 w-3/4 rounded" />
            <div className="h-6 bg-zinc-100 w-32 rounded" />
            <div className="space-y-2 pt-4">
              <div className="h-3 bg-zinc-100 w-full rounded" />
              <div className="h-3 bg-zinc-100 w-5/6 rounded" />
              <div className="h-3 bg-zinc-100 w-4/6 rounded" />
            </div>
            <div className="flex gap-3 pt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-12 h-10 bg-zinc-100 rounded" />
              ))}
            </div>
            <div className="h-12 bg-zinc-100 w-full rounded mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
