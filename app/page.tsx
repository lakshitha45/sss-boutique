"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatPrice } from "@/utils";
import { Product, Category } from "@/types";
import { fetchProducts, fetchCategories } from "@/features/products/productActions";
import { useCart } from "@/features/cart/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, Sparkles, Shield, Truck, CreditCard, Headphones, Search, ShoppingBag, Eye, X } from "lucide-react";
import { ProductCard, CategoryCard, FadeIn, PageSection } from "@/components";

export default function HomePage() {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick View & Wishlist state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [qvSize, setQvSize] = useState("");
  const [qvWarning, setQvWarning] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts(true)]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error("Failed to load home page data", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();

    // Wishlist sync
    try {
      const stored = localStorage.getItem("sss_boutique_wishlist");
      if (stored) setWishlist(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let updated = [...wishlist];
    if (wishlist.includes(productId)) {
      updated = updated.filter((id) => id !== productId);
    } else {
      updated.push(productId);
    }
    setWishlist(updated);
    try {
      localStorage.setItem("sss_boutique_wishlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.error(err);
    }
  };

  const triggerQuickView = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
    setQvSize("");
    setQvWarning(false);
  };

  const handleQuickViewAdd = () => {
    if (!quickViewProduct) return;
    if (quickViewProduct.metadata?.sizes && quickViewProduct.metadata.sizes.length > 0 && !qvSize) {
      setQvWarning(true);
      return;
    }
    setQvWarning(false);
    addToCart(quickViewProduct, 1, qvSize || undefined, quickViewProduct.metadata?.colors?.[0] || undefined);
    setQuickViewProduct(null);
  };

  // Slice subsets
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const featuredCollection = products.filter((p) => p.featured).slice(0, 3);
  const fallbackFeatured = featuredCollection.length > 0 ? featuredCollection : products.slice(0, 3);

  // Inspiration Gallery Static Mock matching Supabase assets
  const galleryImages = [
    { url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop", tag: "Atelier" },
    { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop", tag: "Silhouettes" },
    { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop", tag: "Editorial" },
    { url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop", tag: "Evening Wear" }
  ];

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
              className="object-cover w-full h-full opacity-60 scale-105"
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
              className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light leading-tight tracking-wide text-white"
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
              className="pt-4 flex justify-center space-x-4"
            >
              <Link
                href="/shop"
                className="inline-flex items-center space-x-2 font-poppins text-xs tracking-widest uppercase bg-accent text-zinc-950 px-8 py-3.5 hover:bg-white transition duration-500 font-semibold shadow-luxury"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
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
                    <div key={i} className="aspect-[3/4] bg-zinc-150 animate-pulse relative border border-zinc-200" />
                  ))
              : categories.slice(0, 4).map((cat) => (
                  <FadeIn key={cat.id}>
                    <CategoryCard category={cat} variant="grid" />
                  </FadeIn>
                ))}
          </div>
        </PageSection>

        {/* NEW ARRIVALS HORIZONTAL SLIDER */}
        <section className="bg-secondary/40 border-y border-zinc-150 py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <div className="space-y-1">
                <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Latest Silhouettes</span>
                <h2 className="font-serif text-2xl font-light tracking-wide text-foreground">New Arrivals</h2>
                <div className="w-12 h-[1px] bg-accent mt-3" />
              </div>
              <Link href="/shop?sort=newest" className="text-xs font-semibold text-zinc-600 hover:text-black uppercase tracking-widest flex items-center space-x-1 font-poppins">
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-200 pr-4">
              {loading
                ? Array(4).fill(0).map((_, i) => (
                    <div key={i} className="w-64 flex-shrink-0 animate-pulse bg-zinc-150 h-[380px]" />
                  ))
                : newArrivals.map((prod) => {
                    const catName = categories.find((c) => c.id === prod.categoryId)?.name || "Luxury Edit";
                    const isWishlisted = wishlist.includes(prod.id);
                    return (
                      <div key={prod.id} className="w-64 flex-shrink-0 bg-background border border-zinc-100 p-3 group relative flex flex-col justify-between">
                        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50 border border-zinc-100">
                          <img
                            src={prod.images[0]?.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"}
                            alt={prod.name}
                            className="object-cover w-full h-full group-hover:scale-102 transition duration-700"
                          />
                          <div className="absolute inset-0 bg-zinc-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                            <button
                              onClick={(e) => triggerQuickView(prod, e)}
                              className="p-2 bg-white text-zinc-950 hover:bg-primary hover:text-white transition rounded-full"
                              aria-label="Quick View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => toggleWishlist(prod.id, e)}
                              className={`p-2 rounded-full transition ${
                                isWishlisted ? "bg-accent text-zinc-950" : "bg-white text-zinc-950 hover:bg-primary hover:text-white"
                              }`}
                              aria-label="Wishlist"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </div>

                        <div className="pt-3 space-y-1 text-center">
                          <span className="text-[9px] text-zinc-400 tracking-widest uppercase block">{catName}</span>
                          <h3 className="font-serif text-sm font-light tracking-wide text-foreground truncate">{prod.name}</h3>
                          <span className="font-semibold text-xs block text-accent font-mono">{formatPrice(prod.price)}</span>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </section>

        {/* ASYMMETRIC FEATURED COLLECTION */}
        <PageSection
          title="Featured Collection"
          accentLabel="The Masterpieces"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {loading ? (
              <div className="col-span-12 h-96 bg-zinc-150 animate-pulse" />
            ) : (
              <>
                {/* Column 1: Staggered large item (60%) */}
                <div className="lg:col-span-7 space-y-4">
                  {fallbackFeatured[0] && (
                    <div className="group space-y-4">
                      <div className="aspect-[4/3] overflow-hidden bg-zinc-950 border border-zinc-150 relative">
                        <img
                          src={fallbackFeatured[0].images[0]?.imageUrl}
                          alt=""
                          className="object-cover w-full h-full group-hover:scale-103 transition duration-700 opacity-80"
                        />
                        <div className="absolute bottom-6 left-6 text-white space-y-1.5 z-10">
                          <span className="text-[9px] text-accent font-bold uppercase tracking-[0.25em]">Exclusive Silhouette</span>
                          <h3 className="font-serif text-xl font-light">{fallbackFeatured[0].name}</h3>
                          <Link href={`/shop/${fallbackFeatured[0].slug}`} className="text-[10px] uppercase font-bold tracking-widest text-white border-b border-white pb-0.5 hover:text-accent hover:border-accent transition block w-fit">
                            Discover Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2: Asymmetric small items grid (40%) */}
                <div className="lg:col-span-5 space-y-6">
                  {fallbackFeatured.slice(1, 3).map((prod) => (
                    <div key={prod.id} className="group border border-zinc-150 p-4 bg-[#121212]/30 flex items-center space-x-4">
                      <div className="w-24 h-32 overflow-hidden bg-zinc-50 border border-zinc-100 flex-shrink-0">
                        <img src={prod.images[0]?.imageUrl} alt="" className="object-cover w-full h-full group-hover:scale-105 transition duration-500" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] text-zinc-400 uppercase tracking-widest block">Collection Piece</span>
                        <h4 className="font-serif text-base text-white font-light leading-snug">{prod.name}</h4>
                        <span className="font-mono text-xs text-accent block">{formatPrice(prod.price)}</span>
                        <Link href={`/shop/${prod.slug}`} className="text-[9px] uppercase font-bold tracking-widest border-b border-accent pb-0.5 text-accent hover:text-white hover:border-white transition block w-fit mt-2">
                          View details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </PageSection>

        {/* WHY CHOOSE US */}
        <section className="bg-secondary/40 border-y border-zinc-150 py-16 font-poppins">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-2 mb-12">
              <span className="text-[10px] text-accent font-bold uppercase tracking-[0.25em]">Our Promise</span>
              <h2 className="font-serif text-2xl font-light tracking-wide text-foreground">Why Choose SSS Boutique</h2>
              <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-[#121212]/30 border border-zinc-150 p-6 text-center space-y-3 shadow-luxury">
                <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto text-accent">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-sm text-white tracking-wide">Premium Quality</h4>
                <p className="text-[10px] text-zinc-500 lowercase leading-relaxed">Hand-selected silk, tailored cashmere, premium silhouettes.</p>
              </div>

              <div className="bg-[#121212]/30 border border-zinc-150 p-6 text-center space-y-3 shadow-luxury">
                <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto text-accent">
                  <Truck className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-sm text-white tracking-wide">Fast Shipping</h4>
                <p className="text-[10px] text-zinc-500 lowercase leading-relaxed">Complimentary express shipping across standard domains.</p>
              </div>

              <div className="bg-[#121212]/30 border border-zinc-150 p-6 text-center space-y-3 shadow-luxury">
                <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto text-accent">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-sm text-white tracking-wide">Secure Payments</h4>
                <p className="text-[10px] text-zinc-500 lowercase leading-relaxed">Encrypted transactions via AES-256 SSL protocols.</p>
              </div>

              <div className="bg-[#121212]/30 border border-zinc-150 p-6 text-center space-y-3 shadow-luxury">
                <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto text-accent">
                  <Headphones className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-sm text-white tracking-wide">Customer Support</h4>
                <p className="text-[10px] text-zinc-500 lowercase leading-relaxed">Dedicated WhatsApp concierge for luxury assistance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FASHION GALLERY */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-2 mb-12">
              <span className="text-[10px] text-accent font-bold uppercase tracking-[0.25em]">Sartorial Inspiration</span>
              <h2 className="font-serif text-2xl font-light tracking-wide text-foreground">Instagram Inspired Gallery</h2>
              <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="group relative aspect-square overflow-hidden bg-zinc-950 border border-zinc-150">
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover opacity-75 group-hover:scale-103 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center text-white space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent">#{img.tag}</span>
                    <Link href="/shop" className="text-[9px] uppercase font-bold tracking-widest border-b border-white pb-0.5">
                      Explore Catalog
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* QUICK VIEW MODAL */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-card rounded-card shadow-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 z-10 overflow-hidden glass-modal"
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 p-1.5 bg-white/80 hover:text-primary transition rounded-full z-10"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="aspect-[3/4] bg-zinc-50 rounded-image overflow-hidden border border-zinc-100">
                <img
                  src={quickViewProduct.images[0]?.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"}
                  alt={quickViewProduct.name}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex flex-col justify-between py-2 space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">
                      {categories.find((c) => c.id === quickViewProduct.categoryId)?.name || "Luxury Edit"}
                    </span>
                    <h3 className="font-serif text-xl font-bold tracking-wide mt-0.5">
                      {quickViewProduct.name}
                    </h3>
                    <div className="text-accent font-mono font-bold text-sm mt-1">{formatPrice(quickViewProduct.price)}</div>
                  </div>

                  <p className="text-zinc-500 text-xs leading-relaxed font-light line-clamp-3">
                    {quickViewProduct.description}
                  </p>

                  {((quickViewProduct.metadata?.sizes && quickViewProduct.metadata.sizes.length > 0) || (quickViewProduct.variants && quickViewProduct.variants.length > 0)) && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex gap-2">
                        {(quickViewProduct.variants && quickViewProduct.variants.length > 0
                          ? quickViewProduct.variants
                          : (quickViewProduct.metadata?.sizes || []).map((sz, idx) => ({ size: sz }))
                        ).map((v, idx) => (
                          <button
                            key={idx}
                            onClick={() => setQvSize(v.size)}
                            className={`px-3 py-1.5 border text-[9px] font-bold tracking-wider transition ${
                              qvSize === v.size
                                ? "bg-accent border-accent text-zinc-950"
                                : "border-zinc-200 text-zinc-650 hover:border-zinc-400"
                            }`}
                          >
                            {v.size}
                          </button>
                        ))}
                      </div>
                      {qvWarning && (
                        <span className="text-[10px] text-error font-medium block mt-1">Please select a size first.</span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleQuickViewAdd}
                  className="w-full py-3 bg-foreground hover:bg-primary text-background hover:text-white uppercase tracking-widest text-[10px] font-bold rounded-button transition duration-300 flex items-center justify-center space-x-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add To Bag</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
