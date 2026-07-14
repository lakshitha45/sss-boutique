"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatPrice } from "@/utils";
import { Product, Category } from "@/types";
import { fetchProducts, fetchCategories } from "@/features/products/productActions";
import { motion } from "framer-motion";
import { ArrowRight, Star, Heart } from "lucide-react";
import { ProductCard, CategoryCard, FadeIn, PageSection } from "@/components";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
        setCategories(cats);
        // Slice top 3 products for featured
        setFeaturedProducts(prods.slice(0, 3));
      } catch (err) {
        console.error("Failed to load home page data", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <>
      <Header />
      
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden bg-zinc-950">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop"
              alt="SSS Boutique Editorial Cover"
              className="object-cover w-full h-full opacity-65 scale-105 animate-[zoom-out_20s_infinite]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/40" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white space-y-6">
            <motion.span
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, letterSpacing: "0.25em" }}
              transition={{ duration: 1 }}
              className="font-poppins text-xs font-semibold uppercase text-accent tracking-[0.25em]"
            >
              Autumn / Winter Collection
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light leading-tight tracking-wide"
            >
              Timeless Elegance <br />
              <span className="font-serif italic font-normal text-accent">Redefined</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="font-poppins text-xs sm:text-sm text-zinc-300 font-light max-w-lg mx-auto tracking-widest leading-relaxed uppercase"
            >
              Indulge in Italian craftsmanship, premium silk silhouettes, and hand-tailored cashmere coats.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="pt-4"
            >
              <Link
                href="/shop"
                className="inline-flex items-center space-x-2 font-poppins text-xs tracking-widest uppercase bg-accent text-zinc-950 px-8 py-3.5 hover:bg-white transition duration-500 font-semibold"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Scroll down indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-1 z-10 text-white/50">
            <span className="font-poppins text-[9px] tracking-[0.3em] uppercase">Scroll</span>
            <div className="w-[1px] h-8 bg-white/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-accent animate-[scroll-line_1.5s_infinite]" />
            </div>
          </div>
        </section>

        {/* PROMISES BANNER */}
        <section className="bg-secondary border-b border-accent/10 py-10 font-poppins text-xs uppercase tracking-widest text-zinc-600">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="space-y-1">
              <span className="text-accent font-semibold block text-sm">01 / ITALIAN CRAFT</span>
              <p className="text-[10px] text-zinc-400 lowercase tracking-wider">Handcrafted in Florence</p>
            </div>
            <div className="space-y-1 border-t sm:border-t-0 sm:border-x border-zinc-100 pt-6 sm:pt-0">
              <span className="text-accent font-semibold block text-sm">02 / NATURAL SILK</span>
              <p className="text-[10px] text-zinc-400 lowercase tracking-wider">100% biodegradable luxury fibers</p>
            </div>
            <div className="space-y-1 border-t sm:border-t-0 pt-6 sm:pt-0">
              <span className="text-accent font-semibold block text-sm">03 / FREE DELIVERY</span>
              <p className="text-[10px] text-zinc-400 lowercase tracking-wider">Complimentary express shipping</p>
            </div>
          </div>
        </section>

        {/* FEATURED CATEGORIES */}
        <PageSection
          title="Browse by Category"
          accentLabel="Curated Selections"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-zinc-100 animate-pulse relative border border-zinc-100" />
                  ))
              : categories.map((cat) => (
                  <FadeIn key={cat.id}>
                    <CategoryCard category={cat} variant="grid" />
                  </FadeIn>
                ))}
          </div>
        </PageSection>

        {/* EDITORIAL STORY BANNER */}
        <section className="bg-secondary border-y border-accent/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="aspect-[4/3] bg-zinc-100 relative"
              >
                <img
                  src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop"
                  alt="SSS Boutique Crafting Atelier"
                  className="object-cover w-full h-full"
                />
              </motion.div>
            </div>
            
            <div className="lg:col-span-6 space-y-6 lg:pl-6">
              <span className="font-poppins text-[10px] tracking-[0.3em] uppercase text-accent font-bold">The SSS Philosophy</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-wide text-foreground leading-snug">
                Crafted for the Modern <br />
                <span className="font-serif italic font-normal text-accent">Sophisticate</span>
              </h2>
              <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-light">
                We believe clothing is an art form. Each piece in our boutique is curated to tell a story of effortless grace. By sourcing double-faced cashmere wool from the finest weavers and heavyweight silk mulberry yarns, our designs stand the test of time, bridging the gap between seasonal trends and historical couture.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center space-x-2 font-poppins text-xs tracking-widest uppercase border-b border-foreground pb-1 hover:text-accent hover:border-accent transition duration-300 font-semibold"
                >
                  <span>Our Heritage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CURATED / BEST SELLERS */}
        <PageSection
          title="Featured Products"
          accentLabel="The Masterpieces"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading
              ? Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="space-y-4">
                      <div className="aspect-[3/4] bg-zinc-100 animate-pulse" />
                      <div className="h-4 bg-zinc-100 w-2/3 animate-pulse" />
                      <div className="h-4 bg-zinc-100 w-1/3 animate-pulse" />
                    </div>
                  ))
              : featuredProducts.map((prod) => {
                  const categoryName = categories.find((c) => c.id === prod.categoryId)?.name || "Collection";
                  return (
                    <FadeIn key={prod.id}>
                      <ProductCard
                        product={prod}
                        categoryName={categoryName}
                        variant="minimal"
                      />
                    </FadeIn>
                  );
                })}
          </div>

          <div className="text-center pt-12">
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 font-poppins text-xs tracking-widest uppercase border border-foreground/50 px-8 py-3.5 hover:bg-foreground hover:text-background transition duration-300 font-semibold"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </PageSection>
      </main>

      <Footer />
    </>
  );
}
