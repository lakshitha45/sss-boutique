"use client";

import { motion, useInView } from "framer-motion";
import { Heart, Star, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

interface BestSellerProduct {
  id: string;
  name: string;
  href: string;
  src: string;
  alt: string;
  price: number;
  discountPrice: number;
  rating: number;
  ratingCount: number;
}

const bestSellers: BestSellerProduct[] = [
  {
    id: "grey-paisley-kurti",
    name: "Paisley Print Straight Kurti Set",
    href: "/products/grey-paisley-kurti",
    src: "/bestseller1.jpg",
    alt: "Grey and olive green paisley print cotton straight kurti with trousers",
    price: 2999,
    discountPrice: 1999,
    rating: 4.8,
    ratingCount: 340,
  },
  {
    id: "black-anarkali-set",
    name: "Classic Black Anarkali Suit Set",
    href: "/products/black-anarkali-set",
    src: "/bestseller2.jpg",
    alt: "Elegant black anarkali print set with matching dupatta and pants",
    price: 3999,
    discountPrice: 2799,
    rating: 4.9,
    ratingCount: 512,
  },
  {
    id: "navy-leaf-kurti",
    name: "Indigo Leaf Print A-Line Kurti",
    href: "/products/navy-leaf-kurti",
    src: "/bestseller3.jpg",
    alt: "Indigo navy blue A-line kurti with gold leaf details",
    price: 2499,
    discountPrice: 1699,
    rating: 4.7,
    ratingCount: 215,
  },
  {
    id: "yellow-floral-set",
    name: "Jaipur Yellow Floral Suit Set",
    href: "/products/yellow-floral-set",
    src: "/bestseller4.jpg",
    alt: "Jaipur yellow floral print cotton kurti set with dupatta",
    price: 3599,
    discountPrice: 2499,
    rating: 4.6,
    ratingCount: 188,
  },
  {
    id: "navy-indigo-anarkali",
    name: "Indigo Blue Block Print Anarkali",
    href: "/products/navy-indigo-anarkali",
    src: "/bestseller5.jpg",
    alt: "Indigo blue block print cotton anarkali kurti with white pants",
    price: 3299,
    discountPrice: 2199,
    rating: 4.8,
    ratingCount: 295,
  },
  {
    id: "mandala-geometric-kurti",
    name: "Mandala Geometric Pattern Kurti Set",
    href: "/products/mandala-geometric-kurti",
    src: "/bestseller6.jpg",
    alt: "Beige and black geometric mandala print straight kurti with palazzo trousers",
    price: 2899,
    discountPrice: 1999,
    rating: 4.7,
    ratingCount: 142,
  },
  {
    id: "rust-jaipur-kurti",
    name: "Rust Red Traditional Cotton Kurti",
    href: "/products/rust-jaipur-kurti",
    src: "/bestseller7.jpg",
    alt: "Rust red traditional floral printed cotton straight kurti with pockets",
    price: 2399,
    discountPrice: 1599,
    rating: 4.5,
    ratingCount: 88,
  },
  {
    id: "black-dupatta-set",
    name: "Noir Elegance Printed Anarkali Set",
    href: "/products/black-dupatta-set",
    src: "/bestseller8.jpg",
    alt: "Black block print flared anarkali suit set with matching printed dupatta",
    price: 4299,
    discountPrice: 2999,
    rating: 4.9,
    ratingCount: 403,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function BestSellers() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      aria-labelledby="bestsellers-heading"
      className="w-full bg-white py-16 sm:py-24 px-5 sm:px-10 lg:px-16 xl:px-24 border-t border-neutral-100"
    >
      {/* ── Centered Heading with Underline (Exactly like Reference) ── */}
      <div className="flex flex-col items-center mb-16">
        <h2
          id="bestsellers-heading"
          className="text-3xl sm:text-4xl font-semibold tracking-[0.15em] text-neutral-900 uppercase text-center relative pb-3"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Best Sellers
        </h2>
        <div className="w-48 h-[1.5px] bg-neutral-900 -mt-1" />
      </div>

      {/* ── 4-Column Product Grid ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
      >
        {bestSellers.map((product) => (
          <motion.div
            key={product.id}
            variants={cardVariants}
            className="group flex flex-col justify-between"
          >
            <div>
              {/* Image Container with Rounded Corners and Hover Zoom */}
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-50 mb-4 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                <Image
                  src={product.src}
                  alt={product.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  quality={85}
                  priority
                />

                {/* Wishlist Button (Top Right) */}
                <button
                  aria-label={`Add ${product.name} to wishlist`}
                  className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 hover:bg-neutral-50 transition-all duration-300 group/heart"
                >
                  <Heart
                    className="w-4 h-4 text-neutral-700 transition-colors duration-300 group-hover/heart:text-red-500 group-hover/heart:fill-red-500"
                    aria-hidden="true"
                  />
                </button>
              </div>

              {/* Product Title – Elegant Serif/Heading style like mock */}
              <Link href={product.href} className="block group-hover:text-neutral-700 transition-colors mb-2">
                <h3
                  className="text-[17px] font-medium leading-snug text-neutral-900 tracking-wide font-serif"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {product.name}
                </h3>
              </Link>

              {/* Customer Rating */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <Star className="w-3.5 h-3.5 fill-[#fbbf24] text-[#fbbf24]" aria-hidden="true" />
                <span
                  className="text-xs text-neutral-500 font-medium tracking-wide"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {product.rating.toFixed(2)}/5 ({product.ratingCount >= 1000 ? `${(product.ratingCount/1000).toFixed(1)}k` : product.ratingCount} Ratings)
                </span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-[18px] font-bold text-neutral-950">
                  ₹{product.discountPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-[14px] text-neutral-400 line-through">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Flat Black Add to Cart Button */}
            <button
              className="w-full bg-[#111111] hover:bg-black text-white py-3 rounded-lg text-xs font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-sm active:scale-[0.98]"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
              Add To Cart
            </button>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
