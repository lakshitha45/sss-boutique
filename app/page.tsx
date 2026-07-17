import React from "react";
import { fetchProducts, fetchCategories } from "@/features/products/productActions";
import { Product, Category } from "@/types";
import HomeClient from "./HomeClient";

// Incremental Static Regeneration (ISR) - regenerate page at most every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  let products: Product[] = [];
  let categories: Category[] = [];
  
  try {
    const [cats, prods] = await Promise.all([
      fetchCategories(),
      fetchProducts(true)
    ]);
    categories = cats;
    products = prods;
  } catch (err) {
    console.error("[PERF] Homepage build-time data fetch failed:", err);
  }

  return (
    <HomeClient 
      initialProducts={products} 
      initialCategories={categories} 
    />
  );
}
