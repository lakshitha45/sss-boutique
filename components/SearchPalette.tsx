"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Product, Category } from "@/types";
import { fetchProducts, fetchCategories } from "@/features/products/productActions";
import { formatPrice, getDisplayPrice } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Command, Flame, History, ArrowRight } from "lucide-react";

// Levenshtein distance for typo tolerance
const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix = [];
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  return matrix[a.length][b.length];
};

const TRENDING_SEARCHES = ["Silk Saree", "Organza Suit", "Cotton Kurti", "Leather Tote"];

export const SearchPalette: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Load products & categories
  const loadSearchData = async () => {
    try {
      const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error("Failed to load search index", err);
    }
  };

  useEffect(() => {
    loadSearchData();
  }, []);

  // Sync recently viewed on open
  useEffect(() => {
    if (isOpen) {
      loadSearchData();
      try {
        const stored = localStorage.getItem("sss_recently_viewed");
        if (stored) {
          const slugs: string[] = JSON.parse(stored);
          const matched = slugs
            .map((slug) => products.find((p) => p.slug === slug))
            .filter((p): p is Product => !!p);
          setRecentlyViewed(matched.slice(0, 3));
        } else {
          setRecentlyViewed([]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen, products]);

  // Real-time filtering with Typo Tolerance
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const matched = products.filter((p) => {
      // 1. Direct contains checks
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      
      const catName = categories.find((c) => c.id === p.categoryId)?.name || "";
      const matchCat = catName.toLowerCase().includes(q);

      if (matchName || matchSku || matchDesc || matchCat) return true;

      // 2. Typo tolerance: Split words and check edit distance
      const queryWords = q.split(/\s+/);
      const nameWords = p.name.toLowerCase().split(/\s+/);

      return queryWords.some((qw) => {
        if (qw.length < 3) return false; // Ignore short words for typo check
        return nameWords.some((nw) => {
          // If prefix matches, or edit distance is small (<= 2 for longer words)
          if (nw.startsWith(qw)) return true;
          const maxDistance = qw.length > 5 ? 2 : 1;
          return getLevenshteinDistance(qw, nw) <= maxDistance;
        });
      });
    });

    setResults(matched.slice(0, 5));
  }, [query, products, categories]);

  // Key Event Listeners (Ctrl + K, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOpenTrigger = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-search-palette", handleOpenTrigger);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-search-palette", handleOpenTrigger);
    };
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleResultClick = (slug: string) => {
    setIsOpen(false);
    router.push(`/shop/${slug}`);
  };

  const handleTrendingClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 font-poppins">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black backdrop-blur-md"
          />

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-xl glass-modal rounded-card overflow-hidden shadow-2xl z-10 flex flex-col bg-background/95 border border-zinc-200"
          >
            {/* Input Bar */}
            <div className="px-5 py-4 flex items-center border-b border-zinc-200">
              <Search className="w-5 h-5 text-accent mr-3 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search silhouettes, SKU, or collections..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder-zinc-400 font-light"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-zinc-400 hover:text-foreground transition ml-2"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results Body */}
            <div className="max-h-[380px] overflow-y-auto px-5 py-4 divide-y divide-zinc-150 text-xs">
              {!query.trim() ? (
                /* Search Guide / Quick suggestions / History */
                <div className="space-y-6 py-2">
                  {/* Quick Suggestions & Trending */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-1.5 text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                      <Flame className="w-3.5 h-3.5 text-accent" />
                      <span>Trending Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleTrendingClick(term)}
                          className="px-3.5 py-1.5 border border-zinc-200 hover:border-accent text-zinc-600 hover:text-accent font-semibold transition bg-zinc-50 hover:bg-white"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recently Viewed Products */}
                  {recentlyViewed.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-zinc-100">
                      <div className="flex items-center space-x-1.5 text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                        <History className="w-3.5 h-3.5" />
                        <span>Recently Viewed</span>
                      </div>
                      <div className="space-y-2">
                        {recentlyViewed.map((prod) => (
                          <button
                            key={prod.id}
                            onClick={() => handleResultClick(prod.slug)}
                            className="w-full flex items-center justify-between py-2 text-left hover:text-primary transition group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-10 bg-zinc-100 border border-zinc-200/50 overflow-hidden flex-shrink-0">
                                <img src={prod.images[0]?.imageUrl} alt="" className="object-cover w-full h-full" />
                              </div>
                              <span className="font-serif text-xs text-zinc-700 font-medium group-hover:text-primary">
                                {prod.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 flex items-center">
                              <span>View</span>
                              <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : results.length === 0 ? (
                /* Empty results */
                <div className="py-10 text-center text-zinc-400 font-light">
                  No pieces found matching "<strong>{query}</strong>"
                </div>
              ) : (
                /* Matching Products List */
                <div className="space-y-0.5">
                  <div className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-2 pt-1">
                    Matching Silhouettes
                  </div>
                  {results.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => handleResultClick(prod.slug)}
                      className="w-full flex items-center justify-between py-3 text-left hover:text-primary transition border-b border-zinc-50 last:border-b-0 group"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div className="w-9 h-11 bg-zinc-50 overflow-hidden border border-zinc-200/50 flex-shrink-0">
                          <img src={prod.images[0]?.imageUrl} alt="" className="object-cover w-full h-full" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-serif text-sm font-medium truncate block max-w-[280px]">
                            {prod.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono tracking-wider block mt-0.5">
                            {prod.sku} • {categories.find((c) => c.id === prod.categoryId)?.name || "Luxury Edit"}
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-right flex-shrink-0 font-poppins text-foreground">
                        {formatPrice(getDisplayPrice(prod))}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Keyboard instruction */}
            <div className="bg-zinc-50 px-5 py-2.5 border-t border-zinc-150 flex justify-between items-center text-[9px] text-zinc-400 tracking-wider uppercase font-semibold">
              <span>Type to discover</span>
              <div className="flex items-center space-x-1 font-mono">
                <span className="bg-zinc-250 px-1 py-0.5 border border-zinc-300">ESC</span>
                <span>to close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default SearchPalette;
