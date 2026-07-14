"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { PriceTag } from "@/components/ui/PriceTag";
import { Badge } from "@/components/ui/Badge";
import { WishlistButton } from "@/components/commerce/WishlistButton";

export interface ProductCardProps {
  product: Product;
  categoryName?: string;
  variant?: "grid" | "minimal";
  isWishlisted?: boolean;
  onWishlistToggle?: (productId: string, e: React.MouseEvent) => void;
  onQuickView?: (product: Product, e: React.MouseEvent) => void;
  onAddToCart?: (product: Product, e: React.MouseEvent) => void;
  className?: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  categoryName,
  variant = "grid",
  isWishlisted = false,
  onWishlistToggle,
  onQuickView,
  onAddToCart,
  className = "",
}) => {
  const imageUrl = product.images?.[0]?.imageUrl || FALLBACK_IMAGE;
  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = product.inventory === 0 || product.stock === 0;

  // ── Minimal Variant (Homepage hero cards) ────────────────────────
  if (variant === "minimal") {
    return (
      <div className={`group space-y-4 ${className}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50 border border-zinc-100">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
          />
          {hasDiscount && <Badge variant="discount" className="absolute top-4 left-4">Sale</Badge>}
          <div className="absolute inset-0 bg-zinc-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
            <Link
              href={`/shop/${product.slug}`}
              className="bg-white text-zinc-950 px-6 py-2.5 font-poppins text-[10px] tracking-widest uppercase hover:bg-primary hover:text-white transition duration-300 font-semibold"
            >
              View Details
            </Link>
          </div>
        </div>
        <div className="space-y-1 text-center">
          {categoryName && (
            <span className="text-[10px] text-zinc-400 font-poppins tracking-widest uppercase">
              {categoryName}
            </span>
          )}
          <h3 className="font-serif text-base font-light tracking-wide text-foreground">
            <Link href={`/shop/${product.slug}`} className="hover:text-primary transition">
              {product.name}
            </Link>
          </h3>
          <PriceTag
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="sm"
            className="justify-center"
          />
        </div>
      </div>
    );
  }

  // ── Grid Variant (Shop catalog cards) ────────────────────────────
  return (
    <div
      className={`bg-card rounded-card border border-zinc-100/50 p-3 sm:p-4 space-y-3 font-poppins shadow-luxury hover:shadow-card-hover hover:scale-[1.01] transition-all duration-300 relative group flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Image Area */}
        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50 rounded-image border border-zinc-100 flex-shrink-0">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Discount Badge */}
          {hasDiscount && (
            <Badge variant="discount" className="absolute top-3 left-3">
              -{Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
            </Badge>
          )}

          {/* Sold Out Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-image">
              <Badge variant="soldOut">Sold Out</Badge>
            </div>
          )}

          {/* Wishlist Button */}
          {onWishlistToggle && (
            <WishlistButton
              productId={product.id}
              isWishlisted={isWishlisted}
              onToggle={onWishlistToggle}
              className="absolute top-3 right-3"
            />
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-zinc-950/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-image gap-2">
            {onQuickView && (
              <button
                onClick={(e) => onQuickView(product, e)}
                className="bg-white/95 text-zinc-950 p-3 shadow-md hover:bg-primary hover:text-white transition duration-300 rounded-full"
                aria-label="Quick View"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <Link
              href={`/shop/${product.slug}`}
              className="bg-white/95 text-zinc-950 p-3 shadow-md hover:bg-primary hover:text-white transition duration-300 rounded-full"
              aria-label="View Details"
            >
              <ShoppingBag className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-1 pt-3">
          {categoryName && (
            <span className="text-[9px] text-zinc-400 tracking-widest uppercase font-light">
              {categoryName}
            </span>
          )}
          <h3 className="text-xs font-medium tracking-wide text-foreground leading-snug line-clamp-2">
            <Link href={`/shop/${product.slug}`} className="hover:text-primary transition">
              {product.name}
            </Link>
          </h3>
          <PriceTag
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="sm"
          />
        </div>
      </div>

      {/* Add to Cart */}
      {onAddToCart && !isOutOfStock && (
        <button
          onClick={(e) => onAddToCart(product, e)}
          className="w-full mt-2 py-2.5 bg-foreground text-background text-[9px] font-bold uppercase tracking-widest hover:bg-primary transition duration-300 rounded-button flex items-center justify-center space-x-1.5"
        >
          <ShoppingBag className="w-3 h-3" />
          <span>Add to Bag</span>
        </button>
      )}
    </div>
  );
};

export default ProductCard;
