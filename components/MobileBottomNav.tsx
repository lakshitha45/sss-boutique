"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/features/cart/CartContext";
import { useAuth } from "@/features/auth/AuthContext";
import { Home, Shirt, Search, ShoppingBag, User } from "lucide-react";

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { setIsOpen: setCartOpen, cartCount } = useCart();
  const { user } = useAuth();

  const handleOpenSearch = () => {
    window.dispatchEvent(new Event("open-search-palette"));
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/75 backdrop-blur-lg border-t border-accent/15 flex justify-around items-center h-16 md:hidden px-4 shadow-[0_-8px_30px_rgba(0,0,0,0.025)]">
      
      {/* Home */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center space-y-0.5 p-1 w-12 transition ${
          isActive("/") ? "text-primary" : "text-zinc-400 hover:text-zinc-700"
        }`}
        aria-label="Home"
      >
        <Home className="w-5 h-5" />
        <span className="text-[9px] font-poppins font-medium tracking-wide uppercase">Home</span>
      </Link>

      {/* Shop */}
      <Link
        href="/shop"
        className={`flex flex-col items-center justify-center space-y-0.5 p-1 w-12 transition ${
          isActive("/shop") ? "text-primary" : "text-zinc-400 hover:text-zinc-700"
        }`}
        aria-label="Shop"
      >
        <Shirt className="w-5 h-5" />
        <span className="text-[9px] font-poppins font-medium tracking-wide uppercase">Shop</span>
      </Link>

      {/* Search Trigger */}
      <button
        onClick={handleOpenSearch}
        className="flex flex-col items-center justify-center space-y-0.5 p-1 w-12 text-zinc-400 hover:text-zinc-700 transition"
        aria-label="Open Search Palette"
      >
        <Search className="w-5 h-5" />
        <span className="text-[9px] font-poppins font-medium tracking-wide uppercase">Search</span>
      </button>

      {/* Cart Trigger */}
      <button
        onClick={() => setCartOpen(true)}
        className="flex flex-col items-center justify-center space-y-0.5 p-1 w-12 text-zinc-400 hover:text-zinc-700 transition relative"
        aria-label="Open Cart Bag"
      >
        <ShoppingBag className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute top-0.5 right-1 w-4 h-4 bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center scale-95 animate-pulse">
            {cartCount}
          </span>
        )}
        <span className="text-[9px] font-poppins font-medium tracking-wide uppercase">Bag</span>
      </button>

      {/* Account */}
      <Link
        href={user ? "/orders" : "/login"}
        className={`flex flex-col items-center justify-center space-y-0.5 p-1 w-12 transition ${
          isActive("/orders") || isActive("/login") ? "text-primary" : "text-zinc-400 hover:text-zinc-700"
        }`}
        aria-label="Account details"
      >
        <User className="w-5 h-5" />
        <span className="text-[9px] font-poppins font-medium tracking-wide uppercase">Profile</span>
      </Link>

    </nav>
  );
};
export default MobileBottomNav;
