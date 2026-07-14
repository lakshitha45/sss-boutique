"use client";

import React from "react";

export type BadgeVariant = "discount" | "status" | "info" | "soldOut" | "new" | "success" | "warning" | "error";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  discount: "bg-primary text-background",
  status: "bg-accent/15 text-accent border border-accent/30",
  info: "bg-zinc-100 text-zinc-600 border border-zinc-200",
  soldOut: "bg-zinc-900 text-white",
  new: "bg-emerald-500 text-white",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  error: "bg-red-50 text-red-700 border border-red-200",
};

export const Badge: React.FC<BadgeProps> = ({ variant = "info", children, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[9px] font-poppins font-bold uppercase tracking-wider rounded-sm ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
