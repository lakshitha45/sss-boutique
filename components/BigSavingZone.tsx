"use client";

import { motion, useInView } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

interface SavingBanner {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  href: string;
  src: string;
  alt: string;
  tag?: string;
  colSpanClass: string;
  textAlignmentClass: string;
  gradientClass: string;
  heightClass: string;
}

const savingBanners: SavingBanner[] = [
  {
    id: "daily-wear",
    title: "Daily Wear Kurtis",
    subtitle: "Effortless everyday comfort",
    discount: "UP TO 40% OFF",
    href: "/collections/daily-wear",
    src: "/saving1.jpg",
    alt: "Woman wearing rust red daily wear printed kurti",
    colSpanClass: "lg:col-span-2",
    textAlignmentClass: "items-start text-left pl-8 sm:pl-10",
    gradientClass: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
    heightClass: "h-[400px] sm:h-[440px]",
  },
  {
    id: "festive-wear",
    title: "Festive Kurtis",
    subtitle: "Celebrate in traditional elegance",
    discount: "UP TO 60% OFF",
    href: "/collections/festive",
    src: "/saving3.jpg",
    alt: "Woman wearing a bright red festive kurti set with dupatta",
    tag: "Limited Stock",
    colSpanClass: "lg:col-span-2",
    textAlignmentClass: "items-center text-center px-6",
    gradientClass: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)",
    heightClass: "h-[400px] sm:h-[440px]",
  },
  {
    id: "office-wear",
    title: "Office Wear Kurtis",
    subtitle: "Smart casuals for the workplace",
    discount: "FLAT 50% OFF",
    href: "/collections/office-wear",
    src: "/saving2.jpg",
    alt: "Woman wearing a soft pink floral print straight office kurti",
    colSpanClass: "lg:col-span-2",
    textAlignmentClass: "items-end text-right pr-8 sm:pr-10",
    gradientClass: "linear-gradient(to left, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
    heightClass: "h-[400px] sm:h-[440px]",
  },
  {
    id: "designer-wear",
    title: "Designer Kurtis",
    subtitle: "Bespoke elegance, crafted for you",
    discount: "FLAT 45% OFF",
    href: "/collections/designer",
    src: "/saving4.jpg",
    alt: "Woman wearing a luxury navy blue and gold print designer anarkali kurti",
    colSpanClass: "lg:col-span-3",
    textAlignmentClass: "items-end text-right pr-8 sm:pr-16 md:pr-24 lg:pr-16 xl:pr-24",
    gradientClass: "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 65%, transparent 100%)",
    heightClass: "h-[320px] sm:h-[360px]",
  },
  {
    id: "new-arrivals",
    title: "New Arrivals",
    subtitle: "Fresh silhouettes of the season",
    discount: "UP TO 30% OFF",
    href: "/collections/new-arrivals",
    src: "/saving5.jpg",
    alt: "Woman wearing a beige and black geometric print straight kurti",
    colSpanClass: "lg:col-span-3",
    textAlignmentClass: "items-end text-right pr-8 sm:pr-16 md:pr-24 lg:pr-16 xl:pr-24",
    gradientClass: "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 65%, transparent 100%)",
    heightClass: "h-[320px] sm:h-[360px]",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const bannerVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function BigSavingZone() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      aria-labelledby="saving-zone-heading"
      className="w-full bg-[#faf9f6] py-20 sm:py-28 px-5 sm:px-10 lg:px-16 xl:px-24 border-t border-neutral-100"
    >
      {/* ── Centered Heading with Underline (Exactly like Reference) ── */}
      <div className="flex flex-col items-center mb-16">
        <h2
          id="saving-zone-heading"
          className="text-3xl sm:text-4xl font-semibold tracking-[0.15em] text-neutral-900 uppercase text-center relative pb-3"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Big Saving Zone
        </h2>
        <div className="w-56 h-[1.5px] bg-neutral-900 -mt-1" />
      </div>

      {/* ── Responsive Masonry Grid (6-column layout logic) ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="grid grid-cols-1 lg:grid-cols-6 gap-6"
      >
        {savingBanners.map((banner) => (
          <motion.div
            key={banner.id}
            variants={bannerVariants}
            className={`group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 ${banner.colSpanClass} ${banner.heightClass}`}
          >
            <Link
              href={banner.href}
              id={`saving-banner-${banner.id}`}
              aria-label={`Shop ${banner.title}`}
              className="block w-full h-full relative"
            >
              {/* Cover Image with subtle scale zoom on hover */}
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.03]"
                style={{
                  objectPosition: banner.id === "daily-wear" ? "center 15%" : banner.id === "designer-wear" || banner.id === "new-arrivals" ? "left 20%" : "center top"
                }}
                quality={85}
                priority
              />

              {/* Gradient Overlay for Text Readability */}
              <div
                className="absolute inset-0 transition-opacity duration-300 opacity-90 group-hover:opacity-100"
                style={{ background: banner.gradientClass }}
                aria-hidden="true"
              />

              {/* Light Sheen / Highlight Sweep on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.05) 50%, transparent 65%)",
                }}
                aria-hidden="true"
              />

              {/* Limited Stock Tag */}
              {banner.tag && (
                <span
                  className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 rounded-md shadow-sm"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {banner.tag}
                </span>
              )}

              {/* ── Content Container ── */}
              <div
                className={`absolute inset-0 flex flex-col justify-center py-8 ${banner.textAlignmentClass}`}
              >
                {/* Title */}
                <h3
                  className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-medium text-white tracking-wide mb-2 uppercase font-serif"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {banner.title}
                </h3>

                {/* Subtitle */}
                <p
                  className="text-white/70 text-xs sm:text-sm font-medium tracking-wide mb-4"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {banner.subtitle}
                </p>

                {/* Discount highlight */}
                <span
                  className="text-lg sm:text-xl font-bold tracking-wider text-white mb-4 uppercase"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {banner.discount}
                </span>

                {/* Down Arrow (Mock layout feature) */}
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="text-white/60 mb-5"
                >
                  <ArrowDown className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                </motion.div>

                {/* Stylish Shop Now Button */}
                <span
                  className="inline-block border border-white/40 group-hover:border-white group-hover:bg-white/10 text-white text-[11px] font-semibold tracking-[0.2em] uppercase px-5 py-2.5 rounded-lg transition-all duration-300 shadow-sm"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Shop Now
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
