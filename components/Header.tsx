"use client";

import Link from "next/link";
import { Search, Heart, User, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-50 bg-white">
      {/* ── Slim Black Announcement Bar ── */}
      <div
        className="w-full text-center py-2.5 px-4 text-xs font-medium tracking-[0.12em] text-white uppercase"
        style={{ backgroundColor: "#111111", fontFamily: "var(--font-inter, Inter, sans-serif)" }}
      >
        Free Shipping on Orders Over $100
      </div>

      {/* ── White Main Navigation Bar ── */}
      <div className="w-full border-b border-neutral-100 bg-white/95 backdrop-blur-md">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* ── Left Side: Logo ── */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-neutral-700 hover:text-black transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6 stroke-[1.5]" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              {/* Logo Box */}
              <div className="relative w-16 h-16 overflow-hidden rounded-xl flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="SSS Boutique For U"
                  fill
                  className="object-contain"
                  sizes="64px"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.parentElement?.querySelector("#header-logo-fallback") as HTMLDivElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div
                  id="header-logo-fallback"
                  className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-[#c2185b] to-[#e91e8c] text-white text-xs font-bold font-serif tracking-wider rounded-xl"
                  style={{ display: "none" }}
                >
                  SSS
                </div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span
                  className="text-lg font-bold tracking-[0.15em] text-neutral-900 uppercase font-serif"
                  style={{ fontFamily: "var(--font-playfair, serif)" }}
                >
                  SSS Boutique
                </span>
                <span className="text-[9px] font-semibold tracking-[0.3em] text-[#e91e8c] uppercase -mt-0.5">
                  For U
                </span>
              </div>
            </Link>
          </div>

          {/* ── Center: Menu Links ── */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              { label: "Events", href: "#" },
              { label: "About Us", href: "/about" },
              { label: "Contact Us", href: "#" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium tracking-wider text-neutral-500 hover:text-black transition-colors duration-200 relative py-1.5 group"
                style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#e91e8c] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* ── Right Side: Search & Icons ── */}
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            {/* Rounded Search Bar */}
            <div className="hidden md:flex items-center relative w-48 lg:w-56">
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-[#f6f6f6] text-neutral-800 text-sm pl-4 pr-10 py-2 rounded-full border border-transparent focus:bg-white focus:border-neutral-200 outline-none transition-all duration-300 placeholder-neutral-400"
                style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
              />
              <Search className="absolute right-3.5 w-4 h-4 text-neutral-400 stroke-[2] pointer-events-none" />
            </div>

            {/* Icons row */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search button mobile */}
              <button className="md:hidden p-2 text-neutral-600 hover:text-black transition-colors rounded-full hover:bg-neutral-50">
                <Search className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Wishlist */}
              <button
                aria-label="View Wishlist"
                className="p-2 text-neutral-600 hover:text-black transition-colors rounded-full hover:bg-neutral-50"
              >
                <Heart className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Account */}
              <button
                aria-label="Your Account"
                className="p-2 text-neutral-600 hover:text-black transition-colors rounded-full hover:bg-neutral-50"
              >
                <User className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Cart */}
              <button
                aria-label="Shopping Cart"
                className="p-2 text-neutral-600 hover:text-black transition-colors rounded-full hover:bg-neutral-50 relative"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#e91e8c]" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile Sidebar Drawer Menu ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full flex flex-col p-6 shadow-2xl transition-transform duration-300 z-10">
            <div className="flex items-center justify-between mb-8">
              <span
                className="text-lg font-bold tracking-[0.12em] uppercase font-serif"
                style={{ fontFamily: "var(--font-playfair, serif)" }}
              >
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-black transition-colors rounded-full hover:bg-neutral-100"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 stroke-[1.5]" />
              </button>
            </div>

            <nav className="flex flex-col gap-5">
              {[
                { label: "Home", href: "/" },
                { label: "Shop", href: "/shop" },
                { label: "Events", href: "#" },
                { label: "About Us", href: "/about" },
                { label: "Contact Us", href: "#" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold tracking-wide text-neutral-600 hover:text-black transition-colors border-b border-neutral-50 pb-2"
                  style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-neutral-100 pt-6">
              <p
                className="text-xs text-neutral-400 tracking-wide mb-4 text-center"
                style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
              >
                Free Shipping on Orders Over $100
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
