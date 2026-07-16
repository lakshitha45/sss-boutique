"use client";

import { motion, useInView } from "framer-motion";
import { Heart, Star, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

/* ─── Data model for a product ─────────────────────────────────────── */
interface Product {
  id: string;
  name: string;
  href: string;
  src: string; // path to image in public folder
  alt: string;
  price: number; // original price
  discountPrice: number; // discounted price
  rating: number; // 0-5 (allow half stars)
}

const products: Product[] = [
  {
    id: "anarkali-kurti",
    name: "Gold Block Print Anarkali Kurti",
    href: "/products/anarkali-kurti",
    src: "/kurti1.jpg",
    alt: "Navy blue and gold block print anarkali kurti with matching pants",
    price: 3499,
    discountPrice: 2499,
    rating: 4.5,
  },
  {
    id: "botanical-kurti",
    name: "Olive Botanical Print Kurti",
    href: "/products/botanical-kurti",
    src: "/kurti2.jpg",
    alt: "Olive green botanical print cotton kurti with white palazzo pants",
    price: 2999,
    discountPrice: 1999,
    rating: 4,
  },
  {
    id: "teal-floral-kurti",
    name: "Teal Floral V-Neck Kurti",
    href: "/products/teal-floral-kurti",
    src: "/kurti3.jpg",
    alt: "Teal floral print V-neck kurti with cream palazzo pants",
    price: 2799,
    discountPrice: 1899,
    rating: 4.5,
  },
  {
    id: "cotton-angrakha-kurti",
    name: "White Cotton Angrakha Kurti",
    href: "/products/cotton-angrakha-kurti",
    src: "/kurti4.jpg",
    alt: "White block print cotton angrakha style kurti",
    price: 2499,
    discountPrice: 1799,
    rating: 5,
  },
  {
    id: "mauve-tiered-kurti",
    name: "Mauve Tiered Block Print Kurti",
    href: "/products/mauve-tiered-kurti",
    src: "/kurti5.jpg",
    alt: "Mauve tiered block print shirt kurti with white pants",
    price: 2699,
    discountPrice: 1899,
    rating: 4.5,
  },
  {
    id: "pink-floral-kurti",
    name: "Pink Floral Jaipur Kurti",
    href: "/products/pink-floral-kurti",
    src: "/kurti6.jpg",
    alt: "Pink and green floral print V-neck Jaipur kurti",
    price: 3199,
    discountPrice: 2299,
    rating: 4,
  },
  {
    id: "yellow-patchwork-kurti",
    name: "Yellow Patchwork Cotton Kurti",
    href: "/products/yellow-patchwork-kurti",
    src: "/kurti7.jpg",
    alt: "Pastel yellow patchwork cotton angrakha kurti with pants",
    price: 2599,
    discountPrice: 1799,
    rating: 4.5,
  },
  {
    id: "pink-embroidered-kurti",
    name: "Pink Embroidered Festive Kurti",
    href: "/products/pink-embroidered-kurti",
    src: "/kurti8.jpg",
    alt: "Hot pink embroidered festive kurti with white palazzo",
    price: 3499,
    discountPrice: 2599,
    rating: 5,
  },
];

/* ─── Motion variants ──────────────────────────────────────────────── */
const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/* ─── Helper for star rating ─────────────────────────────────────── */
function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const half = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-0.5 text-[#fbbf24]">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 fill-current" aria-hidden="true" />
      ))}
      {half && (
        <Star
          className="w-4 h-4 fill-current opacity-50"
          aria-hidden="true"
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="w-4 h-4 text-gray-300"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/* ─── Product Card component ─────────────────────────────────────── */
function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image container – fixed aspect ratio for consistency */}
      <div className="relative w-full pt-[120%]">
        <Image
          src={product.src}
          alt={product.alt}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          quality={85}
        />
        {/* Wishlist icon – top‑right */}
        <button
          aria-label="Add to wishlist"
          className="absolute top-3 right-3 bg-white/70 rounded-full p-1.5
                     hover:bg-white shadow-sm transition-colors"
        >
          <Heart className="w-5 h-5 text-neutral-600" aria-hidden="true" />
        </button>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2">
        <Link href={product.href} className="text-neutral-900 font-medium hover:underline">
          {product.name}
        </Link>
        <RatingStars rating={product.rating} />
        <div className="flex items-center gap-2 text-sm">
          <span className="line-through text-neutral-500">₹{product.price}</span>
          <span className="font-semibold text-emerald-700">₹{product.discountPrice}</span>
        </div>
        <button
          className="mt-2 w-full inline-flex items-center justify-center gap-1.5
                     bg-charcoal-900 text-white rounded-md py-2.5 text-sm font-medium
                     hover:bg-charcoal-800 transition-colors"
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Featured Products Section ───────────────────────────────────── */
export default function FeaturedProducts() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      aria-labelledby="featured-products-heading"
      className="w-full bg-[#faf9f6] py-16 sm:py-20 px-5 sm:px-10 lg:px-16 xl:px-24"
    >
      {/* Heading */}
      <motion.h2
        id="featured-products-heading"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-3xl sm:text-4xl font-bold text-center text-neutral-900 mb-10"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        Featured Products
      </motion.h2>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>
    </section>
  );
}
