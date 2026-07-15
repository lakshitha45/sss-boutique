"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBrand } from "@/features/brand/BrandContext";
import type { ThemePreset, ShadowStyle, AnimationSpeed, PageTransition, ButtonHover, CardHover } from "@/types";
import { 
  Save, AlertTriangle, Key, Mail, Sliders, Palette, Type, Layout, 
  Smartphone, Share2, Sparkles, Check, RefreshCw, Heart, ShoppingBag
} from "lucide-react";

// ── Toggle Switch Component ──────────────────────────────────────────

const ToggleSwitch = ({
  enabled,
  onChange,
  label,
  description,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-[#1C1C1C]">
    <div className="space-y-0.5">
      <span className="text-xs font-semibold text-zinc-200 block">{label}</span>
      {description && <p className="text-[10px] text-zinc-500 font-light">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
        enabled ? "bg-accent" : "bg-[#2A2A2A]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
          enabled ? "translate-x-5" : ""
        }`}
      />
    </button>
  </div>
);

// ── Color Picker Component ───────────────────────────────────────────

const ColorPicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
      {label}
    </label>
    <div className="flex space-x-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 bg-[#0A0A0A] border border-[#1C1C1C] p-1 cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2 focus:outline-none focus:border-accent text-white uppercase font-mono text-xs"
      />
    </div>
  </div>
);

// ── Settings Page Component ──────────────────────────────────────────

export default function SettingsPage() {
  const { brand, updateBrand, applyPreset, resetToDefaults, presets } = useBrand();
  const [activeTab, setActiveTab] = useState<
    "identity" | "colors" | "typography" | "layout" | "contact" | "permissions"
  >("identity");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local state for the static permissions matrix
  const [permissions, setPermissions] = useState({
    products: { superadmin: true, admin: true, staff: true, viewer: true },
    orders: { superadmin: true, admin: true, staff: true, viewer: true },
    customers: { superadmin: true, admin: true, staff: true, viewer: true },
    analytics: { superadmin: true, admin: false, staff: false, viewer: true },
    settings: { superadmin: true, admin: false, staff: false, viewer: false },
    import: { superadmin: true, admin: true, staff: false, viewer: false },
    banners: { superadmin: true, admin: true, staff: false, viewer: false },
    coupons: { superadmin: true, admin: true, staff: false, viewer: false },
    reviews: { superadmin: true, admin: true, staff: true, viewer: false },
  });

  const togglePermission = (rowKey: keyof typeof permissions, colKey: "admin" | "staff") => {
    setPermissions((prev) => ({
      ...prev,
      [rowKey]: {
        ...prev[rowKey],
        [colKey]: !prev[rowKey][colKey],
      },
    }));
  };

  const triggerSaveNotification = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSaveNotification();
  };

  return (
    <div className="space-y-8 font-poppins text-zinc-100 bg-[#0A0A0A]">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">
            White-Label Engine
          </span>
          <h1 className="font-serif text-3xl font-light tracking-wide text-white">
            Brand Management
          </h1>
          <div className="w-12 h-[1px] bg-accent mt-3" />
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset all brand customization defaults?")) {
              resetToDefaults();
              triggerSaveNotification();
            }
          }}
          className="flex items-center space-x-1.5 border border-zinc-800 text-zinc-400 hover:text-white px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Save Success Alert Notification */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Brand settings updated and injected successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-[#1C1C1C] text-[10px] font-bold uppercase tracking-wider text-zinc-500 gap-6 overflow-x-auto pb-px">
        {[
          { id: "identity", label: "Identity" },
          { id: "colors", label: "Colors & Presets" },
          { id: "typography", label: "Typography & Design" },
          { id: "layout", label: "Layout & Modules" },
          { id: "contact", label: "Contact & Social" },
          { id: "permissions", label: "Permissions" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 relative transition-colors whitespace-nowrap ${
              activeTab === tab.id ? "text-accent font-semibold" : "hover:text-zinc-300"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="settingsTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-accent"
              />
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* TAB 1: IDENTITY */}
          {activeTab === "identity" && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-[#121212] border border-[#1C1C1C] p-6 space-y-6"
            >
              <h3 className="font-serif text-sm font-semibold text-white tracking-wide flex items-center space-x-2">
                <Sliders className="w-4.5 h-4.5 text-accent" />
                <span>Brand Name & Logos Assets</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={brand.brandName}
                    onChange={(e) => updateBrand({ brandName: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                    placeholder="e.g. SSS Boutique"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Business Tagline
                  </label>
                  <input
                    type="text"
                    value={brand.tagline}
                    onChange={(e) => updateBrand({ tagline: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                    placeholder="e.g. Luxury Silhouettes Redefined"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Footer Copyright Line
                  </label>
                  <input
                    type="text"
                    value={brand.copyright}
                    onChange={(e) => updateBrand({ copyright: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                  />
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: COLORS & PRESETS */}
          {activeTab === "colors" && (
            <motion.div
              key="colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              {/* Presets Row */}
              <div className="bg-[#121212] border border-[#1C1C1C] p-6 space-y-4">
                <h3 className="font-serif text-sm font-semibold text-white tracking-wide flex items-center space-x-2">
                  <Palette className="w-4.5 h-4.5 text-accent" />
                  <span>Choose Theme Preset</span>
                </h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {(["luxury-pink", "luxury-black", "luxury-beige", "luxury-gold"] as const).map((preset) => {
                    const isSelected = brand.themePreset === preset;
                    const previewColors = presets[preset];
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={`p-4 border text-left flex flex-col justify-between h-28 relative transition duration-300 ${
                          isSelected 
                            ? "border-accent bg-accent/5" 
                            : "border-[#1F1F1F] bg-[#0E0E0E] hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                            {preset.replace("-", " ")}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-accent" />}
                        </div>

                        {/* Visual Swatch Row */}
                        <div className="flex space-x-1.5">
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: previewColors.primary }} />
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: previewColors.accent }} />
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: previewColors.background }} />
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: previewColors.surface }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Pickers Detail Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Brand Colors Column */}
                <div className="bg-[#121212] border border-[#1C1C1C] p-6 space-y-4">
                  <h4 className="text-[10px] font-bold tracking-widest text-accent uppercase border-b border-[#1C1C1C] pb-2">
                    Primary & Accent
                  </h4>
                  <div className="space-y-4">
                    <ColorPicker
                      label="Primary Color"
                      value={brand.primary}
                      onChange={(val) => updateBrand({ primary: val, themePreset: "custom" })}
                    />
                    <ColorPicker
                      label="Primary Hover"
                      value={brand.primaryHover}
                      onChange={(val) => updateBrand({ primaryHover: val, themePreset: "custom" })}
                    />
                    <ColorPicker
                      label="Secondary Color"
                      value={brand.secondary}
                      onChange={(val) => updateBrand({ secondary: val, themePreset: "custom" })}
                    />
                    <ColorPicker
                      label="Accent Color"
                      value={brand.accent}
                      onChange={(val) => updateBrand({ accent: val, themePreset: "custom" })}
                    />
                    <ColorPicker
                      label="Accent Hover"
                      value={brand.accentHover}
                      onChange={(val) => updateBrand({ accentHover: val, themePreset: "custom" })}
                    />
                  </div>
                </div>

                {/* Base Surfaces Column */}
                <div className="bg-[#121212] border border-[#1C1C1C] p-6 space-y-4">
                  <h4 className="text-[10px] font-bold tracking-widest text-accent uppercase border-b border-[#1C1C1C] pb-2">
                    Surfaces & Text
                  </h4>
                  <div className="space-y-4">
                    <ColorPicker
                      label="Background"
                      value={brand.background}
                      onChange={(val) => updateBrand({ background: val, themePreset: "custom" })}
                    />
                    <ColorPicker
                      label="Card/Surface Panel"
                      value={brand.surface}
                      onChange={(val) => updateBrand({ surface: val, themePreset: "custom" })}
                    />
                    <ColorPicker
                      label="Text Foreground"
                      value={brand.foreground}
                      onChange={(val) => updateBrand({ foreground: val, themePreset: "custom" })}
                    />
                    <ColorPicker
                      label="Borders & Dividers"
                      value={brand.border}
                      onChange={(val) => updateBrand({ border: val, themePreset: "custom" })}
                    />
                  </div>
                </div>

                {/* Live Mock Preview Swatch */}
                <div className="bg-[#121212] border border-[#1C1C1C] p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold tracking-widest text-accent uppercase border-b border-[#1C1C1C] pb-2 mb-4">
                      Live Component Swatch
                    </h4>
                    
                    {/* Mockup component rendered inline with brand settings */}
                    <div 
                      className="border p-4 space-y-3"
                      style={{ 
                        backgroundColor: brand.background,
                        color: brand.foreground,
                        borderColor: brand.border,
                        borderRadius: `${brand.borderRadius}px`
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-wider opacity-60">Mock Card Preview</span>
                        <Heart className="w-3.5 h-3.5" style={{ color: brand.primary }} />
                      </div>
                      <h5 className="font-serif text-sm font-semibold">Premium Cashmere Coat</h5>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs">₹8,999</span>
                        <span className="text-[10px] line-through opacity-50">₹14,999</span>
                      </div>
                      
                      <button
                        type="button"
                        className="w-full py-2 text-[9px] font-bold uppercase tracking-widest transition duration-300 flex items-center justify-center space-x-1"
                        style={{
                          backgroundColor: brand.primary,
                          color: brand.background,
                          borderRadius: `${Math.max(0, brand.borderRadius - 8)}px`
                        }}
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add To Bag</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#1C1C1C] text-[10px] text-zinc-500 font-light leading-relaxed">
                    Theme mode is set to <span className="font-semibold text-white uppercase">{brand.themePreset}</span>. Any individual picker override shifts preset status to Custom.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: TYPOGRAPHY & DESIGN TOKENS */}
          {activeTab === "typography" && (
            <motion.div
              key="typography"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-[#121212] border border-[#1C1C1C] p-6 space-y-6"
            >
              <h3 className="font-serif text-sm font-semibold text-white tracking-wide flex items-center space-x-2">
                <Type className="w-4.5 h-4.5 text-accent" />
                <span>Typography Styles & Sizing Tokens</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    Heading Font
                  </label>
                  <select
                    value={brand.headingFont}
                    onChange={(e) => updateBrand({ headingFont: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                  >
                    {["Playfair Display", "Cormorant Garamond", "Poppins", "Montserrat", "DM Serif Display"].map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    Body Text Font
                  </label>
                  <select
                    value={brand.bodyFont}
                    onChange={(e) => updateBrand({ bodyFont: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                  >
                    {["Inter", "Roboto", "Open Sans", "Poppins"].map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    Buttons Font
                  </label>
                  <select
                    value={brand.buttonFont}
                    onChange={(e) => updateBrand({ buttonFont: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                  >
                    {["Poppins", "Inter", "Montserrat"].map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-[#1C1C1C] pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Border Radius Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-400">
                      <span>Border Radius Corner Curve</span>
                      <span className="text-white font-mono">{brand.borderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="32"
                      value={brand.borderRadius}
                      onChange={(e) => updateBrand({ borderRadius: parseInt(e.target.value) })}
                      className="w-full accent-accent cursor-pointer bg-zinc-800"
                    />
                  </div>

                  {/* Shadow Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Aesthetic Shadows
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(["minimal", "soft", "luxury", "glass", "none"] as ShadowStyle[]).map((sh) => (
                        <button
                          key={sh}
                          type="button"
                          onClick={() => updateBrand({ shadowStyle: sh })}
                          className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition ${
                            brand.shadowStyle === sh 
                              ? "border-accent bg-accent/5 text-accent" 
                              : "border-[#1F1F1F] bg-[#0E0E0E] text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          {sh}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {/* Animation Speed */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Transitions Tempo
                    </label>
                    <div className="flex space-x-2">
                      {(["fast", "normal", "luxury"] as AnimationSpeed[]).map((speed) => (
                        <button
                          key={speed}
                          type="button"
                          onClick={() => updateBrand({ animationSpeed: speed })}
                          className={`flex-1 py-2 border text-[9px] font-bold uppercase tracking-wider transition ${
                            brand.animationSpeed === speed 
                              ? "border-accent bg-accent/5 text-accent" 
                              : "border-[#1F1F1F] bg-[#0E0E0E] text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          {speed}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Button Hover */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Buttons Hover Gesture
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {(["scale", "glow", "lift", "border", "none"] as ButtonHover[]).map((bh) => (
                        <button
                          key={bh}
                          type="button"
                          onClick={() => updateBrand({ buttonHover: bh })}
                          className={`px-2 py-1.5 border text-[8px] font-bold uppercase tracking-widest transition ${
                            brand.buttonHover === bh 
                              ? "border-accent bg-accent/5 text-accent" 
                              : "border-[#1F1F1F] bg-[#0E0E0E] text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          {bh}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Hover */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Catalog Cards Hover
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {(["lift", "tilt", "glow", "minimal"] as CardHover[]).map((ch) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => updateBrand({ cardHover: ch })}
                          className={`px-2.5 py-1.5 border text-[8px] font-bold uppercase tracking-widest transition ${
                            brand.cardHover === ch 
                              ? "border-accent bg-accent/5 text-accent" 
                              : "border-[#1F1F1F] bg-[#0E0E0E] text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: LAYOUT & ELEMENT MODULES */}
          {activeTab === "layout" && (
            <motion.div
              key="layout"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-[#121212] border border-[#1C1C1C] p-6 space-y-6"
            >
              <h3 className="font-serif text-sm font-semibold text-white tracking-wide flex items-center space-x-2">
                <Layout className="w-4.5 h-4.5 text-accent" />
                <span>Layout Settings & Features Toggles</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Navbar Elements */}
                <div className="space-y-2">
                  <h4 className="text-[9px] font-bold uppercase tracking-wider text-accent border-b border-[#1C1C1C] pb-1.5 mb-2">
                    Navigation Header Configuration
                  </h4>
                  <ToggleSwitch
                    enabled={brand.stickyNavbar}
                    onChange={(val) => updateBrand({ stickyNavbar: val })}
                    label="Sticky Navbar Navigation"
                    description="Keep header bar locked to the top during scroll."
                  />
                  <ToggleSwitch
                    enabled={brand.transparentNavbar}
                    onChange={(val) => updateBrand({ transparentNavbar: val })}
                    label="Transparent overlay"
                    description="Transparency overlay on banner sections."
                  />
                  <ToggleSwitch
                    enabled={brand.announcementBar}
                    onChange={(val) => updateBrand({ announcementBar: val })}
                    label="Active Announcement Bar Banner"
                    description="Toggle the thin alert info bar above navigation."
                  />
                  {brand.announcementBar && (
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                        Announcement Banner Content Text
                      </label>
                      <input
                        type="text"
                        value={brand.announcementText}
                        onChange={(e) => updateBrand({ announcementText: e.target.value })}
                        className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 focus:outline-none focus:border-accent text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Modules Activation */}
                <div className="space-y-2">
                  <h4 className="text-[9px] font-bold uppercase tracking-wider text-accent border-b border-[#1C1C1C] pb-1.5 mb-2">
                    Header Icons Shortcuts Toggles
                  </h4>
                  <ToggleSwitch
                    enabled={brand.showSearch}
                    onChange={(val) => updateBrand({ showSearch: val })}
                    label="Enable search palette"
                    description="Display the magnifier lens link overlay."
                  />
                  <ToggleSwitch
                    enabled={brand.showWishlist}
                    onChange={(val) => updateBrand({ showWishlist: val })}
                    label="Enable Customer Saved Wishlist"
                    description="Permit saved wishlists grid folders."
                  />
                  <ToggleSwitch
                    enabled={brand.showCart}
                    onChange={(val) => updateBrand({ showCart: val })}
                    label="Fulfillment cart drawer"
                    description="Render floating shopping bag checkout widgets."
                  />
                </div>
              </div>

              <div className="border-t border-[#1C1C1C] pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Glassmorphism settings */}
                <div className="space-y-2">
                  <h4 className="text-[9px] font-bold uppercase tracking-wider text-accent border-b border-[#1C1C1C] pb-1.5 mb-2">
                    Glassmorphism Blur Overlay Effect
                  </h4>
                  <ToggleSwitch
                    enabled={brand.glassNavbar}
                    onChange={(val) => updateBrand({ glassNavbar: val })}
                    label="Glassmorphism header overlay"
                  />
                  <ToggleSwitch
                    enabled={brand.glassCards}
                    onChange={(val) => updateBrand({ glassCards: val })}
                    label="Glassmorphism layout cards"
                  />
                  <ToggleSwitch
                    enabled={brand.glassDialogs}
                    onChange={(val) => updateBrand({ glassDialogs: val })}
                    label="Glassmorphism dropdown modales"
                  />
                </div>

                {/* Footer layout */}
                <div className="space-y-2">
                  <h4 className="text-[9px] font-bold uppercase tracking-wider text-accent border-b border-[#1C1C1C] pb-1.5 mb-2">
                    Footer Widget Toggles
                  </h4>
                  <ToggleSwitch
                    enabled={brand.showNewsletter}
                    onChange={(val) => updateBrand({ showNewsletter: val })}
                    label="Email Newsletter widget panel"
                  />
                  <ToggleSwitch
                    enabled={brand.showInstagramFeed}
                    onChange={(val) => updateBrand({ showInstagramFeed: val })}
                    label="Dynamic Instagram Gallery integration"
                  />
                  <ToggleSwitch
                    enabled={brand.showQuickLinks}
                    onChange={(val) => updateBrand({ showQuickLinks: val })}
                    label="Fulfillment Quick links folders"
                  />
                  <ToggleSwitch
                    enabled={brand.showPaymentIcons}
                    onChange={(val) => updateBrand({ showPaymentIcons: val })}
                    label="Display card payment providers logo"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: CONTACT & SOCIAL MEDIA */}
          {activeTab === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-[#121212] border border-[#1C1C1C] p-6 space-y-6"
            >
              <h3 className="font-serif text-sm font-semibold text-white tracking-wide flex items-center space-x-2">
                <Smartphone className="w-4.5 h-4.5 text-accent" />
                <span>Contact Channels & Business Info</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Customer Hotline Phone
                  </label>
                  <input
                    type="text"
                    value={brand.phone}
                    onChange={(e) => updateBrand({ phone: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Official Support Email
                  </label>
                  <input
                    type="text"
                    value={brand.email}
                    onChange={(e) => updateBrand({ email: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Store Headquarter Address
                  </label>
                  <input
                    type="text"
                    value={brand.address}
                    onChange={(e) => updateBrand({ address: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    WhatsApp Chat Link Number
                  </label>
                  <input
                    type="text"
                    value={brand.whatsapp}
                    onChange={(e) => updateBrand({ whatsapp: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Customer Service Operations Hours
                  </label>
                  <input
                    type="text"
                    value={brand.businessHours}
                    onChange={(e) => updateBrand({ businessHours: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                  />
                </div>
              </div>

              <div className="border-t border-[#1C1C1C] pt-6 space-y-4">
                <h4 className="font-serif text-sm font-semibold text-white tracking-wide flex items-center space-x-2">
                  <Share2 className="w-4.5 h-4.5 text-accent" />
                  <span>Social Links Directories</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      Instagram Profile URL
                    </label>
                    <input
                      type="text"
                      value={brand.instagram}
                      onChange={(e) => updateBrand({ instagram: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      Facebook Page URL
                    </label>
                    <input
                      type="text"
                      value={brand.facebook}
                      onChange={(e) => updateBrand({ facebook: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      YouTube Channel Link
                    </label>
                    <input
                      type="text"
                      value={brand.youtube}
                      onChange={(e) => updateBrand({ youtube: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      Pinterest Board directory
                    </label>
                    <input
                      type="text"
                      value={brand.pinterest}
                      onChange={(e) => updateBrand({ pinterest: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: PERMISSIONS */}
          {activeTab === "permissions" && (
            <motion.div
              key="permissions"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-[#121212] border border-[#1C1C1C] p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <h3 className="font-serif text-sm font-semibold text-white tracking-wide flex items-center space-x-2">
                  <Key className="w-4.5 h-4.5 text-accent" />
                  <span>Administrative Role Credentials Matrix</span>
                </h3>
                <p className="text-zinc-500 font-light leading-relaxed text-[11px]">
                  Configure what platform console actions each user role level is permitted to invoke. Super Admin roles hold universal access keys.
                </p>
              </div>

              {/* MATRIX TABLE */}
              <div className="overflow-x-auto border border-[#1C1C1C] mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1C1C1C] text-[9px] text-zinc-500 uppercase tracking-widest font-bold bg-[#0C0C0C]">
                      <th className="p-3">Console Module</th>
                      <th className="p-3 text-center">Super Admin</th>
                      <th className="p-3 text-center">Admin</th>
                      <th className="p-3 text-center">Staff / Editor</th>
                      <th className="p-3 text-center">Viewer (Auditor)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1C1C] text-[11px] text-zinc-300">
                    {(Object.keys(permissions) as Array<keyof typeof permissions>).map((rowKey) => {
                      const row = permissions[rowKey];
                      return (
                        <tr key={rowKey} className="hover:bg-[#1A1A1A] transition">
                          <td className="p-3 font-semibold text-white capitalize">{rowKey}</td>
                          {/* Super admin always true */}
                          <td className="p-3 text-center">
                            <input type="checkbox" checked={true} disabled className="accent-accent w-4.5 h-4.5 cursor-not-allowed opacity-50" />
                          </td>
                          {/* Admin toggle */}
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={row.admin}
                              onChange={() => togglePermission(rowKey, "admin")}
                              className="accent-accent w-4.5 h-4.5 cursor-pointer"
                            />
                          </td>
                          {/* Staff toggle */}
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={row.staff}
                              onChange={() => togglePermission(rowKey, "staff")}
                              className="accent-accent w-4.5 h-4.5 cursor-pointer"
                            />
                          </td>
                          {/* Viewer always false (or static readonly checked) */}
                          <td className="p-3 text-center">
                            <input type="checkbox" checked={rowKey === "products" || rowKey === "orders" || rowKey === "customers" || rowKey === "analytics"} disabled className="accent-accent w-4.5 h-4.5 cursor-not-allowed opacity-50" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SAVE TRIGGER */}
        <div className="flex justify-end border-t border-[#1C1C1C] pt-6">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-accent text-foreground hover:bg-accent/90 transition px-5 py-2.5 font-bold uppercase tracking-wider text-[10px] shadow-luxury"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
