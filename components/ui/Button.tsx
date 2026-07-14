"use client";

import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  href?: string;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:bg-primary border-transparent",
  secondary:
    "bg-card text-foreground border border-zinc-200 hover:border-primary hover:text-primary",
  outline:
    "bg-transparent text-foreground border border-foreground/50 hover:bg-foreground hover:text-background",
  ghost:
    "bg-transparent text-foreground/80 border-transparent hover:bg-zinc-100 hover:text-foreground",
  danger:
    "bg-error text-white border-transparent hover:opacity-90",
  accent:
    "bg-accent text-foreground border-transparent hover:bg-accent-hover",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-3 py-1.5 text-[9px] tracking-widest",
  sm: "px-4 py-2 text-[10px] tracking-widest",
  md: "px-6 py-3 text-xs tracking-widest",
  lg: "px-8 py-3.5 text-xs tracking-widest",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      href,
      children,
      className = "",
      ...rest
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center space-x-2 font-poppins font-semibold uppercase transition duration-300 rounded-button disabled:opacity-50 disabled:cursor-not-allowed";

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
      fullWidth ? "w-full" : ""
    } ${className}`;

    const content = (
      <>
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
      </>
    );

    if (href && !disabled) {
      return (
        <Link href={href} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={classes}
        {...rest}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
