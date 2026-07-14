"use client";

import React from "react";

export interface PageSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  accentLabel?: string;
  className?: string;
  containerClassName?: string;
  id?: string;
}

export const PageSection: React.FC<PageSectionProps> = ({
  children,
  title,
  subtitle,
  accentLabel,
  className = "",
  containerClassName = "",
  id,
}) => {
  return (
    <section id={id} className={`py-16 sm:py-20 ${className}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        {(title || accentLabel) && (
          <div className="text-center mb-12 space-y-3">
            {accentLabel && (
              <span className="text-[10px] text-accent font-bold uppercase tracking-[0.25em] font-poppins">
                {accentLabel}
              </span>
            )}
            {title && (
              <h2 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-foreground">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-zinc-500 text-xs font-poppins font-light max-w-lg mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
            <div className="w-12 h-[1px] bg-accent mx-auto mt-2" />
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default PageSection;
