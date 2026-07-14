"use client";

import React from "react";
import type { ProductVariant } from "@/types";

export interface SizeSelectorProps {
  variants: ProductVariant[];
  selectedSize: string;
  onSelect: (size: string) => void;
  className?: string;
}

const stockColor = (stock: number): string => {
  if (stock === 0) return "border-zinc-200 text-zinc-300 bg-zinc-50 cursor-not-allowed line-through";
  if (stock < 5) return "border-amber-300 text-amber-700 bg-amber-50 hover:border-primary hover:text-primary cursor-pointer";
  return "border-zinc-200 text-foreground bg-card hover:border-primary hover:text-primary cursor-pointer";
};

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  variants,
  selectedSize,
  onSelect,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-poppins block">
        Select Size
      </span>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = selectedSize === v.size;
          const isOutOfStock = v.stock === 0;

          return (
            <button
              key={v.id}
              disabled={isOutOfStock}
              onClick={() => !isOutOfStock && onSelect(v.size)}
              className={`min-w-[44px] h-10 px-3 border text-xs font-poppins font-semibold uppercase tracking-wider transition duration-200 ${
                isSelected
                  ? "border-primary bg-primary text-background"
                  : stockColor(v.stock)
              }`}
              title={isOutOfStock ? "Out of stock" : `${v.stock} in stock`}
            >
              {v.size}
            </button>
          );
        })}
      </div>
      {selectedSize && (
        <p className="text-[10px] text-zinc-400 font-poppins">
          {variants.find((v) => v.size === selectedSize)?.stock || 0} pieces available
        </p>
      )}
    </div>
  );
};

export default SizeSelector;
