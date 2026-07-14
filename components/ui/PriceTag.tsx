"use client";

import React from "react";
import { formatPrice } from "@/utils";

export interface PriceTagProps {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: { current: "text-xs", original: "text-[10px]", discount: "text-[9px]" },
  md: { current: "text-sm", original: "text-xs", discount: "text-[10px]" },
  lg: { current: "text-lg", original: "text-sm", discount: "text-xs" },
};

export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  compareAtPrice,
  size = "md",
  className = "",
}) => {
  const s = sizeClasses[size];
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <div className={`flex items-center space-x-2 font-poppins ${className}`}>
      <span className={`font-semibold text-foreground ${s.current}`}>
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <>
          <span className={`text-zinc-400 line-through font-light ${s.original}`}>
            {formatPrice(compareAtPrice)}
          </span>
          <span className={`text-primary font-semibold ${s.discount}`}>
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
};

export default PriceTag;
