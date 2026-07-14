"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import { HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-poppins">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center py-24 px-6 text-center space-y-6 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200">
          <HelpCircle className="w-8 h-8 text-accent animate-bounce" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Error 404</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-wide">Page Not Found</h1>
          <div className="w-12 h-[1px] bg-accent mx-auto mt-2" />
        </div>
        <p className="text-zinc-500 text-xs leading-relaxed font-light">
          The pieces or collection you are looking for cannot be found in our digital showroom. It may have been moved, renamed, or is currently unavailable.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Link href="/shop" className="w-full sm:w-auto">
            <Button size="lg" fullWidth>
              Browse Catalog
            </Button>
          </Link>
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
