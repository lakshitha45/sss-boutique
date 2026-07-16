"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const fadeLeft = {
  hidden: { opacity: 0, x: -48 },
  visible: (delay: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const fadeRight = {
  hidden: { opacity: 0, x: 48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const reviews = [
  { name: "Aria K.", stars: 5 },
  { name: "Mei L.", stars: 5 },
  { name: "Priya S.", stars: 5 },
];

export default function HeroBanner() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden hero-gradient">
      {/* Background decorative blobs */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #a7f3d0, transparent)" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #86efac, transparent)" }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 -right-20 w-64 h-64 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #6ee7b7, transparent)" }}
        aria-hidden="true"
      />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-20 flex items-center justify-between px-8 md:px-16 lg:px-24 py-6"
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-playfair)", color: "#1a1a2e" }}
          >
            Élume
          </span>
        </div>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-emerald-900/70">
          {["Collection", "New Arrivals", "Sale", "About"].map((item) => (
            <li key={item}>
              <Link
                href="#"
                id={`nav-${item.toLowerCase().replace(" ", "-")}`}
                className="hover:text-emerald-900 transition-colors duration-200 relative group"
              >
                {item}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-700 transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA right */}
        <div className="flex items-center gap-3">
          <button
            id="nav-cart-btn"
            aria-label="Shopping cart"
            className="glass-card rounded-full px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-white/60 transition-all duration-200"
          >
            Bag (0)
          </button>
        </div>
      </motion.nav>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-8 md:px-16 lg:px-24 pb-16 min-h-[calc(100vh-88px)]">
        {/* ── LEFT column ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col justify-center max-w-xl lg:max-w-2xl pt-12 lg:pt-0 order-2 lg:order-1"
        >
          {/* Badge */}
          <motion.div
            variants={fadeLeft}
            custom={0}
            className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 w-fit mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-800">
              Summer Collection 2026
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeLeft}
            custom={0.1}
            className="text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.08] mb-6 text-gradient"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Elevate
            <br />
            Your
            <br />
            <span className="italic">Style</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={fadeLeft}
            custom={0.25}
            className="text-base md:text-lg text-emerald-900/65 leading-relaxed mb-10 max-w-md"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Discover handcrafted bohemian pieces designed for the free-spirited
            woman. Premium fabrics, timeless silhouettes — made to be lived in.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeLeft}
            custom={0.38}
            className="flex flex-wrap gap-4 mb-12"
          >
            <Link
              href="/shop"
              id="hero-shop-now-btn"
              className="inline-flex items-center gap-3 btn-shimmer text-white rounded-full px-8 py-4 text-sm font-semibold tracking-wide shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:shadow-emerald-900/30 hover:-translate-y-0.5 transition-all duration-300"
              aria-label="Shop the summer collection now"
            >
              Shop Now
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            <Link
              href="/lookbook"
              id="hero-lookbook-btn"
              className="inline-flex items-center gap-3 glass-card text-emerald-900 rounded-full px-8 py-4 text-sm font-semibold tracking-wide hover:bg-white/60 hover:-translate-y-0.5 transition-all duration-300"
              aria-label="View our lookbook"
            >
              View Lookbook
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={fadeUp} custom={0.5} className="flex items-center gap-4">
            {/* Avatar stack */}
            <div className="flex -space-x-3">
              {reviews.map((r, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className="w-9 h-9 rounded-full glass-card border-2 border-white/60 flex items-center justify-center text-xs font-semibold text-emerald-800"
                  style={{ zIndex: reviews.length - i }}
                >
                  {r.name[0]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-xs text-emerald-900/60 font-medium">
                4.9 · Loved by{" "}
                <span className="text-emerald-900 font-semibold">12,000+</span>{" "}
                customers
              </p>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp}
            custom={0.62}
            className="flex gap-8 mt-12 pt-8 border-t border-emerald-200/60"
          >
            {[
              { value: "200+", label: "Styles" },
              { value: "50+", label: "Countries" },
              { value: "12k+", label: "Happy Clients" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-2xl font-bold text-emerald-900"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-emerald-900/50 font-medium tracking-wide uppercase mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── RIGHT column — hero image ── */}
        <motion.div
          variants={fadeRight}
          initial="hidden"
          animate="visible"
          className="flex-1 flex items-end justify-center lg:justify-end relative order-1 lg:order-2 w-full lg:w-auto"
        >
          {/* Glow behind model */}
          <div
            className="absolute bottom-0 right-4 lg:right-0 w-80 h-80 rounded-full blur-3xl opacity-40 pointer-events-none"
            style={{ background: "radial-gradient(circle, #6ee7b7, #a7f3d0)" }}
            aria-hidden="true"
          />

          {/* Floating badge — Trending */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5, ease: "backOut" }}
            className="absolute top-8 left-0 lg:-left-6 glass-card rounded-2xl px-4 py-3 shadow-lg z-20"
            aria-label="Trending this season"
          >
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-widest mb-0.5">
              Trending
            </p>
            <p
              className="text-sm font-bold text-emerald-900"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Boho Summer
            </p>
          </motion.div>

          {/* Floating badge — Free shipping */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.5, ease: "backOut" }}
            className="absolute bottom-24 -left-4 lg:-left-8 glass-card rounded-2xl px-4 py-3 shadow-lg z-20 max-w-[160px]"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-900 leading-tight">
                  Free Shipping
                </p>
                <p className="text-xs text-emerald-700/70">Orders over $120</p>
              </div>
            </div>
          </motion.div>

          {/* The hero image itself */}
          <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-[520px] md:h-[640px] lg:h-[720px] xl:h-[800px] animate-float">
            <Image
              src="/hero.png"
              alt="Young woman wearing a colorful bohemian dress and beige straw sun hat, carrying a white leather tote handbag — Élume Summer Collection"
              fill
              sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 40vw"
              style={{ objectFit: "contain", objectPosition: "bottom center" }}
              priority
              quality={90}
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        aria-hidden="true"
      >
        <span className="text-xs font-medium tracking-widest uppercase text-emerald-800/50">
          Scroll
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-emerald-700/40 to-transparent" />
      </motion.div>
    </section>
  );
}
