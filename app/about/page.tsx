"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Tag,
  Sparkles,
  AlertCircle,
  Phone,
} from "lucide-react";

/* ── Fade-up animation ── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const info = [
  {
    icon: <Heart className="w-5 h-5 text-[#e91e8c]" />,
    label: "Owner",
    value: "Devi Jayendar",
    emoji: "❤️",
    accent: "bg-rose-50 border-rose-100",
    iconBg: "bg-rose-100",
  },
  {
    icon: <MessageCircle className="w-5 h-5 text-emerald-600" />,
    label: "WhatsApp Orders",
    value: "+91 7904004470",
    sub: "Tap to place your order",
    emoji: "📲",
    href: "https://wa.me/917904004470",
    accent: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-100",
  },
  {
    icon: <Tag className="w-5 h-5 text-[#e91e8c]" />,
    label: "Pricing",
    value: "Kurtis starting from ₹250",
    sub: "Affordable luxury for every woman",
    emoji: "🥳",
    accent: "bg-pink-50 border-pink-100",
    iconBg: "bg-pink-100",
  },
  {
    icon: <Sparkles className="w-5 h-5 text-amber-500" />,
    label: "Collections",
    value: "Budget-Friendly & Branded",
    sub: "Curated collections for every woman",
    emoji: "✨",
    accent: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-100",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full" style={{ background: "#fdf8f9" }}>
      {/* ═══════════════════════════════════════
          HERO — Fashion background with overlay
      ═══════════════════════════════════════ */}
      <section className="relative w-full h-[340px] sm:h-[400px] overflow-hidden">
        {/* Background collage of kurti images */}
        <div className="absolute inset-0 grid grid-cols-4">
          {["/kurti1.jpg", "/kurti2.jpg", "/kurti3.jpg", "/kurti4.jpg"].map(
            (src, i) => (
              <div key={i} className="relative h-full overflow-hidden">
                <Image
                  src={src}
                  alt="SSS Boutique collection"
                  fill
                  className="object-cover object-top scale-105"
                  quality={80}
                  priority={i === 0}
                />
              </div>
            )
          )}
        </div>

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(20,5,10,0.5) 0%, rgba(20,5,10,0.72) 100%)",
          }}
        />

        {/* Pink top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background:
              "linear-gradient(90deg, #c2185b, #e91e8c, #f06292, #e91e8c, #c2185b)",
          }}
        />

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            className="text-center"
          >
            {/* Eyebrow */}
            <p
              className="text-[10px] sm:text-xs font-semibold tracking-[0.35em] text-[#f9a8d4] uppercase mb-3"
              style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
            >
              ✦ Premium Women&apos;s Fashion ✦
            </p>
            {/* Title */}
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-white"
              style={{ fontFamily: "var(--font-playfair, serif)" }}
            >
              About Us
            </h1>
            {/* Thin gold underline */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="w-12 h-px bg-pink-300 opacity-60" />
              <div className="w-2 h-2 rotate-45 bg-[#e91e8c] opacity-80" />
              <div className="w-12 h-px bg-pink-300 opacity-60" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MAIN CONTENT CARD
      ═══════════════════════════════════════ */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto">

          {/* Welcome intro card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-8 sm:p-12 mb-8 relative overflow-hidden"
          >
            {/* Decorative pink top border */}
            <div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
              style={{
                background:
                  "linear-gradient(90deg, #c2185b, #e91e8c, #f9a8d4, #e91e8c, #c2185b)",
              }}
            />

            {/* Decorative faint SSS watermark */}
            <span
              className="absolute right-6 bottom-4 text-9xl font-black text-[#e91e8c] opacity-[0.03] select-none pointer-events-none"
              style={{ fontFamily: "var(--font-playfair, serif)" }}
              aria-hidden="true"
            >
              SSS
            </span>

            {/* Logo / Brand header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8">
              <div className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-md border border-neutral-100">
                <Image
                  src="/logo.png"
                  alt="SSS Boutique For U Logo"
                  fill
                  className="object-contain"
                  sizes="96px"
                  priority
                />
              </div>
              <div>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight"
                  style={{ fontFamily: "var(--font-playfair, serif)" }}
                >
                  SSS Boutique For U
                </h2>
                <p
                  className="text-[#e91e8c] text-sm font-semibold tracking-[0.2em] uppercase mt-1"
                  style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
                >
                  Premium Women&apos;s Fashion
                </p>
                <p
                  className="text-neutral-500 text-sm leading-relaxed mt-3 max-w-lg"
                  style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
                >
                  Welcome to SSS Boutique For U — your go-to destination for stylish, 
                  affordable, and high-quality fashion. We believe every woman deserves 
                  to look and feel beautiful without breaking the bank.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-neutral-100 mb-8" />

            {/* Info cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {info.map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i * 0.1}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group ${item.accent}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-400 mb-0.5"
                          style={{ fontFamily: "var(--font-inter, sans-serif)" }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="text-base font-semibold text-neutral-900 leading-snug"
                          style={{ fontFamily: "var(--font-inter, sans-serif)" }}
                        >
                          {item.value} {item.emoji}
                        </p>
                        {item.sub && (
                          <p
                            className="text-xs text-neutral-500 mt-0.5"
                            style={{ fontFamily: "var(--font-inter, sans-serif)" }}
                          >
                            {item.sub}
                          </p>
                        )}
                      </div>
                    </a>
                  ) : (
                    <div className={`flex items-start gap-4 p-5 rounded-2xl border ${item.accent}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-400 mb-0.5"
                          style={{ fontFamily: "var(--font-inter, sans-serif)" }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="text-base font-semibold text-neutral-900 leading-snug"
                          style={{ fontFamily: "var(--font-inter, sans-serif)" }}
                        >
                          {item.value} {item.emoji}
                        </p>
                        {item.sub && (
                          <p
                            className="text-xs text-neutral-500 mt-0.5"
                            style={{ fontFamily: "var(--font-inter, sans-serif)" }}
                          >
                            {item.sub}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Policy Notice Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 flex items-start gap-4 mb-8"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <h3
                className="text-sm font-semibold text-neutral-900 mb-1 tracking-wide"
                style={{ fontFamily: "var(--font-inter, sans-serif)" }}
              >
                Please Note
              </h3>
              <p
                className="text-sm text-neutral-500 leading-relaxed"
                style={{ fontFamily: "var(--font-inter, sans-serif)" }}
              >
                <span className="font-medium text-neutral-700">No Cash on Delivery (COD)</span> &nbsp;•&nbsp;{" "}
                <span className="font-medium text-neutral-700">No Returns</span> &nbsp;—&nbsp;
                We ask customers to review product details carefully before placing an order.
                All purchases are final to ensure the best pricing for everyone. 🙏
              </p>
            </div>
          </motion.div>

          {/* ── CTA Buttons ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {/* WhatsApp Order CTA */}
            <a
              href="https://wa.me/917904004470"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-4 px-8 rounded-2xl text-white font-semibold text-sm tracking-wider uppercase shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #c2185b 0%, #e91e8c 100%)",
                fontFamily: "var(--font-inter, sans-serif)",
              }}
            >
              <Phone className="w-4 h-4" />
              Order via WhatsApp
            </a>
          </motion.div>

        </div>
      </section>
    </main>
  );
}
