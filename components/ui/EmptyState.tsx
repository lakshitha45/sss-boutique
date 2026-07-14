"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, Heart, Search, Package, AlertCircle } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const defaultIcons: Record<string, React.ReactNode> = {
  cart: <ShoppingBag className="w-8 h-8 text-zinc-300" />,
  wishlist: <Heart className="w-8 h-8 text-zinc-300" />,
  search: <Search className="w-8 h-8 text-zinc-300" />,
  orders: <Package className="w-8 h-8 text-zinc-300" />,
  error: <AlertCircle className="w-8 h-8 text-zinc-300" />,
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) => {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto font-poppins">
      <div className="w-20 h-20 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
        {icon || defaultIcons.search}
      </div>
      <div className="space-y-2">
        <h3 className="font-serif text-xl font-medium tracking-wide text-foreground">
          {title}
        </h3>
        <p className="text-zinc-500 text-xs leading-relaxed font-light">
          {description}
        </p>
      </div>
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Link
            href={actionHref}
            className="bg-foreground text-background font-poppins text-xs tracking-widest uppercase px-8 py-3.5 hover:bg-primary transition duration-300 font-semibold rounded-button"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="bg-foreground text-background font-poppins text-xs tracking-widest uppercase px-8 py-3.5 hover:bg-primary transition duration-300 font-semibold rounded-button"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
};

export { defaultIcons as emptyStateIcons };
export default EmptyState;
