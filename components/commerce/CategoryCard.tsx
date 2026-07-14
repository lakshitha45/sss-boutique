"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";

export interface CategoryCardProps {
  category: Category;
  variant?: "grid" | "banner";
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  variant = "grid",
  className = "",
}) => {
  const imageUrl =
    category.bannerImage ||
    category.imageUrl ||
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";

  if (variant === "banner") {
    return (
      <Link
        href={`/shop?category=${category.slug}`}
        className={`relative block h-64 overflow-hidden group ${className}`}
      >
        <Image
          src={imageUrl}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 to-transparent" />
        <div className="absolute bottom-6 left-6 space-y-1 z-10">
          <h3 className="font-serif text-xl font-medium text-white tracking-wide">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-zinc-300 text-[11px] font-poppins font-light line-clamp-2 max-w-[240px]">
              {category.description}
            </p>
          )}
        </div>
      </Link>
    );
  }

  // Grid variant
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className={`relative block aspect-[3/4] overflow-hidden group border border-zinc-100 bg-zinc-50 ${className}`}
    >
      <Image
        src={imageUrl}
        alt={category.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <span className="text-[10px] text-zinc-300 font-poppins tracking-widest uppercase font-light">
          Collection
        </span>
        <h3 className="font-serif text-base font-light text-white tracking-wide mt-0.5">
          {category.name}
        </h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
