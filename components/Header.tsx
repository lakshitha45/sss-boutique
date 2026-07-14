"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/features/cart/CartContext";
import { useAuth } from "@/features/auth/AuthContext";
import { useBrand } from "@/features/brand/BrandContext";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, User, Menu, X, ArrowRight, Search, Heart } from "lucide-react";

export const Header: React.FC = () => {
  const { brand } = useBrand();
  const pathname = usePathname();
  const { setIsOpen: setCartOpen, cartCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const updateWishlistCount = () => {
    try {
      const stored = localStorage.getItem("sss_boutique_wishlist");
      if (stored) {
        setWishlistCount(JSON.parse(stored).length);
      } else {
        setWishlistCount(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    updateWishlistCount();
    window.addEventListener("wishlist-updated", updateWishlistCount);
    window.addEventListener("storage", updateWishlistCount);
    return () => {
      window.removeEventListener("wishlist-updated", updateWishlistCount);
      window.removeEventListener("storage", updateWishlistCount);
    };
  }, []);

  const navLinks = [
    { name: "Shop All", href: "/shop" },
    { name: "Dresses", href: "/shop?category=dresses" },
    { name: "Outerwear", href: "/shop?category=outerwear" },
    { name: "Accessories", href: "/shop?category=accessories" },
  ];

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const headerClass = `${brand.stickyNavbar ? "sticky top-0" : "relative"} z-40 w-full transition-all duration-350 ${
    brand.glassNavbar ? "glass" : "bg-card border-b border-border-color"
  }`;

  return (
    <>
      {brand.announcementBar && (
        <div className="bg-primary text-background py-2 px-4 text-[10px] text-center font-bold uppercase tracking-widest leading-normal">
          {brand.announcementText}
        </div>
      )}
      <header className={headerClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 -ml-2 text-foreground/80 hover:text-primary transition"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Left Navigation (Desktop) */}
            <nav className="hidden md:flex space-x-8 font-poppins text-xs tracking-widest uppercase">
              {navLinks.map((link) => {
                const active = pathname === link.href || (link.href !== "/shop" && pathname.startsWith("/shop") && pathname.includes(link.href.split("=")[1] || ""));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`hover:text-primary transition-colors relative py-1 ${
                      active ? "text-primary font-semibold" : "text-foreground/80"
                    }`}
                  >
                    {link.name}
                    {active && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 w-full h-[1px] bg-primary"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logo / Branding */}
            <div className="flex-1 text-center md:flex-none">
              <Link
                href="/"
                className="hover:opacity-80 transition duration-300 inline-flex items-center justify-center h-20 overflow-visible"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logoUrl}
                  alt={brand.brandName}
                  className="h-20 w-auto object-contain scale-[1.35] transform origin-center -translate-x-3"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = "inline-block";
                  }}
                />
                <span
                  className="font-serif text-2xl sm:text-3xl font-medium tracking-[0.25em] text-foreground uppercase hidden"
                >
                  {brand.brandName}
                </span>
              </Link>
            </div>

            {/* Right Navigation (Actions) */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Admin shortcut */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden lg:inline-block font-poppins text-[10px] tracking-widest uppercase text-accent border border-accent/40 px-3 py-1 hover:bg-accent hover:text-white transition duration-300"
                >
                  Admin Panel
                </Link>
              )}

              {/* Profile Dropdown or Sign In */}
              {user ? (
                <div className="relative group py-2">
                  <button
                    className="flex items-center space-x-1.5 text-foreground/80 hover:text-primary transition"
                    aria-label="User Account"
                  >
                    <User className="w-5 h-5 text-accent" />
                    <span className="hidden sm:inline font-poppins text-[11px] tracking-wider font-medium max-w-[80px] truncate">
                      {user.fullName.split(" ")[0]}
                    </span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full w-48 bg-card border border-zinc-150 rounded-none shadow-xl py-2 hidden group-hover:block hover:block font-poppins text-xs transition duration-200">
                    <div className="px-4 py-2 border-b border-zinc-50 text-[10px] text-zinc-400 truncate">
                      {user.email}
                    </div>
                    {isAdmin && (
                      <Link href="/admin" className="block px-4 py-2.5 hover:bg-zinc-50 hover:text-primary transition">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link href="/orders" className="block px-4 py-2.5 hover:bg-zinc-50 hover:text-primary transition">
                      Order History
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="w-full text-left block px-4 py-2.5 hover:bg-zinc-50 text-error/90 hover:text-error transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-1 text-foreground/80 hover:text-primary transition"
                  aria-label="Login"
                >
                  <User className="w-5 h-5 text-zinc-400" />
                  <span className="hidden sm:inline font-poppins text-xs tracking-wider">Sign In</span>
                </Link>
              )}

              {/* Wishlist Link */}
              {brand.showWishlist && (
                <Link
                  href="/wishlist"
                  className="p-1 text-foreground/80 hover:text-primary transition relative flex items-center"
                  aria-label="Open Wishlist"
                >
                  <Heart className="w-5.5 h-5.5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-background text-[9px] font-poppins font-bold rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Search Trigger */}
              {brand.showSearch && (
                <button
                  onClick={() => window.dispatchEvent(new Event("open-search-palette"))}
                  className="p-1 text-foreground/80 hover:text-primary transition"
                  aria-label="Open Search Palette"
                >
                  <Search className="w-5.5 h-5.5" />
                </button>
              )}

              {/* Shopping Cart Trigger */}
              {brand.showCart && (
                <button
                  onClick={() => setCartOpen(true)}
                  className="p-1 text-foreground/80 hover:text-primary transition relative"
                  aria-label="Open Shopping Bag"
                >
                  <ShoppingBag className="w-5.5 h-5.5" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-background text-[9px] font-poppins font-bold rounded-full flex items-center justify-center"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-secondary border-b border-accent/10 overflow-hidden font-poppins text-xs uppercase tracking-widest"
          >
            <div className="px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-foreground/80 hover:text-primary transition"
                >
                  {link.name}
                </Link>
              ))}
              {user && isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-accent font-semibold transition"
                >
                  Admin Panel
                </Link>
              )}
              {user ? (
                <>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-foreground/80 hover:text-primary transition"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-error/85 transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-foreground/80 hover:text-primary transition"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </header>
    </>
  );
};
export default Header;
