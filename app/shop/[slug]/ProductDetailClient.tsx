"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types";
import { useCart } from "@/features/cart/CartContext";
import { formatPrice } from "@/utils";
import { Plus, Minus, ShieldCheck, Truck, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button, SizeSelector, PriceTag, WishlistButton, QuantitySelector } from "@/components";

interface ProductDetailClientProps {
  product: Product;
  categoryName: string;
  allProducts: Product[];
}

export default function ProductDetailClient({ product, categoryName, allProducts }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>(product.metadata?.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [sizeWarning, setSizeWarning] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentViewedProducts, setRecentViewedProducts] = useState<Product[]>([]);

  useEffect(() => {
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

  // Magnifier State
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sss_recently_viewed");
      let list: string[] = stored ? JSON.parse(stored) : [];
      list = list.filter((s) => s !== product.slug);
      list.unshift(product.slug);
      list = list.slice(0, 5);
      localStorage.setItem("sss_recently_viewed", JSON.stringify(list));

      const matched = list
        .filter((slug) => slug !== product.slug)
        .map((slug) => allProducts.find((p) => p.slug === slug))
        .filter((p): p is Product => !!p);
      setRecentViewedProducts(matched.slice(0, 4));
    } catch (e) {
      console.error(e);
    }
  }, [product.slug, allProducts]);

  // Accordion Toggle States
  const [accordions, setAccordions] = useState({
    details: true,
    sizeFit: false,
    shipping: false,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const toggleAccordion = (section: keyof typeof accordions) => {
    setAccordions((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddToCart = () => {
    if (product.metadata?.sizes && product.metadata.sizes.length > 0 && !selectedSize) {
      setSizeWarning(true);
      return;
    }
    setSizeWarning(false);
    addToCart(product, quantity, selectedSize || undefined, selectedColor || undefined);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 font-poppins">
      
      {/* GALLERY / IMAGES (Left 7 Cols) */}
      <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
        
        {/* Thumbnails list */}
        {product.images.length > 1 && (
          <div className="flex md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImgIndex(index)}
                className={`relative w-16 h-20 bg-zinc-50 border overflow-hidden flex-shrink-0 transition duration-300 ${
                  activeImgIndex === index ? "border-accent" : "border-zinc-200 hover:border-zinc-400"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={img.imageUrl}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Large View with Zoom magnifier */}
        <div className="flex-1 order-1 md:order-2">
          <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            className="relative aspect-[3/4] bg-zinc-50 border border-zinc-100 overflow-hidden cursor-zoom-in"
          >
            <Image
              src={product.images[activeImgIndex]?.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-100"
              style={{
                transform: isZooming ? "scale(2)" : "scale(1)",
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />
            {product.compareAtPrice && (
              <span className="absolute top-4 left-4 bg-primary text-background text-[9px] font-bold tracking-widest uppercase px-3 py-1 z-10">
                Sale
              </span>
            )}
          </div>
          <span className="text-[10px] text-zinc-400 text-center block mt-2 tracking-wider lowercase">
            hover image to magnify details
          </span>
        </div>

      </div>

      {/* METADATA / DETAILS (Right 5 Cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div>
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.2em]">
            {categoryName}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-foreground mt-1 leading-snug">
            {product.name}
          </h1>
          
          <PriceTag
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="lg"
            className="mt-3"
          />
        </div>

        <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-light">
          {product.description}
        </p>

        <div className="border-t border-zinc-100 pt-6 space-y-6">
          {/* Colors selector (if colors exist) */}
          {product.metadata?.colors && product.metadata.colors.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">
                Color: <span className="text-foreground font-normal normal-case">{selectedColor}</span>
              </span>
              <div className="flex gap-2">
                {product.metadata.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 border text-xs tracking-wider transition ${
                      selectedColor === color
                        ? "border-foreground bg-foreground text-background font-medium"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes selector */}
          {((product.metadata?.sizes && product.metadata.sizes.length > 0) || (product.variants && product.variants.length > 0)) && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                <span className="text-accent font-bold">Size Guide</span>
              </div>
              <SizeSelector
                variants={
                  product.variants && product.variants.length > 0
                    ? product.variants
                    : (product.metadata?.sizes || []).map((sz, idx) => ({
                        id: String(idx),
                        productId: product.id,
                        size: sz,
                        stock: 10,
                        sku: "",
                      }))
                }
                selectedSize={selectedSize}
                onSelect={(sz) => {
                  setSelectedSize(sz);
                  setSizeWarning(false);
                }}
              />
              {sizeWarning && (
                <p className="text-error text-xs font-medium tracking-wide">Please select a size before adding to bag.</p>
              )}
            </div>
          )}

          {/* Quantity adjuster */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">Quantity</span>
            <QuantitySelector
              quantity={quantity}
              onChange={setQuantity}
              min={1}
              max={product.inventory || 10}
            />
          </div>

          {/* Add to Cart Actions */}
          <div className="pt-2 flex space-x-3 items-center">
            {product.inventory > 0 ? (
              <Button
                onClick={handleAddToCart}
                fullWidth
                size="lg"
              >
                Add to Bag
              </Button>
            ) : (
              <Button
                disabled
                fullWidth
                size="lg"
                variant="secondary"
              >
                Sold Out
              </Button>
            )}
            <WishlistButton
              productId={product.id}
              isWishlisted={wishlist.includes(product.id)}
              onToggle={toggleWishlist}
              size="md"
              className="border border-zinc-200 !bg-transparent hover:!bg-zinc-50 !shadow-none p-3 h-[48px] w-[48px] flex items-center justify-center flex-shrink-0 rounded-none"
            />
          </div>
        </div>

        {/* ACCORDION EXPANSION SHEETS */}
        <div className="border-t border-zinc-100 pt-4 space-y-3 font-poppins text-xs">
          
          {/* Detail Tab */}
          <div className="border-b border-zinc-50 pb-3">
            <button
              onClick={() => toggleAccordion("details")}
              className="flex justify-between items-center w-full py-2 hover:text-primary transition font-bold uppercase tracking-wider text-[10px] text-zinc-700"
            >
              <span>Product Details</span>
              {accordions.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <AnimatePresence>
              {accordions.details && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="py-2 text-zinc-500 space-y-2 leading-relaxed">
                    <p><strong>SKU:</strong> {product.sku}</p>
                    {product.metadata?.material && <p><strong>Composition:</strong> {product.metadata.material}</p>}
                    {product.metadata?.care && <p><strong>Care:</strong> {product.metadata.care}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sizing Tab */}
          <div className="border-b border-zinc-50 pb-3">
            <button
              onClick={() => toggleAccordion("sizeFit")}
              className="flex justify-between items-center w-full py-2 hover:text-primary transition font-bold uppercase tracking-wider text-[10px] text-zinc-700"
            >
              <span>Size & Fit Guide</span>
              {accordions.sizeFit ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <AnimatePresence>
              {accordions.sizeFit && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="py-2 text-zinc-500 leading-relaxed">
                    {product.metadata?.sizeFit ? (
                      <p>{product.metadata.sizeFit}</p>
                    ) : (
                      <p>Tailored silhouettes. Designed for a comfortable draping. Choose your normal size.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Shipping Tab */}
          <div className="border-b border-zinc-50 pb-3">
            <button
              onClick={() => toggleAccordion("shipping")}
              className="flex justify-between items-center w-full py-2 hover:text-primary transition font-bold uppercase tracking-wider text-[10px] text-zinc-700"
            >
              <span>Shipping & Returns</span>
              {accordions.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <AnimatePresence>
              {accordions.shipping && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="py-2 text-zinc-500 space-y-3 leading-relaxed">
                    <div className="flex items-start space-x-2.5">
                      <Truck className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Complimentary Shipping</strong>
                        <p className="text-[11px] text-zinc-400">Enjoy free standard shipping worldwide. Delivery inside 3-5 business days.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <RefreshCw className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Simple Private Returns</strong>
                        <p className="text-[11px] text-zinc-400">Complimentary return labels are included. Return within 14 days of receipt.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* RECENTLY VIEWED CAROUSEL */}
      {recentViewedProducts.length > 0 && (
        <section className="border-t border-zinc-100 pt-16">
          <div className="text-center space-y-2 mb-12">
            <span className="font-poppins text-[10px] tracking-[0.3em] uppercase text-accent font-bold">
              Your Viewing History
            </span>
            <h2 className="font-serif text-2xl font-light tracking-wide text-foreground">
              Recently Viewed Pieces
            </h2>
            <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recentViewedProducts.map((prod) => (
              <Link
                key={prod.id}
                href={`/shop/${prod.slug}`}
                className="group space-y-3 font-poppins text-xs block"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50 border border-zinc-100">
                  <img
                    src={prod.images[0]?.imageUrl}
                    alt={prod.name}
                    className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-zinc-400 tracking-widest uppercase block">
                    {prod.brand || "SSS Boutique"}
                  </span>
                  <h3 className="font-serif text-xs font-semibold text-zinc-700 group-hover:text-primary truncate transition-colors">
                    {prod.name}
                  </h3>
                  <span className="font-bold text-zinc-900 block">{formatPrice(prod.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
