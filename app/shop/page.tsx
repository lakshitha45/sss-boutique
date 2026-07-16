"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Star, Heart, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   CATEGORY DATA — each tab with dropdown sub-items
═══════════════════════════════════════════════════════════════ */
interface SubCategory {
  label: string;
  href: string;
}

interface Category {
  label: string;
  href: string;
  subs?: SubCategory[];
}

const categories: Category[] = [
  { label: "New In", href: "/shop?cat=new-in" },
  {
    label: "Casual Wear",
    href: "/shop?cat=casual-wear",
    subs: [
      { label: "Cotton Kurtis", href: "/shop?cat=cotton-kurtis" },
      { label: "Printed Kurtis", href: "/shop?cat=printed-kurtis" },
      { label: "Straight Kurtis", href: "/shop?cat=straight-kurtis" },
      { label: "A-Line Kurtis", href: "/shop?cat=a-line-kurtis" },
      { label: "Daily Wear", href: "/shop?cat=daily-wear" },
    ],
  },
  {
    label: "Party Wear",
    href: "/shop?cat=party-wear",
    subs: [
      { label: "Designer Kurtis", href: "/shop?cat=designer-kurtis" },
      { label: "Anarkali", href: "/shop?cat=anarkali" },
      { label: "Embroidered", href: "/shop?cat=embroidered" },
      { label: "Festive Wear", href: "/shop?cat=festive-wear" },
    ],
  },
  {
    label: "On Sale",
    href: "/shop?cat=on-sale",
    subs: [
      { label: "Under ₹250", href: "/shop?cat=under-250" },
      { label: "Under ₹500", href: "/shop?cat=under-500" },
      { label: "Offers", href: "/shop?cat=offers" },
    ],
  },
  {
    label: "Plus Size",
    href: "/shop?cat=plus-size",
    subs: [
      { label: "XL Collection", href: "/shop?cat=xl" },
      { label: "2XL Collection", href: "/shop?cat=2xl" },
      { label: "3XL Collection", href: "/shop?cat=3xl" },
      { label: "4XL Collection", href: "/shop?cat=4xl" },
    ],
  },
  {
    label: "Western Wear",
    href: "/shop?cat=western-wear",
    subs: [
      { label: "Dresses", href: "/shop?cat=dresses" },
      { label: "Tops", href: "/shop?cat=tops" },
      { label: "Co-ord Sets", href: "/shop?cat=co-ord-sets" },
      { label: "Tunics", href: "/shop?cat=tunics" },
    ],
  },
  {
    label: "Cotton Full Suits",
    href: "/shop?cat=cotton-full-suits",
    subs: [
      { label: "Printed", href: "/shop?cat=printed-suits" },
      { label: "Office Wear", href: "/shop?cat=office-wear-suits" },
      { label: "Daily Wear", href: "/shop?cat=daily-wear-suits" },
    ],
  },
  {
    label: "Mul Chanderi",
    href: "/shop?cat=mul-chanderi",
    subs: [
      { label: "Chanderi Kurtis", href: "/shop?cat=chanderi-kurtis" },
      { label: "Suit Sets", href: "/shop?cat=chanderi-suit-sets" },
      { label: "Festive Collection", href: "/shop?cat=chanderi-festive" },
    ],
  },
  {
    label: "Fancy Full Suits",
    href: "/shop?cat=fancy-full-suits",
    subs: [
      { label: "Designer", href: "/shop?cat=designer-suits" },
      { label: "Wedding", href: "/shop?cat=wedding-suits" },
      { label: "Embroidered Sets", href: "/shop?cat=embroidered-sets" },
    ],
  },
  {
    label: "Pre Orders",
    href: "/shop?cat=pre-orders",
    subs: [
      { label: "Coming Soon", href: "/shop?cat=coming-soon" },
      { label: "Exclusive Collection", href: "/shop?cat=exclusive" },
    ],
  },
  {
    label: "Wholesale Enquiry",
    href: "/shop?cat=wholesale",
    subs: [
      { label: "Bulk Orders", href: "/shop?cat=bulk-orders" },
      { label: "Retailers", href: "/shop?cat=retailers" },
      { label: "Resellers", href: "/shop?cat=resellers" },
    ],
  },
  {
    label: "Support",
    href: "/shop?cat=support",
    subs: [
      { label: "Contact Us", href: "/about" },
      { label: "WhatsApp Orders", href: "https://wa.me/917904004470" },
      { label: "FAQs", href: "#" },
      { label: "Shipping Policy", href: "#" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   SAMPLE PRODUCTS (for the initial grid display)
═══════════════════════════════════════════════════════════════ */
interface Product {
  id: string;
  name: string;
  src: string;
  alt: string;
  price: number;
  discountPrice: number;
  rating: number;
  badge?: string;
  badgeColor?: string;
}

const products: Product[] = [
  {
    id: "kurti-1",
    name: "Floral Print A-Line Cotton Kurti",
    src: "/kurti1.jpg",
    alt: "Floral cotton A-line kurti",
    price: 1499,
    discountPrice: 699,
    rating: 4.8,
    badge: "Best Seller",
    badgeColor: "bg-[#e91e8c]",
  },
  {
    id: "kurti-2",
    name: "Elegant Paisley Straight Kurti Set",
    src: "/kurti2.jpg",
    alt: "Paisley print straight kurti with pants",
    price: 2499,
    discountPrice: 1299,
    rating: 4.7,
    badge: "New",
    badgeColor: "bg-black",
  },
  {
    id: "kurti-3",
    name: "Designer Embroidered Party Kurti",
    src: "/kurti3.jpg",
    alt: "Embroidered designer kurti",
    price: 3999,
    discountPrice: 1999,
    rating: 4.9,
    badge: "50% OFF",
    badgeColor: "bg-emerald-600",
  },
  {
    id: "kurti-4",
    name: "Chanderi Silk Festive Suit Set",
    src: "/kurti4.jpg",
    alt: "Chanderi silk festive suit",
    price: 4999,
    discountPrice: 2999,
    rating: 4.8,
  },
  {
    id: "kurti-5",
    name: "Cotton Daily Wear Printed Kurti",
    src: "/kurti5.jpg",
    alt: "Cotton printed daily wear kurti",
    price: 999,
    discountPrice: 499,
    rating: 4.5,
    badge: "Under ₹500",
    badgeColor: "bg-amber-500",
  },
  {
    id: "kurti-6",
    name: "Black Anarkali Designer Suit",
    src: "/kurti6.jpg",
    alt: "Black anarkali designer suit",
    price: 5499,
    discountPrice: 3299,
    rating: 4.9,
  },
  {
    id: "kurti-7",
    name: "Office Wear Straight Cotton Kurti",
    src: "/kurti7.jpg",
    alt: "Cotton office wear straight kurti",
    price: 1299,
    discountPrice: 649,
    rating: 4.6,
    badge: "50% OFF",
    badgeColor: "bg-emerald-600",
  },
  {
    id: "kurti-8",
    name: "Fancy Embroidered Wedding Set",
    src: "/kurti8.jpg",
    alt: "Fancy embroidered wedding kurti set",
    price: 6999,
    discountPrice: 3999,
    rating: 5.0,
    badge: "Premium",
    badgeColor: "bg-[#c2185b]",
  },
];

/* ═══════════════════════════════════════════════════════════════
   DROPDOWN NAV TAB COMPONENT
═══════════════════════════════════════════════════════════════ */
function CategoryTab({ cat, isActive, onSelect }: { cat: Category; isActive: boolean; onSelect: (label: string) => void }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const hasSubs = cat.subs && cat.subs.length > 0;

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        onClick={() => onSelect(cat.label)}
        className={`flex items-center gap-1 py-3 px-1 text-[13px] font-medium tracking-wide whitespace-nowrap transition-colors duration-200 border-b-2 ${
          isActive
            ? "text-[#e91e8c] border-[#e91e8c]"
            : "text-neutral-500 border-transparent hover:text-neutral-900 hover:border-neutral-300"
        }`}
        style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
      >
        {cat.label}
        {hasSubs && (
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && hasSubs && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full left-0 mt-0 min-w-[200px] bg-white rounded-xl shadow-lg border border-neutral-100 py-2 z-50"
          >
            {/* Tiny invisible hover bridge */}
            <div className="absolute -top-2 left-0 right-0 h-2" />
            {cat.subs!.map((sub) => (
              <Link
                key={sub.label}
                href={sub.href}
                className="block px-5 py-2.5 text-sm text-neutral-600 hover:text-[#e91e8c] hover:bg-[#fdf5f8] transition-colors duration-150"
                style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
                onClick={() => setOpen(false)}
              >
                {sub.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CARD
═══════════════════════════════════════════════════════════════ */
function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className="group flex flex-col"
    >
      {/* Image */}
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-50 mb-4 shadow-sm group-hover:shadow-md transition-shadow duration-300">
        <Image
          src={product.src}
          alt={product.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          quality={85}
        />

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute top-3 left-3 ${product.badgeColor} text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-sm`}
          >
            {product.badge}
          </span>
        )}

        {/* Wishlist button */}
        <button
          aria-label={`Add ${product.name} to wishlist`}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-sm hover:scale-110"
        >
          <Heart className="w-4 h-4 text-neutral-700 stroke-[1.5]" />
        </button>

        {/* Quick add bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button className="w-full bg-black text-white text-xs font-semibold tracking-wider uppercase py-3 rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-0.5">
        <h3
          className="text-sm font-medium text-neutral-900 leading-snug mb-1.5 line-clamp-2"
          style={{ fontFamily: "var(--font-inter, sans-serif)" }}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
              />
            ))}
          </div>
          <span
            className="text-xs text-neutral-400"
            style={{ fontFamily: "var(--font-inter, sans-serif)" }}
          >
            {product.rating}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span
            className="text-base font-bold text-neutral-900"
            style={{ fontFamily: "var(--font-inter, sans-serif)" }}
          >
            ₹{product.discountPrice.toLocaleString("en-IN")}
          </span>
          <span
            className="text-sm text-neutral-400 line-through"
            style={{ fontFamily: "var(--font-inter, sans-serif)" }}
          >
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-semibold text-emerald-600">
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% off
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHOP PAGE
═══════════════════════════════════════════════════════════════ */
export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("New In");
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <main className="min-h-screen w-full bg-white">

      {/* ── Hero Banner ── */}
      <section className="relative w-full h-[220px] sm:h-[260px] overflow-hidden bg-black">
        <div className="absolute inset-0 grid grid-cols-6">
          {["/kurti1.jpg", "/kurti3.jpg", "/kurti5.jpg", "/kurti7.jpg", "/kurti2.jpg", "/kurti4.jpg"].map((src, i) => (
            <div key={i} className="relative h-full overflow-hidden">
              <Image
                src={src}
                alt="Collection"
                fill
                className="object-cover object-top opacity-30"
                quality={60}
              />
            </div>
          ))}
        </div>
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85))",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <p
            className="text-[10px] sm:text-xs font-semibold tracking-[0.35em] text-[#f9a8d4] uppercase mb-2"
            style={{ fontFamily: "var(--font-inter, sans-serif)" }}
          >
            ✦ SSS Boutique For U ✦
          </p>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center"
            style={{ fontFamily: "var(--font-playfair, serif)" }}
          >
            Shop Collection
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-10 h-px bg-pink-400 opacity-50" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#e91e8c]" />
            <div className="w-10 h-px bg-pink-400 opacity-50" />
          </div>
        </div>
      </section>

      {/* ── Category Navigation Bar ── */}
      <div className="sticky top-[120px] z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={scrollRef}
            className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat) => (
              <CategoryTab
                key={cat.label}
                cat={cat}
                isActive={activeCategory === cat.label}
                onSelect={setActiveCategory}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Toolbar: Results count + Filter ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-xl font-semibold text-neutral-900"
              style={{ fontFamily: "var(--font-playfair, serif)" }}
            >
              {activeCategory}
            </h2>
            <p
              className="text-xs text-neutral-400 mt-0.5"
              style={{ fontFamily: "var(--font-inter, sans-serif)" }}
            >
              {products.length} products
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:border-neutral-400 hover:text-black transition-all">
            <SlidersHorizontal className="w-4 h-4" />
            <span style={{ fontFamily: "var(--font-inter, sans-serif)" }}>Filters</span>
          </button>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* ── Load More Button ── */}
        <div className="flex justify-center mt-16">
          <button
            className="px-10 py-4 rounded-2xl text-sm font-semibold tracking-wider uppercase transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #c2185b 0%, #e91e8c 100%)",
              color: "white",
              fontFamily: "var(--font-inter, sans-serif)",
            }}
          >
            Load More Products
          </button>
        </div>
      </section>
    </main>
  );
}
