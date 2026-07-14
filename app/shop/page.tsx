"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatPrice } from "@/utils";
import { Product, Category } from "@/types";
import { fetchProducts, fetchCategories } from "@/features/products/productActions";
import { useCart } from "@/features/cart/CartContext";
import { Search, SlidersHorizontal, ChevronRight, X, Grid, Heart, Star, Eye, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { ProductCard, ProductCardSkeleton, EmptyState, PriceTag, SizeSelector } from "@/components";

// Inner component that reads searchParams
const ShopCatalog = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Wishlist & Quick View State
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [qvSize, setQvSize] = useState("");
  const [qvWarning, setQvWarning] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "featured");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
        setCategories(cats);
        setProducts(prods);
        
        // Dynamically find max price from products to set price range slider limit
        if (prods.length > 0) {
          const highest = Math.max(...prods.map((p) => p.price));
          setMaxPrice(highest + 50);
        }
      } catch (err) {
        console.error("Failed to load catalog", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Load wishlist
    try {
      const stored = localStorage.getItem("sss_boutique_wishlist");
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
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
    } catch (err) {
      console.error(err);
    }
  };

  // Update query params in URL
  const updateUrlParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (slug: string) => {
    const newVal = selectedCategory === slug ? "" : slug;
    setSelectedCategory(newVal);
    updateUrlParams("category", newVal);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSortBy(val);
    updateUrlParams("sort", val);
  };

  // Sync state with URL params change
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSearchQuery(searchParams.get("q") || "");
    setSortBy(searchParams.get("sort") || "featured");
  }, [searchParams]);

  // Filter & Sort Logic
  const filteredProducts = products
    .filter((prod) => {
      const matchesSearch =
        searchQuery === "" ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesCategory = true;
      if (selectedCategory) {
        const categoryId = categories.find((c) => c.slug === selectedCategory)?.id;
        matchesCategory = prod.categoryId === categoryId;
      }

      const matchesPrice = prod.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("featured");
    if (products.length > 0) {
      setMaxPrice(Math.max(...products.map((p) => p.price)) + 50);
    }
    router.replace("/shop", { scroll: false });
  };

  const triggerQuickView = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQvSize("");
    setQvWarning(false);
    setQuickViewProduct(product);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Editorial Page Header */}
      <div className="border-b border-zinc-100 pb-8 flex flex-col md:flex-row md:items-end md:justify-between space-y-4 md:space-y-0">
        <div>
          <nav className="flex items-center space-x-1.5 text-[10px] text-zinc-400 font-poppins uppercase tracking-widest mb-2">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-600 font-medium">Shop</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide">
            The Autumn Edit
          </h1>
        </div>

        {/* Sorting and mobile toggle */}
        <div className="flex items-center justify-between md:justify-end space-x-4 font-poppins text-xs">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center space-x-2 md:hidden border border-zinc-200 px-4 py-2 bg-secondary rounded-button"
          >
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            <span>Filters</span>
          </button>

          <div className="flex items-center space-x-2 text-zinc-600">
            <span className="hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-transparent border border-zinc-200 rounded-input px-3 py-2 text-xs focus:outline-none focus:border-accent text-foreground"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest Additions</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 mt-10">
        {/* SIDEBAR FILTERS (DESKTOP) */}
        <aside className="hidden lg:block space-y-8 font-poppins">
          {/* Search */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-accent uppercase tracking-widest">Search</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Product name or SKU..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  updateUrlParams("q", e.target.value);
                }}
                className="w-full bg-secondary border border-zinc-200 rounded-input pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-accent placeholder-zinc-400"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-accent uppercase tracking-widest">Categories</h3>
            <div className="space-y-2 text-xs text-zinc-600">
              {categories.map((cat) => {
                const active = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`flex items-center justify-between w-full hover:text-primary transition py-1 text-left ${
                      active ? "text-primary font-semibold" : ""
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-bold text-accent uppercase tracking-widest">Max Price</h3>
              <span className="text-xs font-semibold">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={products.length > 0 ? Math.max(...products.map((p) => p.price)) + 50 : 1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-accent bg-zinc-200 h-[2px] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Active filters indicators */}
          {(searchQuery || selectedCategory) && (
            <button
              onClick={clearAllFilters}
              className="w-full text-center py-2.5 border border-foreground/20 text-xs hover:border-foreground rounded-button transition text-zinc-700 hover:text-black font-semibold uppercase tracking-wider"
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* MOBILE FILTERS DRAWER */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
            <div className="relative ml-0 mr-auto w-4/5 max-w-sm h-full bg-secondary shadow-2xl flex flex-col p-6 font-poppins space-y-6 overflow-y-auto border-r border-accent/20">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <h3 className="font-serif text-lg font-medium tracking-wide">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5 text-zinc-500 hover:text-black transition" />
                </button>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest">Search</h4>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Product name or SKU..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      updateUrlParams("q", e.target.value);
                    }}
                    className="w-full bg-background border border-zinc-200 rounded-input pl-9 pr-3 py-2 focus:outline-none focus:border-accent"
                  />
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest">Categories</h4>
                <div className="space-y-2 text-xs">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        handleCategoryChange(cat.slug);
                        setShowMobileFilters(false);
                      }}
                      className={`block w-full py-1 text-left hover:text-primary transition ${
                        selectedCategory === cat.slug ? "text-primary font-bold" : "text-zinc-600"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest">Max Price</h4>
                  <span className="text-xs font-semibold">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={products.length > 0 ? Math.max(...products.map((p) => p.price)) + 50 : 1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              <button
                onClick={() => {
                  clearAllFilters();
                  setShowMobileFilters(false);
                }}
                className="w-full text-center py-3 bg-foreground text-background text-xs uppercase tracking-widest rounded-button"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* PRODUCTS GRID (4 columns desktop, 2 columns mobile/tablet) */}
        <section className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={<Grid className="w-8 h-8 text-zinc-300" />}
              title="No Pieces Found"
              description="We could not find any products matching your filters. Try adjusting your search query or selecting a different category."
              actionLabel="Show All Products"
              onAction={clearAllFilters}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {filteredProducts.map((prod) => {
                const inWishlist = wishlist.includes(prod.id);
                const categoryName = categories.find((c) => c.id === prod.categoryId)?.name || "Luxury Edit";
                return (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    categoryName={categoryName}
                    isWishlisted={inWishlist}
                    onWishlistToggle={toggleWishlist}
                    onQuickView={triggerQuickView}
                    onAddToCart={(p, e) => {
                      e.preventDefault();
                      addToCart(p, 1, p.metadata?.sizes?.[0] || undefined);
                    }}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* QUICK VIEW MODAL (restricted glassmorphism modal) */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Content Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-card rounded-card shadow-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 z-10 overflow-hidden glass-modal"
            >
              {/* Close Button */}
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 p-1.5 bg-white/80 hover:text-primary transition rounded-full z-10"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Product Cover image */}
              <div className="aspect-[3/4] bg-zinc-50 rounded-image overflow-hidden border border-zinc-100">
                <img
                  src={quickViewProduct.images[0]?.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"}
                  alt={quickViewProduct.name}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Details & Selectors */}
              <div className="flex flex-col justify-between py-2 space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">
                      {categories.find((c) => c.id === quickViewProduct.categoryId)?.name || "Luxury Edit"}
                    </span>
                    <h3 className="font-serif text-xl font-bold tracking-wide mt-0.5">
                      {quickViewProduct.name}
                    </h3>
                    <PriceTag
                      price={quickViewProduct.price}
                      compareAtPrice={quickViewProduct.compareAtPrice}
                      size="md"
                      className="mt-1"
                    />
                  </div>

                  <p className="text-zinc-500 text-xs leading-relaxed font-light line-clamp-3">
                    {quickViewProduct.description}
                  </p>

                  {/* Size selector using component */}
                  {((quickViewProduct.metadata?.sizes && quickViewProduct.metadata.sizes.length > 0) || (quickViewProduct.variants && quickViewProduct.variants.length > 0)) && (
                    <div className="space-y-1.5 pt-1">
                      <SizeSelector
                        variants={
                          quickViewProduct.variants && quickViewProduct.variants.length > 0
                            ? quickViewProduct.variants
                            : (quickViewProduct.metadata?.sizes || []).map((sz, idx) => ({
                                id: String(idx),
                                productId: quickViewProduct.id,
                                size: sz,
                                stock: 10,
                                sku: "",
                              }))
                        }
                        selectedSize={qvSize}
                        onSelect={(sz) => {
                          setQvSize(sz);
                          setQvWarning(false);
                        }}
                      />
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
    </div>
  );
};

export default function ShopPage() {
  return (
    <>
      <Header />
      <main className="flex-1 min-h-[70vh]">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <ShopCatalog />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
