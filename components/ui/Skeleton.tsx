"use client";

import React from "react";

export type SkeletonShape = "line" | "circle" | "card" | "image";

export interface SkeletonProps {
  shape?: SkeletonShape;
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

const shapeClasses: Record<SkeletonShape, string> = {
  line: "h-4 rounded",
  circle: "rounded-full",
  card: "rounded-card",
  image: "aspect-[3/4] rounded-image",
};

export const Skeleton: React.FC<SkeletonProps> = ({
  shape = "line",
  width,
  height,
  className = "",
  count = 1,
}) => {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`bg-zinc-100 animate-pulse ${shapeClasses[shape]} ${className}`}
          style={{ width, height }}
        />
      ))}
    </>
  );
};

// Pre-built product card skeleton matching the design system
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-card border border-zinc-100/50 p-4 space-y-4 animate-pulse shadow-luxury">
    <div className="aspect-[3/4] bg-zinc-100 rounded-image" />
    <div className="space-y-2">
      <div className="h-3 bg-zinc-100 w-2/3 rounded" />
      <div className="h-4 bg-zinc-100 w-full rounded" />
      <div className="h-3 bg-zinc-100 w-1/3 rounded" />
    </div>
  </div>
);

export default Skeleton;
