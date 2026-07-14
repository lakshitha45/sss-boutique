"use client";

import React from "react";
import { AuthProvider } from "@/features/auth/AuthContext";
import { CartProvider } from "@/features/cart/CartContext";
import { BrandProvider } from "@/features/brand/BrandContext";
import { CartDrawer } from "@/components/CartDrawer";
import { DevBanner } from "@/components/DevBanner";
import { SearchPalette } from "@/components/SearchPalette";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrandProvider>
      <AuthProvider>
        <CartProvider>
          <DevBanner />
          {children}
          <CartDrawer />
          <SearchPalette />
          <MobileBottomNav />
        </CartProvider>
      </AuthProvider>
    </BrandProvider>
  );
};
export default Providers;

