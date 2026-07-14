"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { BrandSettings, ThemePreset } from "@/types";

// ── Preset Theme Definitions ─────────────────────────────────────────

const PRESET_THEMES: Record<Exclude<ThemePreset, "custom">, Partial<BrandSettings>> = {
  "luxury-pink": {
    primary: "#D45D79",
    primaryHover: "#C24D68",
    secondary: "#F48FB1",
    accent: "#C8A96A",
    accentHover: "#B3966E",
    background: "#FAF8F7",
    surface: "#FFFFFF",
    foreground: "#1C1C1C",
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
  "luxury-black": {
    primary: "#E0E0E0",
    primaryHover: "#BDBDBD",
    secondary: "#2D2D2D",
    accent: "#C5A880",
    accentHover: "#B3966E",
    background: "#0A0A0A",
    surface: "#141414",
    foreground: "#F5F5F5",
    border: "#2A2A2A",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
  "luxury-beige": {
    primary: "#8B7355",
    primaryHover: "#725F46",
    secondary: "#D4C5A9",
    accent: "#A0522D",
    accentHover: "#8B4726",
    background: "#FAF5EF",
    surface: "#FFF8F0",
    foreground: "#3E2723",
    border: "#D7CCC8",
    success: "#2E7D32",
    warning: "#F57F17",
    error: "#C62828",
  },
  "luxury-gold": {
    primary: "#B8860B",
    primaryHover: "#9A7209",
    secondary: "#DAA520",
    accent: "#8B6914",
    accentHover: "#705510",
    background: "#FFFDF5",
    surface: "#FFFFFF",
    foreground: "#1A1A1A",
    border: "#E8DFC4",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
};

// ── Default Brand Settings ───────────────────────────────────────────

const DEFAULT_BRAND_SETTINGS: BrandSettings = {
  // Identity
  brandName: "SSS Boutique",
  tagline: "Luxury Fashion Boutique",
  copyright: "© 2026 SSS Boutique",
  logoUrl: "/images/logo.png",
  transparentLogoUrl: "/images/logo-transparent.png",
  faviconUrl: "/favicon.ico",

  // Theme
  themePreset: "luxury-pink",

  // Colors (Luxury Pink defaults — matches globals.css)
  primary: "#D45D79",
  primaryHover: "#C24D68",
  secondary: "#FFFFFF",
  accent: "#C8A96A",
  accentHover: "#B3966E",
  background: "#FAFAFA",
  surface: "#FFFFFF",
  foreground: "#1C1C1C",
  border: "#E4E4E7",
  success: "#2E7D32",
  warning: "#F59E0B",
  error: "#D32F2F",

  // Typography
  headingFont: "Playfair Display",
  bodyFont: "Inter",
  buttonFont: "Poppins",

  // Design Tokens
  borderRadius: 24,
  shadowStyle: "luxury",
  animationSpeed: "normal",
  pageTransition: "fade",
  buttonHover: "scale",
  cardHover: "lift",

  // Glass Effects
  glassNavbar: true,
  glassCards: false,
  glassDialogs: true,

  // Navigation
  stickyNavbar: true,
  transparentNavbar: false,
  announcementBar: false,
  announcementText: "Free shipping on orders over ₹2,999",
  showSearch: true,
  showWishlist: true,
  showCart: true,

  // Footer
  showNewsletter: true,
  showInstagramFeed: true,
  showQuickLinks: true,
  showPaymentIcons: true,

  // Contact
  phone: "+91 98765 43210",
  email: "concierge@sssboutique.com",
  address: "42 Fashion Avenue, Mumbai 400001",
  whatsapp: "+91 98765 43210",
  businessHours: "Mon-Sat: 10am - 8pm",

  // Social Media
  instagram: "https://instagram.com/sssboutique",
  facebook: "https://facebook.com/sssboutique",
  youtube: "",
  pinterest: "",
};

// ── CSS Variable Injection ───────────────────────────────────────────

const SHADOW_MAP: Record<string, string> = {
  minimal: "0 1px 3px rgba(0,0,0,0.04)",
  soft: "0 4px 16px rgba(0,0,0,0.06)",
  luxury: "0 12px 40px rgba(0,0,0,0.03)",
  glass: "0 8px 32px rgba(0,0,0,0.1)",
  none: "none",
};

function injectCSSVariables(settings: BrandSettings) {
  const root = document.documentElement;

  // Colors
  root.style.setProperty("--primary", settings.primary);
  root.style.setProperty("--primary-hover", settings.primaryHover);
  root.style.setProperty("--secondary", settings.secondary);
  root.style.setProperty("--accent", settings.accent);
  root.style.setProperty("--accent-hover", settings.accentHover);
  root.style.setProperty("--background", settings.background);
  root.style.setProperty("--card", settings.surface);
  root.style.setProperty("--foreground", settings.foreground);
  root.style.setProperty("--border-color", settings.border);
  root.style.setProperty("--error", settings.error);
  root.style.setProperty("--success", settings.success);
  root.style.setProperty("--warning", settings.warning);

  // Semantic Mappings
  root.style.setProperty("--text-primary", settings.foreground);
  root.style.setProperty("--text-secondary", settings.foreground === "#1C1C1C" ? "#71717A" : "#A1A1AA");
  root.style.setProperty("--border", settings.border);
  root.style.setProperty("--surface", settings.surface);
  root.style.setProperty("--surface-hover", settings.surface === "#FFFFFF" ? "#F9FAFB" : "#1F1F1F");
  root.style.setProperty("--surface-elevated", settings.surface);
  root.style.setProperty("--surface-muted", settings.background);
  root.style.setProperty("--button-primary", settings.primary);
  root.style.setProperty("--button-danger", settings.error);
  root.style.setProperty("--badge-success", settings.success);
  root.style.setProperty("--badge-warning", settings.warning);

  // Design tokens
  root.style.setProperty("--radius-card", `${settings.borderRadius}px`);
  root.style.setProperty("--radius-image", `${settings.borderRadius}px`);
  root.style.setProperty("--radius-button", `${Math.max(0, settings.borderRadius - 8)}px`);
  root.style.setProperty("--radius-input", `${Math.max(0, settings.borderRadius - 10)}px`);
  root.style.setProperty("--shadow-luxury", SHADOW_MAP[settings.shadowStyle] || SHADOW_MAP.luxury);

  // Animation speed & Motion Tokens
  const isFast = settings.animationSpeed === "fast";
  const isLuxury = settings.animationSpeed === "luxury";
  root.style.setProperty("--motion-fast", isFast ? "100ms" : isLuxury ? "200ms" : "150ms");
  root.style.setProperty("--motion-normal", isFast ? "150ms" : isLuxury ? "350ms" : "250ms");
  root.style.setProperty("--motion-slow", isFast ? "250ms" : isLuxury ? "500ms" : "350ms");
  root.style.setProperty("--animation-speed", isFast ? "0.15s" : isLuxury ? "0.6s" : "0.3s");

  // Load Google Fonts dynamically at runtime
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const headingFontClean = settings.headingFont.replace(/\s+/g, "+");
    const bodyFontClean = settings.bodyFont.replace(/\s+/g, "+");
    const buttonFontClean = settings.buttonFont.replace(/\s+/g, "+");

    let fontLink = document.getElementById("brand-fonts") as HTMLLinkElement;
    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.id = "brand-fonts";
      fontLink.rel = "stylesheet";
      document.head.appendChild(fontLink);
    }
    fontLink.href = `https://fonts.googleapis.com/css2?family=${headingFontClean}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=${bodyFontClean}:wght@300;400;500;600;700&family=${buttonFontClean}:wght@300;400;500;600;700&display=swap`;

    root.style.setProperty("--heading-font", `'${settings.headingFont}', serif`);
    root.style.setProperty("--body-font", `'${settings.bodyFont}', sans-serif`);
    root.style.setProperty("--button-font", `'${settings.buttonFont}', sans-serif`);
  }
}

// ── Context Definition ───────────────────────────────────────────────

interface BrandContextValue {
  brand: BrandSettings;
  updateBrand: (partial: Partial<BrandSettings>) => void;
  applyPreset: (preset: ThemePreset) => void;
  resetToDefaults: () => void;
  presets: Record<Exclude<ThemePreset, "custom">, Partial<BrandSettings>>;
}

const BrandContext = createContext<BrandContextValue | null>(null);

const STORAGE_KEY = "sss_brand_settings";

// ── Provider ─────────────────────────────────────────────────────────

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<BrandSettings>;
        const merged = { ...DEFAULT_BRAND_SETTINGS, ...parsed };
        setTimeout(() => {
          setBrand(merged);
        }, 0);
        injectCSSVariables(merged);
      } else {
        injectCSSVariables(DEFAULT_BRAND_SETTINGS);
      }
    } catch {
      injectCSSVariables(DEFAULT_BRAND_SETTINGS);
    }
    setHydrated(true);
  }, []);

  const updateBrand = useCallback((partial: Partial<BrandSettings>) => {
    setBrand((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Failed to persist brand settings", e);
      }
      injectCSSVariables(next);
      return next;
    });
  }, []);

  const applyPreset = useCallback((preset: ThemePreset) => {
    if (preset === "custom") {
      updateBrand({ themePreset: "custom" });
    } else {
      const presetColors = PRESET_THEMES[preset];
      updateBrand({ ...presetColors, themePreset: preset });
    }
  }, [updateBrand]);

  const resetToDefaults = useCallback(() => {
    setBrand(DEFAULT_BRAND_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    injectCSSVariables(DEFAULT_BRAND_SETTINGS);
  }, []);

  // Don't render children until hydrated to avoid flash
  if (!hydrated) {
    return null;
  }

  return (
    <BrandContext.Provider value={{ brand, updateBrand, applyPreset, resetToDefaults, presets: PRESET_THEMES }}>
      {children}
    </BrandContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) {
    throw new Error("useBrand must be used within a <BrandProvider>");
  }
  return ctx;
}

export default BrandProvider;
