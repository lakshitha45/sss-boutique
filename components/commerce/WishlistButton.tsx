"use client";

import React from "react";
import { Heart } from "lucide-react";

export interface WishlistButtonProps {
  productId: string;
  isWishlisted: boolean;
  onToggle: (productId: string, e: React.MouseEvent) => void;
  size?: "sm" | "md";
  className?: string;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  isWishlisted,
  onToggle,
  size = "md",
  className = "",
}) => {
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const padding = size === "sm" ? "p-1.5" : "p-2";

  return (
    <button
      onClick={(e) => onToggle(productId, e)}
      className={`${padding} bg-white/80 backdrop-blur-md rounded-full shadow-sm text-zinc-400 hover:text-primary transition z-10 ${className}`}
      aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <Heart
        className={`${iconSize} transition-all duration-300 ${
          isWishlisted ? "fill-primary text-primary scale-110" : ""
        }`}
      />
    </button>
  );
};

export default WishlistButton;
