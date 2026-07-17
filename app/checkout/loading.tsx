import React from "react";

export default function CheckoutLoading() {
  return (
    <div className="animate-pulse font-poppins">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-8 bg-zinc-100 w-40 mb-10 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            <div className="h-6 bg-zinc-100 w-48 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-zinc-100 rounded" />
              <div className="h-12 bg-zinc-100 rounded" />
            </div>
            <div className="h-12 bg-zinc-100 rounded" />
            <div className="h-12 bg-zinc-100 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-zinc-100 rounded" />
              <div className="h-12 bg-zinc-100 rounded" />
            </div>
          </div>
          {/* Order summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-6 bg-zinc-100 w-36 rounded" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-20 bg-zinc-100 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-100 w-3/4 rounded" />
                  <div className="h-3 bg-zinc-100 w-1/2 rounded" />
                </div>
              </div>
            ))}
            <div className="border-t border-zinc-200 pt-4 space-y-2">
              <div className="h-4 bg-zinc-100 w-full rounded" />
              <div className="h-5 bg-zinc-100 w-full rounded" />
            </div>
            <div className="h-12 bg-zinc-100 w-full rounded mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
