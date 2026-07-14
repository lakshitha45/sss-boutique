"use client";

import React, { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";

export const DevBanner: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if in development and Supabase is not configured
    const configured = isSupabaseConfigured();
    const isDev = process.env.NODE_ENV === "development";
    if (isDev && !configured) {
      // Check if dismissed in this session
      const dismissed = sessionStorage.getItem("sss_mock_banner_dismissed");
      if (!dismissed) {
        setShow(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("sss_mock_banner_dismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="bg-accent text-foreground font-poppins text-xs px-4 py-2 flex items-center justify-between transition-all duration-300 border-b border-accent-hover/20">
      <div className="flex items-center space-x-2 mx-auto text-center">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
        <span>
          <strong>Mock Mode Active:</strong> Running on local JSON database. Connect Supabase by adding keys to your <code>.env.local</code>.
        </span>
      </div>
      <button
        onClick={handleDismiss}
        className="text-foreground/75 hover:text-foreground text-sm font-bold ml-2 transition"
        aria-label="Dismiss banner"
      >
        ✕
      </button>
    </div>
  );
};
export default DevBanner;
