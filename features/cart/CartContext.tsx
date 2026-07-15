"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Product } from "@/types";
import { useAuth } from "@/features/auth/AuthContext";
import { useRouter } from "next/navigation";
import { getDisplayPrice } from "@/utils";

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sss_boutique_cart");
      if (stored) {
        const parsedCart = JSON.parse(stored);
        setTimeout(() => {
          setCart(parsedCart);
        }, 0);
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
    setIsLoaded(true);
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("sss_boutique_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [cart, isLoaded]);

  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    if (!user) {
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?redirect=${currentUrl}`);
      return;
    }
    setCart((prevCart) => {
      // Find if item already exists with the exact same size/color
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.productId === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }

      return [
        ...prevCart,
        {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          cartId: "local_cart",
          productId: product.id,
          product,
          quantity,
          selectedSize: size,
          selectedColor: color,
          size,
          color,
        },
      ];
    });
    setIsOpen(true); // Automatically open cart drawer when adding item
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
          )
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId &&
        item.selectedSize === size &&
        item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + getDisplayPrice(item.product) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
export default CartContext;
