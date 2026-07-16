"use client";

import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

interface PromoCard {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  src: string;
  alt: string;
  overlay: string;
}

const cards: PromoCard[] = [
  {
    id: "new-arrival",
    label: "New Arrival",
    sublabel: "Fresh drops every week",
    href: "/new-arrival",
    src: "/card-new-arrival.png",
    alt: "Elegant woman in white blazer and ivory trousers — New Arrival collection",
    overlay:
      "linear-gradient(to top, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.10) 55%, transparent 100%)",
  },
  {
    id: "summer-collection",
    label: "Summer Collection",
    sublabel: "Golden-hour essentials",
    href: "/summer-collection",
    src: "/card-summer-collection.png",
    alt: "Woman in floral sundress and sun hat — Summer Collection",
    overlay:
      "linear-gradient(to top, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.10) 55%, transparent 100%)",
  },
  {
    id: "trending",
    label: "Trending",
    sublabel: "What the world is wearing",
    href: "/trending",
    src: "/card-trending.png",
    alt: "Woman in camel coat and silk slip dress — Trending now",
    overlay:
      "linear-gradient(to top, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.10) 55%, transparent 100%)",
  },
];

/* ─── Animation variants ─────────────────────────────────────────────────── */

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 44 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/* ─── Card component ─────────────────────────────────────────────────────── */

function Card({ card }: { card: PromoCard }) {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative rounded-2xl overflow-hidden cursor-pointer
                 shadow-sm hover:shadow-xl transition-shadow duration-500"
    >
      <Link
        href={card.href}
        id={`promo-card-${card.id}`}
        aria-label={`Shop ${card.label}`}
        className="block w-full"
      >
        {/* Fixed uniform height — same on every card */}
        <div className="relative w-full h-[480px] sm:h-[520px] lg:h-[560px]">
          <Image
            src={card.src}
            alt={card.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: "cover", objectPosition: "center top" }}
            className="transition-transform duration-700 ease-out will-change-transform
                       group-hover:scale-[1.04]"
            quality={85}
          />

          {/* Dark gradient overlay — always present, intensifies on hover */}
          <div
            className="absolute inset-0 transition-opacity duration-500
                       opacity-80 group-hover:opacity-100"
            style={{ background: card.overlay }}
            aria-hidden="true"
          />

          {/* Subtle sheen on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100
                       transition-opacity duration-700 pointer-events-none"
            style={{
              background:
                "linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%)",
            }}
            aria-hidden="true"
          />

          {/* ── Centered bottom label ── */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center
                          justify-end pb-8 gap-3 text-center px-4">

            {/* Pill label — always visible, lifts subtly on hover */}
            <span
              className="inline-block bg-white/18 backdrop-blur-md
                         border border-white/30 text-white
                         rounded-full px-5 py-2 text-[11px] font-semibold
                         tracking-[0.22em] uppercase shadow-sm
                         translate-y-0 group-hover:-translate-y-1
                         transition-transform duration-500"
            >
              {card.label}
            </span>

            {/* Sublabel — slides up + fades in on hover */}
            <p
              className="text-white/70 text-[13px] font-medium tracking-wide
                         opacity-0 translate-y-2
                         group-hover:opacity-100 group-hover:translate-y-0
                         transition-all duration-500 delay-100"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {card.sublabel}
            </p>

            {/* Shop CTA — slides up on hover */}
            <span
              className="inline-flex items-center gap-1.5 text-white/80
                         text-[11px] font-semibold tracking-[0.18em] uppercase
                         border-b border-white/35 pb-px
                         opacity-0 translate-y-2
                         group-hover:opacity-100 group-hover:translate-y-0
                         transition-all duration-500 delay-[160ms]"
            >
              Shop Now
              <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Main section ───────────────────────────────────────────────────────── */

export default function PromoSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      aria-labelledby="promo-section-heading"
      className="w-full bg-[#faf9f6] py-20 sm:py-28 px-5 sm:px-10 lg:px-16 xl:px-24"
    >
      {/* ── Section header ── */}
      <motion.div
        variants={headingVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="flex flex-col sm:flex-row sm:items-end justify-between
                   gap-4 mb-12 sm:mb-14"
      >
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-px bg-neutral-400" aria-hidden="true" />
            <span
              className="text-xs font-semibold tracking-[0.25em] uppercase text-neutral-500"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Curated for You
            </span>
          </div>
          <h2
            id="promo-section-heading"
            className="text-4xl sm:text-5xl font-bold leading-tight text-neutral-900"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Shop by{" "}
            <span className="italic text-neutral-400">Category</span>
          </h2>
        </div>

        <Link
          href="/collections"
          id="promo-view-all-btn"
          className="group inline-flex items-center gap-2 text-sm font-semibold
                     text-neutral-900 border-b border-neutral-300
                     hover:border-neutral-900 pb-0.5
                     transition-colors duration-300 self-start sm:self-auto"
          style={{ fontFamily: "var(--font-inter)" }}
          aria-label="View all collections"
        >
          View All Collections
          <ArrowUpRight
            className="w-4 h-4 transition-transform duration-300
                       group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
      </motion.div>

      {/* ── Uniform 3-column grid ── */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
      >
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </motion.div>

      {/* ── Bottom tagline ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-14 sm:mt-20 text-center"
      >
        <p
          className="text-neutral-400 text-sm tracking-wide"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Free shipping on orders over{" "}
          <span className="text-neutral-600 font-semibold">$120</span>
          {" · "}Easy 30-day returns
        </p>
      </motion.div>
    </section>
  );
}
