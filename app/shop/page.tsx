import React, { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchProducts, fetchCategories } from "@/features/products/productActions";
import ShopCatalogClient from "./ShopCatalogClient";

import { Product, Category } from "@/types";

// Incremental Static Regeneration (ISR) - regenerate page at most every 60 seconds
export const revalidate = 60;

export default async function ShopPage() {
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
    console.error("[PERF] Shop page build-time data fetch failed:", err);
  }

  return (
    <>
      <Header />
      <main className="flex-1 min-h-[70vh]">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <ShopCatalogClient 
            initialProducts={products} 
            initialCategories={categories} 
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
