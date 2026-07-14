"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for support inspection
    console.error("Server or application render crash:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-poppins">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center py-24 px-6 text-center space-y-6 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
          <AlertCircle className="w-8 h-8 text-rose-500 animate-pulse" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">System Failure</span>
          <h1 className="font-serif text-3xl font-light tracking-wide">Something Went Wrong</h1>
          <div className="w-12 h-[1px] bg-accent mx-auto mt-2" />
        </div>
        <p className="text-zinc-500 text-xs leading-relaxed font-light">
          A rendering exception occurred in our application server. Our concierge engineers have been notified. Please try reloading the page.
        </p>
        {error.message && (
          <pre className="bg-secondary border border-zinc-150 p-4 text-[10px] text-zinc-500 font-mono rounded text-left overflow-auto max-w-full max-h-36">
            {error.message}
          </pre>
        )}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Button
            onClick={() => reset()}
            size="lg"
            icon={<RefreshCw className="w-4 h-4" />}
            fullWidth
            className="sm:w-auto"
          >
            Retry Connection
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" fullWidth>
              Return Home
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
