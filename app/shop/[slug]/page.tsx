import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { dbService } from "@/services/dbService";
import ProductDetailClient from "./ProductDetailClient";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components";

import { Product, Category } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Incremental Static Regeneration (ISR) - regenerate page at most every 60 seconds
export const revalidate = 60;

// Pre-generate static product paths at build time
export async function generateStaticParams() {
  try {
    const products = await dbService.getProducts();
    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (err) {
    console.error("[PERF] generateStaticParams failed:", err);
    return [];
  }
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await dbService.getProductBySlug(slug);
  
  if (!product) {
    return {
      title: "Product Not Found | SSS Boutique",
    };
  }

  return {
    title: `${product.name} | SSS Boutique`,
    description: product.description.substring(0, 155) + "...",
    openGraph: {
      title: `${product.name} | SSS Boutique Luxury Fashion`,
      description: product.description,
      images: [
        {
          url: product.images[0]?.imageUrl || "",
          width: 800,
          height: 1000,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let product = null;
  
  try {
    product = await dbService.getProductBySlug(slug);
  } catch (err) {
    console.error(`[PERF] ProductDetailPage fetch product by slug failed:`, err);
  }

  if (!product) {
    notFound();
  }

  let recommendations: Product[] = [];
  let category: Category | undefined = undefined;
  
  try {
    // Fetch recommendations (same category, excluding current product)
    const allProducts = await dbService.getProducts();
    recommendations = allProducts
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 3);

    // Fetch category name
    const categories = await dbService.getCategories();
    category = categories.find((c) => c.id === product.categoryId);
  } catch (err) {
    console.error("[PERF] Recommendations / Category fetch failed:", err);
  }

  return (
    <>
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1.5 text-[10px] text-zinc-400 font-poppins uppercase tracking-widest mb-10">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-primary transition">Shop</Link>
            <ChevronRight className="w-3 h-3" />
            {category && (
              <>
                <Link href={`/shop?category=${category.slug}`} className="hover:text-primary transition">
                  {category.name}
                </Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-zinc-600 font-medium truncate max-w-[150px]">{product.name}</span>
          </nav>

          {/* Interactive Client Section */}
          <ProductDetailClient 
            product={product} 
            categoryName={category?.name || "Luxury Edit"} 
            allProducts={recommendations} 
          />

          {/* RECOMMENDATIONS SECTION */}
          {recommendations.length > 0 && (
            <section className="mt-24 border-t border-zinc-100 pt-16">
              <div className="text-center space-y-2 mb-12">
                <span className="font-poppins text-[10px] tracking-[0.3em] uppercase text-accent font-bold">
                  Curated Coordination
                </span>
                <h2 className="font-serif text-2xl font-light tracking-wide text-foreground">
                  You May Also Like
                </h2>
                <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    categoryName={category?.name || "Luxury Edit"}
                    variant="minimal"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
