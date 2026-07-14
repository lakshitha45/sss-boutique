"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { useBrand } from "@/features/brand/BrandContext";

export const Footer: React.FC = () => {
  const { brand } = useBrand();

  return (
    <footer className="bg-[#121212] text-zinc-400 font-poppins text-xs tracking-wider border-t border-accent/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.logoUrl}
              alt={brand.brandName}
              className="h-20 w-auto object-contain scale-[1.3] transform origin-left overflow-visible"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "block";
              }}
            />
            <h3 className="font-serif text-lg text-white tracking-[0.25em] uppercase hidden">
              {brand.brandName}
            </h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-[240px]">
              {brand.tagline || "A curated destination for timeless fashion, premium silhouettes, and exceptional craftsmanship."}
            </p>
            
            {/* Social Media Link Handles */}
            <div className="flex space-x-4 pt-2">
              {brand.instagram && (
                <a 
                  href={brand.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-zinc-500 hover:text-accent transition" 
                  aria-label="Instagram"
                >
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              )}
              {brand.facebook && (
                <a 
                  href={brand.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-zinc-500 hover:text-accent transition" 
                  aria-label="Facebook"
                >
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {brand.youtube && (
                <a 
                  href={brand.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-zinc-500 hover:text-accent transition" 
                  aria-label="YouTube"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                  </svg>
                </a>
              )}
              {brand.pinterest && (
                <a 
                  href={brand.pinterest} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-zinc-500 hover:text-accent transition" 
                  aria-label="Pinterest"
                >
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-accent uppercase tracking-[0.2em]">
              Collections
            </h4>
            {brand.showQuickLinks ? (
              <ul className="space-y-2.5 text-[11px]">
                <li>
                  <Link href="/shop?category=dresses" className="hover:text-white transition">Dresses</Link>
                </li>
                <li>
                  <Link href="/shop?category=outerwear" className="hover:text-white transition">Outerwear & Coats</Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-white transition">Shop All Collections</Link>
                </li>
              </ul>
            ) : (
              <span className="text-[10px] text-zinc-650 italic font-light">Custom styling active</span>
            )}
          </div>

          {/* Boutique Info */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-accent uppercase tracking-[0.2em]">
              Boutique Info
            </h4>
            <ul className="space-y-2.5 text-[11px]">
              {brand.address && (
                <li className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-600 mt-0.5 flex-shrink-0" />
                  <span>{brand.address}</span>
                </li>
              )}
              {brand.phone && (
                <li className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  <span>{brand.phone}</span>
                </li>
              )}
              {brand.email && (
                <li className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  <span className="break-all">{brand.email}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Shop Categories */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-accent uppercase tracking-[0.2em]">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-[11px]">
              <li>
                <Link href="/shop?category=sarees" className="hover:text-white transition">Designer Sarees</Link>
              </li>
              <li>
                <Link href="/shop?category=dresses" className="hover:text-white transition">Silk Dresses</Link>
              </li>
              <li>
                <Link href="/shop?category=outerwear" className="hover:text-white transition">Outerwear & Coats</Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-white transition">Luxury Accessories</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Base Info & Copyright */}
        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-zinc-650 space-y-4 sm:space-y-0">
          <p>{brand.copyright || `© ${new Date().getFullYear()} SSS Boutique. All Rights Reserved.`}</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-zinc-400 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-400 transition">Terms & Conditions</Link>
            <Link href="/refund" className="hover:text-zinc-400 transition">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
