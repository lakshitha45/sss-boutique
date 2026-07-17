import React from "react";

export default function OrdersLoading() {
  return (
    <div className="animate-pulse font-poppins">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-8 bg-zinc-100 w-40 mb-10 rounded" />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-zinc-100 rounded-lg p-6 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-100 w-32 rounded" />
                  <div className="h-3 bg-zinc-100 w-24 rounded" />
                </div>
                <div className="h-6 bg-zinc-100 w-20 rounded-full" />
              </div>
              <div className="flex gap-4">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="flex gap-3">
                    <div className="w-16 h-20 bg-zinc-100 rounded" />
                    <div className="space-y-2">
                      <div className="h-4 bg-zinc-100 w-24 rounded" />
                      <div className="h-3 bg-zinc-100 w-16 rounded" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-100">
                <div className="h-4 bg-zinc-100 w-20 rounded" />
                <div className="h-4 bg-zinc-100 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
