import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { dbService } from "@/services/dbService";
import { formatPrice } from "@/utils";
import ProductDetailClient from "./ProductDetailClient";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
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
  const product = await dbService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch recommendations (same category, excluding current product)
  const allProducts = await dbService.getProducts();
  const recommendations = allProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3);

  // Fetch category name
  const categories = await dbService.getCategories();
  const category = categories.find((c) => c.id === product.categoryId);

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
          <ProductDetailClient product={product} categoryName={category?.name || "Luxury Edit"} allProducts={allProducts} />

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
                  <div key={prod.id} className="group space-y-4 font-poppins">
                    <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50 border border-zinc-100">
                      <img
                        src={prod.images[0]?.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"}
                        alt={prod.name}
                        className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-zinc-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <Link
                          href={`/shop/${prod.slug}`}
                          className="bg-white text-zinc-950 px-5 py-2.5 text-[9px] tracking-widest uppercase hover:bg-primary hover:text-white transition duration-300 font-bold"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-1 text-center">
                      <span className="text-[9px] text-zinc-400 tracking-widest uppercase block">
                        {category?.name || "Luxury Edit"}
                      </span>
                      <h3 className="font-serif text-sm font-medium tracking-wide text-foreground">
                        <Link href={`/shop/${prod.slug}`} className="hover:text-primary transition">
                          {prod.name}
                        </Link>
                      </h3>
                      <span className="font-semibold text-xs block">{formatPrice(prod.price)}</span>
                    </div>
                  </div>
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
