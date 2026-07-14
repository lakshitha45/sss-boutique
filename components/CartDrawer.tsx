"use client";

import React, { useRef, useEffect } from "react";
import { useCart } from "@/features/cart/CartContext";
import { formatPrice } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";

export const CartDrawer: React.FC = () => {
  const { cart, isOpen, setIsOpen, updateQuantity, removeFromCart, cartTotal } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Lock page scroll
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black z-50 cursor-pointer backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            ref={drawerRef}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-secondary shadow-2xl z-50 flex flex-col border-l border-accent/20"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Cart"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-accent" />
                <h2 className="font-serif text-lg font-medium tracking-wide">Your Bag</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-primary transition"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
                    <ShoppingBag className="w-6 h-6 text-zinc-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-base font-medium">Your bag is empty</h3>
                    <p className="text-zinc-400 text-xs max-w-[200px] mx-auto">
                      Explore our collections to find your perfect luxury pieces.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="font-poppins text-xs tracking-widest uppercase bg-foreground text-background px-6 py-2.5 hover:bg-primary transition duration-300"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <motion.div
                    key={`${item.product?.id || ""}-${item.selectedSize || ""}-${item.selectedColor || ""}-${idx}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex space-x-4 py-4 border-b border-zinc-50 last:border-b-0"
                  >
                    {/* Image */}
                    <div className="relative w-20 h-24 flex-shrink-0 bg-zinc-50 overflow-hidden border border-zinc-100">
                      <img
                        src={item.product?.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"}
                        alt={item.product?.name || ""}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-sm font-medium leading-snug">
                          <Link href={`/shop/${item.product?.slug || ""}`} onClick={() => setIsOpen(false)} className="hover:text-primary transition">
                            {item.product?.name}
                          </Link>
                        </h4>
                        
                        {/* Options selected */}
                        {(item.selectedSize || item.selectedColor) && (
                          <div className="flex flex-wrap gap-x-2 mt-1 text-[11px] text-zinc-400 font-poppins">
                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                            {item.selectedSize && item.selectedColor && <span>|</span>}
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          </div>
                        )}

                        <span className="font-poppins text-xs font-semibold mt-1.5 block">
                          {formatPrice(item.product?.price || 0)}
                        </span>
                      </div>

                      {/* Quantity & Delete Actions */}
                      <div className="flex items-center justify-between mt-2">
                        {/* Adjuster */}
                        <div className="flex items-center border border-zinc-200 text-xs">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedSize, item.selectedColor)}
                            className="p-1.5 hover:text-primary transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 font-poppins font-medium min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedSize, item.selectedColor)}
                            className="p-1.5 hover:text-primary transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => removeFromCart(item.productId, item.selectedSize, item.selectedColor)}
                          className="text-zinc-300 hover:text-primary transition p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer summary */}
            {cart.length > 0 && (
              <div className="bg-zinc-50 px-6 py-6 border-t border-zinc-100 space-y-4 font-poppins">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-semibold text-base">{formatPrice(cartTotal)}</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Shipping, duties, and taxes calculated at checkout.
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center inline-block py-3 bg-foreground text-background uppercase tracking-widest text-xs font-semibold hover:bg-primary transition duration-300"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
