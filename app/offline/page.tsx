"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  const [checking, setChecking] = useState(false);

  const handleRetry = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      if (typeof window !== "undefined" && window.navigator.onLine) {
        window.location.href = "/";
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-poppins">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center py-24 px-6 text-center space-y-6 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200">
          <WifiOff className="w-8 h-8 text-zinc-400" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Network Offline</span>
          <h1 className="font-serif text-3xl font-light tracking-wide">Connection Lost</h1>
          <div className="w-12 h-[1px] bg-accent mx-auto mt-2" />
        </div>
        <p className="text-zinc-500 text-xs leading-relaxed font-light">
          Your device appears to be disconnected from the internet. Please check your cellular data or Wi-Fi settings and try again.
        </p>
        <div className="pt-4 w-full flex justify-center">
          <Button
            onClick={handleRetry}
            loading={checking}
            size="lg"
            icon={<RefreshCw className="w-4 h-4" />}
            fullWidth
            className="sm:w-auto"
          >
            Retry Connection
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
