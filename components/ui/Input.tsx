"use client";

import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: "default" | "dark";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, variant = "default", className = "", required, ...rest }, ref) => {
    const base =
      variant === "dark"
        ? "bg-[#141414] border-[#1F1F1F] focus:border-accent text-white placeholder-zinc-600"
        : "bg-secondary border-zinc-200 focus:border-accent text-foreground placeholder-zinc-400";

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-[10px] text-accent font-bold uppercase tracking-widest block font-poppins">
            {label}
            {required && <span className="text-primary ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            required={required}
            className={`w-full border rounded-none px-3 py-3 text-xs font-poppins focus:outline-none transition ${base} ${
              icon ? "pl-9" : ""
            } ${error ? "border-error" : ""} ${className}`}
            {...rest}
          />
        </div>
        {error && (
          <p className="text-[10px] text-error font-poppins font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Select Variant
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  variant?: "default" | "dark";
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, variant = "default", options, className = "", required, ...rest }, ref) => {
    const base =
      variant === "dark"
        ? "bg-[#141414] border-[#1F1F1F] focus:border-accent text-white"
        : "bg-secondary border-zinc-200 focus:border-accent text-foreground";

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-[10px] text-accent font-bold uppercase tracking-widest block font-poppins">
            {label}
            {required && <span className="text-primary ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          required={required}
          className={`w-full border rounded-none px-3 py-3 text-xs font-poppins focus:outline-none transition ${base} ${className}`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
export default Input;
