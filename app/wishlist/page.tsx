"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatPrice } from "@/utils";
import { Product } from "@/types";
import { fetchProducts } from "@/features/products/productActions";
import { useCart } from "@/features/cart/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { EmptyState, ProductCard } from "@/components";

export default function WishlistPage() {
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem("sss_boutique_wishlist");
      const wishlistIds: string[] = stored ? JSON.parse(stored) : [];

      if (wishlistIds.length > 0) {
        const allProducts = await fetchProducts();
        const matched = allProducts.filter((p) => wishlistIds.includes(p.id));
        setWishlistItems(matched);
      } else {
        setWishlistItems([]);
      }
    } catch (err) {
      console.error("Failed to load wishlist items", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemoveFromWishlist = (productId: string) => {
    try {
      const stored = localStorage.getItem("sss_boutique_wishlist");
      let wishlistIds: string[] = stored ? JSON.parse(stored) : [];
      wishlistIds = wishlistIds.filter((id) => id !== productId);
      localStorage.setItem("sss_boutique_wishlist", JSON.stringify(wishlistIds));
      
      // Update local state
      setWishlistItems((prev) => prev.filter((p) => p.id !== productId));
      
      // Trigger header badge sync
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveToCart = (product: Product) => {
    // Add to cart with default variant if available, or just undefined
    const defaultSize = product.variants?.[0]?.size || product.metadata?.sizes?.[0];
    const defaultColor = product.metadata?.colors?.[0];
    
    addToCart(product, 1, defaultSize, defaultColor);
    
    // Remove from wishlist
    handleRemoveFromWishlist(product.id);
  };

  return (
    <>
      <Header />
      
      <main className="flex-1 min-h-[70vh] bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-poppins">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1.5 text-[10px] text-zinc-400 uppercase tracking-widest mb-8">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-600 font-medium">Wishlist</span>
          </nav>

          <div className="space-y-2 mb-10">
            <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Customer Account</span>
            <h1 className="font-serif text-3xl font-light tracking-wide text-foreground">Your Wishlist</h1>
            <div className="w-12 h-[1px] bg-accent mt-3" />
          </div>

          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : wishlistItems.length === 0 ? (
            <EmptyState
              title="Your Wishlist is Empty"
              description="Save pieces you like here to keep track of them, share with friends, or easily move them to your shopping bag."
              actionLabel="Discover Silhouettes"
              actionHref="/shop"
            />
          ) : (
            /* Wishlist Items Grid */
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {wishlistItems.map((prod) => (
                  <motion.div
                    key={prod.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard
                      product={prod}
                      isWishlisted={true}
                      onWishlistToggle={() => handleRemoveFromWishlist(prod.id)}
                      onAddToCart={(p, e) => {
                        e.preventDefault();
                        handleMoveToCart(p);
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
