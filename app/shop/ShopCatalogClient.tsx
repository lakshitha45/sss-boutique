"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/utils";
import { Product, Category } from "@/types";
import { useCart } from "@/features/cart/CartContext";
import { Search, SlidersHorizontal, ChevronRight, X, Heart, Eye, ShoppingBag, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { ProductCard, EmptyState, PriceTag, SizeSelector } from "@/components";

const SIZES_LIST = ["XS", "S", "M", "L", "XL", "XXL"];
const ITEMS_PER_PAGE = 8;

interface ShopCatalogClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
}

export default function ShopCatalogClient({ initialProducts, initialCategories }: ShopCatalogClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [products] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [loading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Wishlist & Quick View State
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [qvSize, setQvSize] = useState("");
  const [qvWarning, setQvWarning] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [maxPrice, setMaxPrice] = useState<number>(() => {
    if (initialProducts.length > 0) {
      return Math.max(...initialProducts.map((p) => p.price)) + 500;
    }
    return 15000;
  });
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [availability, setAvailability] = useState<string>("all"); // all, instock, outofstock
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "featured");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
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
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.error(err);
    }
  };

  const updateUrlParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/shop?${params.toString()}`, { scroll: false });
    setCurrentPage(1); // reset to page 1 on filter
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

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSearchQuery(searchParams.get("q") || "");
    setSortBy(searchParams.get("sort") || "featured");
  }, [searchParams]);

  // Filter & Sort Logic
  const filteredProducts = products
    .filter((prod) => {
      // 1. Search Query
      const matchesSearch =
        searchQuery === "" ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Category
      let matchesCategory = true;
      if (selectedCategory) {
        const categoryId = categories.find((c) => c.slug === selectedCategory)?.id;
        matchesCategory = prod.categoryId === categoryId;
      }

      // 3. Price
      const matchesPrice = prod.price <= maxPrice;

      // 4. Size variant
      let matchesSize = true;
      if (selectedSize) {
        matchesSize =
          (prod.metadata?.sizes && prod.metadata.sizes.includes(selectedSize)) ||
          (prod.variants && prod.variants.some((v) => v.size === selectedSize));
      }

      // 5. Availability
      let matchesAvailability = true;
      const isOutOfStock = prod.stock === 0 || prod.inventory === 0;
      if (availability === "instock") {
        matchesAvailability = !isOutOfStock;
      } else if (availability === "outofstock") {
        matchesAvailability = isOutOfStock;
      }

      return matchesSearch && matchesCategory && matchesPrice && matchesSize && matchesAvailability;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0; // featured/popular uses default order
    });

  // Pagination bounds
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const activeCategory = categories.find((c) => c.slug === selectedCategory);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-poppins text-xs text-zinc-800">
      
      {/* Title */}
      <div className="text-center space-y-2 mb-12">
        <span className="text-[10px] text-accent font-bold uppercase tracking-[0.25em]">Atelier Catalog</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-wide text-foreground">The Boutique Collections</h1>
        <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
      </div>

      {/* Toolbar & Search */}
      <div className="border border-zinc-150 p-4 bg-secondary/20 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              updateUrlParams("q", e.target.value);
            }}
            placeholder="search by name, fabric, or sku..."
            className="w-full bg-background border border-zinc-200 px-3 py-2.5 pl-10 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-accent"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center space-x-1.5 px-4 py-2.5 border border-zinc-200 hover:border-accent transition font-semibold tracking-wider text-[10px] uppercase bg-background"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Sort by</span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-background border border-zinc-200 px-3 py-2.5 focus:outline-none focus:border-accent text-zinc-850 font-semibold"
            >
              <option value="featured">Featured Masterpieces</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest Additions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Specific Banner / Details */}
      {activeCategory && (
        <div className="mt-8 border border-zinc-150 overflow-hidden relative bg-zinc-950/25 aspect-[21/9] sm:aspect-[21/6] flex flex-col justify-end p-6 sm:p-10 mb-8">
          {activeCategory.bannerImage && (
            <div className="absolute inset-0 z-0">
              <Image
                src={activeCategory.bannerImage}
                alt=""
                fill
                sizes="100vw"
                className="w-full h-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            </div>
          )}
          <div className="relative z-10 space-y-2 max-w-xl text-white">
            <span className="text-[10px] text-accent font-bold uppercase tracking-[0.25em]">Boutique Collection</span>
            <h2 className="font-serif text-2xl sm:text-4xl font-light tracking-wide text-white leading-none">
              {activeCategory.name}
            </h2>
            <p className="text-[11px] text-zinc-400 font-light max-w-md leading-relaxed font-poppins lowercase">
              {activeCategory.description || "curated double-faced silhouettes with hand-tailored finishes."}
            </p>
            <span className="inline-block text-[9px] uppercase tracking-widest text-accent font-mono pt-1">
              {filteredProducts.length} pieces found
            </span>
          </div>
        </div>
      )}

      {/* Main Grid Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8 border-r border-zinc-100 pr-8">
          
          {/* Categories */}
          <div className="space-y-4">
            <span className="text-[10px] text-accent font-bold uppercase tracking-[0.25em] block">Categories</span>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`w-full flex items-center justify-between text-left py-1.5 transition ${
                    selectedCategory === cat.slug
                      ? "text-primary font-bold pl-1"
                      : "text-zinc-600 hover:text-black hover:pl-1"
                  }`}
                >
                  <span className="font-serif text-sm font-light">{cat.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Pricing slider */}
          <div className="space-y-4 pt-6 border-t border-zinc-100">
            <span className="text-[10px] text-accent font-bold uppercase tracking-[0.25em] block">Price Threshold</span>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="30000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-accent bg-zinc-150 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between font-mono font-semibold text-[10px] text-zinc-500">
                <span>₹0</span>
                <span className="text-primary">Under {formatPrice(maxPrice)}</span>
              </div>
            </div>
          </div>

          {/* Size Selectors */}
          <div className="space-y-4 pt-6 border-t border-zinc-100">
            <span className="text-[10px] text-accent font-bold uppercase tracking-[0.25em] block">Size Select</span>
            <div className="grid grid-cols-4 gap-2">
              {SIZES_LIST.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? "" : sz)}
                  className={`py-2 border text-[10px] font-bold transition ${
                    selectedSize === sz
                      ? "bg-accent border-accent text-zinc-950"
                      : "border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4 pt-6 border-t border-zinc-100">
            <span className="text-[10px] text-accent font-bold uppercase tracking-[0.25em] block">Status</span>
            <div className="space-y-2">
              {[
                { label: "All Items", val: "all" },
                { label: "In Stock Only", val: "instock" },
                { label: "Out of Stock", val: "outofstock" }
              ].map((av) => (
                <button
                  key={av.val}
                  onClick={() => setAvailability(av.val)}
                  className={`w-full text-left py-1 text-xs transition ${
                    availability === av.val ? "text-primary font-bold" : "text-zinc-500 hover:text-black"
                  }`}
                >
                  {av.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Area (9 Cols) */}
        <div className="lg:col-span-9 space-y-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-zinc-150 animate-pulse border border-zinc-200" />
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <EmptyState
              title="No Silhouettes Match"
              description="Adjust your luxury filters or look up different descriptors."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {paginatedProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    categoryName={categories.find((c) => c.id === prod.categoryId)?.name}
                    isWishlisted={wishlist.includes(prod.id)}
                    onWishlistToggle={toggleWishlist}
                    onQuickView={triggerQuickView}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-8 border-t border-zinc-100 font-poppins">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="flex items-center space-x-1 px-4 py-2 border border-zinc-200 hover:border-accent disabled:opacity-30 transition uppercase text-[10px] font-bold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <span className="text-[10px] font-semibold text-zinc-500 tracking-wider">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="flex items-center space-x-1 px-4 py-2 border border-zinc-200 hover:border-accent disabled:opacity-30 transition uppercase text-[10px] font-bold"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/40"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="relative w-80 max-w-full h-full bg-background p-6 space-y-6 flex flex-col justify-between overflow-y-auto shadow-2xl z-10 font-poppins"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                  <span className="text-xs font-bold uppercase tracking-wider">Refine catalog</span>
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X className="w-5 h-5 text-zinc-500" />
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <span className="text-[10px] text-accent font-bold uppercase tracking-widest block">Category</span>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`px-3 py-1.5 border text-[9px] font-bold uppercase tracking-wider transition ${
                          selectedCategory === cat.slug
                            ? "bg-accent border-accent text-zinc-950"
                            : "border-zinc-250 text-zinc-650"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-3 pt-4 border-t border-zinc-100">
                  <span className="text-[10px] text-accent font-bold uppercase tracking-widest block">Price Threshold</span>
                  <input
                    type="range"
                    min="0"
                    max="30000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-accent bg-zinc-150 h-1.5 rounded-lg"
                  />
                  <div className="flex justify-between font-mono text-[9px] text-zinc-500">
                    <span>₹0</span>
                    <span className="text-primary font-bold">Under {formatPrice(maxPrice)}</span>
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-3 pt-4 border-t border-zinc-100">
                  <span className="text-[10px] text-accent font-bold uppercase tracking-widest block">Sizes</span>
                  <div className="grid grid-cols-4 gap-2">
                    {SIZES_LIST.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(selectedSize === sz ? "" : sz)}
                        className={`py-2 border text-[9px] font-bold transition ${
                          selectedSize === sz
                            ? "bg-accent border-accent text-zinc-950"
                            : "border-zinc-200 text-zinc-650"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-zinc-950 text-white uppercase text-[10px] tracking-widest font-bold font-poppins"
              >
                Apply Criteria
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

              <div className="aspect-[3/4] bg-zinc-50 rounded-image overflow-hidden border border-zinc-100 relative">
                <Image
                  src={quickViewProduct.images[0]?.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"}
                  alt={quickViewProduct.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
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
}
