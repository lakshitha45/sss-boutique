import fs from "fs";
import path from "path";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Product, Category, ProductImage, ProductVariant, Order, UserProfile, ActivityLog, Address, Notification, Shipment } from "@/types";

const MOCK_DB_DIR = path.join(process.cwd(), "data");
const MOCK_DB_PATH = path.join(MOCK_DB_DIR, "db.json");

// Seeds for Categories (complying with Document 03)
const SEED_CATEGORIES: Category[] = [
  {
    id: "cat_1",
    name: "Sarees",
    slug: "sarees",
    description: "Premium silk sarees, handcrafted with detailed heritage embroidery.",
    bannerImage: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cat_2",
    name: "Kurtis",
    slug: "kurtis",
    description: "Elegant casual and semi-formal Kurtis in cotton, georgette, and linen.",
    bannerImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cat_3",
    name: "Salwars",
    slug: "salwars",
    description: "Traditional designer salwar kameez suit sets crafted in Florence.",
    bannerImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cat_4",
    name: "Accessories",
    slug: "accessories",
    description: "Designer gold-plated cuffs, cuffs, and silk scarves.",
    bannerImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Seed raw product metadata
const SEED_FLAT_PRODUCTS = [
  {
    id: "prod_1",
    categoryId: "cat_1",
    productName: "Aurelia Silk Slip Dress",
    slug: "aurelia-silk-slip-dress",
    description: "A breathtaking classic silhouette cut from heavy-weight Italian silk satin. Drapes fluidly along the body featuring a delicate cowl neckline and adjustable cross-back straps.",
    shortDescription: "Italian silk slip dress with cross-back straps.",
    price: 290,
    discountPrice: 350, // compareAtPrice old higher price
    sku: "AURE-SILK-DR-01",
    material: "100% Silk Satin",
    brand: "SSS Boutique",
    careInstructions: "Dry clean only",
    featured: true,
    active: true,
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop", isPrimary: true },
      { imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800&auto=format&fit=crop", isPrimary: false },
      { imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop", isPrimary: false },
    ],
    variants: [
      { size: "XS", stock: 5 },
      { size: "S", stock: 10 },
      { size: "M", stock: 5 },
      { size: "L", stock: 3 },
    ],
  },
  {
    id: "prod_2",
    categoryId: "cat_2",
    productName: "Seraphina Cashmere Coat",
    slug: "seraphina-cashmere-coat",
    description: "Elegance meets absolute comfort. The Seraphina wrap coat is hand-stitched from ultra-soft double-faced cashmere wool. Designed with dropped shoulders and an oversized belt to cinch the waist.",
    shortDescription: "Hand-stitched wrap coat in double-faced cashmere.",
    price: 850,
    sku: "SERA-CASH-CO-02",
    material: "90% Cashmere, 10% Virgin Wool",
    brand: "SSS Boutique",
    careInstructions: "Dry clean only by leather/wool specialist",
    featured: true,
    active: true,
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop", isPrimary: true },
      { imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop", isPrimary: false },
    ],
    variants: [
      { size: "S", stock: 3 },
      { size: "M", stock: 5 },
      { size: "L", stock: 2 },
    ],
  },
  {
    id: "prod_3",
    categoryId: "cat_3",
    productName: "Monarch Leather Tote",
    slug: "monarch-leather-tote",
    description: "Structured to perfection, the Monarch Tote is crafted in Florence, Italy from vegetable-tanned calf leather. It features a spacious raw suede interior, dual top handles, and a gold-embossed logo.",
    shortDescription: "Genuine Italian calf leather shopper tote.",
    price: 420,
    discountPrice: 500,
    sku: "MONA-TOTE-BG-03",
    material: "100% Genuine Italian Calf Leather",
    brand: "SSS Boutique",
    careInstructions: "Avoid prolonged exposure to moisture and direct light. Store in dustbag.",
    featured: false,
    active: true,
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop", isPrimary: true },
      { imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop", isPrimary: false },
    ],
    variants: [
      { size: "One Size", stock: 12 },
    ],
  },
];

interface MockSchema {
  categories: Category[];
  products: Omit<Product, "images" | "variants">[];
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  orders: Order[];
  users: UserProfile[];
  activity_logs: ActivityLog[];
  notifications: Notification[];
  addresses: Address[];
  shipments: Shipment[];
}

const initMockDb = (): MockSchema => {
  if (!fs.existsSync(MOCK_DB_DIR)) {
    fs.mkdirSync(MOCK_DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(MOCK_DB_PATH)) {
    const productsList: Omit<Product, "images" | "variants">[] = [];
    const imagesList: ProductImage[] = [];
    const variantsList: ProductVariant[] = [];

    SEED_FLAT_PRODUCTS.forEach((flat) => {
      const cumulativeStock = flat.variants.reduce((sum, v) => sum + v.stock, 0);
      
      productsList.push({
        id: flat.id,
        categoryId: flat.categoryId,
        productName: flat.productName,
        name: flat.productName, // alias
        slug: flat.slug,
        description: flat.description,
        shortDescription: flat.shortDescription,
        price: flat.price,
        discountPrice: flat.discountPrice,
        compareAtPrice: flat.discountPrice, // alias
        stock: cumulativeStock,
        inventory: cumulativeStock, // alias
        sku: flat.sku,
        metadata: {
          material: flat.material,
          care: flat.careInstructions,
          sizes: flat.variants.map((v) => v.size),
          colors: [],
        },
        material: flat.material,
        brand: flat.brand,
        careInstructions: flat.careInstructions,
        care: flat.careInstructions, // alias
        featured: flat.featured,
        active: flat.active,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      flat.images.forEach((img, i) => {
        imagesList.push({
          id: `img_${flat.id}_${i}`,
          productId: flat.id,
          imageUrl: img.imageUrl,
          displayOrder: i,
          isPrimary: img.isPrimary,
        });
      });

      flat.variants.forEach((v, i) => {
        variantsList.push({
          id: `var_${flat.id}_${i}`,
          productId: flat.id,
          size: v.size,
          stock: v.stock,
          sku: `${flat.sku}-${v.size.toUpperCase()}`,
        });
      });
    });

    const initialData: MockSchema = {
      categories: SEED_CATEGORIES,
      products: productsList,
      product_images: imagesList,
      product_variants: variantsList,
      orders: [],
      users: [
        {
          id: "admin_1",
          email: "admin@sssboutique.com",
          fullName: "Boutique Owner",
          role: "admin",
          createdAt: new Date().toISOString(),
        },
      ],
      activity_logs: [
        {
          id: "log_1",
          userId: "admin_1",
          action: "Imported CSV",
          details: "Seeded initial luxury products catalog",
          createdAt: new Date().toISOString(),
        },
      ],
      notifications: [],
      addresses: [],
      shipments: [],
    };

    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(initialData, null, 2), "utf8");
    return initialData;
  }

  try {
    const raw = fs.readFileSync(MOCK_DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading local DB:", err);
    return {
      categories: [],
      products: [],
      product_images: [],
      product_variants: [],
      orders: [],
      users: [],
      activity_logs: [],
      notifications: [],
      addresses: [],
      shipments: [],
    };
  }
};

const writeMockDb = (data: MockSchema) => {
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), "utf8");
};

export const dbService = {
  // --- AUDIT LOGGER ---
  async logActivity(userId: string, action: string, details?: string, ip?: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      // Try using ip_address, if there's any schema mismatch we log it inside details text
      try {
        await supabase.from("activity_logs").insert({
          user_id: userId,
          action,
          details: ip ? `${details} [IP: ${ip}]` : details,
        });
      } catch (e) {
        await supabase.from("activity_logs").insert({
          user_id: userId,
          action,
          details,
        });
      }
    } else {
      const db = initMockDb();
      db.activity_logs.push({
        id: `log_${Date.now()}`,
        userId,
        action,
        details,
        ip: ip || "127.0.0.1",
        createdAt: new Date().toISOString(),
      });
      writeMockDb(db);
    }
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false });
      return (data || []).map((l: any) => ({
        id: l.id,
        userId: l.user_id,
        action: l.action,
        details: l.details,
        createdAt: l.created_at,
      }));
    } else {
      const db = initMockDb();
      return [...db.activity_logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        bannerImage: c.banner_image,
        imageUrl: c.banner_image, // alias
        isFeatured: c.is_featured,
        active: c.active !== undefined ? c.active : true,
        displayOrder: c.display_order || 0,
        metaTitle: c.meta_title || undefined,
        metaDescription: c.meta_description || undefined,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
    } else {
      const db = initMockDb();
      return db.categories.map((c) => ({
        ...c,
        imageUrl: c.bannerImage, // alias
        active: c.active !== undefined ? c.active : true,
      }));
    }
  },

  async createCategory(category: Omit<Category, "id" | "createdAt" | "updatedAt" | "imageUrl">): Promise<Category> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("categories")
        .insert([{
          name: category.name,
          slug: category.slug,
          description: category.description,
          banner_image: category.bannerImage,
          is_featured: category.isFeatured,
          active: category.active !== undefined ? category.active : true,
          display_order: category.displayOrder !== undefined ? category.displayOrder : 0,
          meta_title: category.metaTitle || null,
          meta_description: category.metaDescription || null,
        }])
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        bannerImage: data.banner_image,
        imageUrl: data.banner_image, // alias
        isFeatured: data.is_featured,
        active: data.active,
        displayOrder: data.display_order,
        metaTitle: data.meta_title || undefined,
        metaDescription: data.meta_description || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } else {
      const db = initMockDb();
      const newCategory: Category = {
        ...category,
        id: `cat_${Date.now()}`,
        imageUrl: category.bannerImage, // alias
        active: category.active !== undefined ? category.active : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.categories.push(newCategory);
      writeMockDb(db);
      return newCategory;
    }
  },

  async updateCategory(
    id: string,
    updates: Partial<Omit<Category, "id" | "createdAt" | "updatedAt" | "imageUrl">>
  ): Promise<Category> {
    if (isSupabaseConfigured() && supabase) {
      const mapped: any = {};
      if (updates.name !== undefined) mapped.name = updates.name;
      if (updates.slug !== undefined) mapped.slug = updates.slug;
      if (updates.description !== undefined) mapped.description = updates.description;
      if (updates.bannerImage !== undefined) mapped.banner_image = updates.bannerImage;
      if (updates.isFeatured !== undefined) mapped.is_featured = updates.isFeatured;
      if (updates.active !== undefined) mapped.active = updates.active;
      if (updates.displayOrder !== undefined) mapped.display_order = updates.displayOrder;
      if (updates.metaTitle !== undefined) mapped.meta_title = updates.metaTitle;
      if (updates.metaDescription !== undefined) mapped.meta_description = updates.metaDescription;

      const { data, error } = await supabase
        .from("categories")
        .update(mapped)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        bannerImage: data.banner_image,
        imageUrl: data.banner_image, // alias
        isFeatured: data.is_featured,
        active: data.active,
        metaTitle: data.meta_title || undefined,
        metaDescription: data.meta_description || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } else {
      const db = initMockDb();
      const idx = db.categories.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Category not found");

      const existing = db.categories[idx];
      const updated: Category = {
        ...existing,
        ...updates,
        imageUrl: updates.bannerImage !== undefined ? updates.bannerImage : existing.bannerImage,
        updatedAt: new Date().toISOString(),
      };

      db.categories[idx] = updated;
      writeMockDb(db);
      return updated;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    } else {
      const db = initMockDb();
      db.categories = db.categories.filter((c) => c.id !== id);
      writeMockDb(db);
    }
  },

  // --- PRODUCTS ---
  async getProducts(includeInactive = false): Promise<Product[]> {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from("products").select("*, product_images(*), product_variants(*)");
      if (!includeInactive) {
        query = query.eq("active", true);
      }
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map((p: any) => ({
        id: p.id,
        categoryId: p.category_id,
        productName: p.product_name,
        name: p.product_name, // alias
        slug: p.slug,
        description: p.description,
        shortDescription: p.short_description,
        price: Number(p.price),
        discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
        compareAtPrice: p.discount_price ? Number(p.discount_price) : undefined, // alias
        stock: p.stock,
        inventory: p.stock, // alias
        sku: p.sku,
        metadata: {
          material: p.material,
          care: p.care_instructions,
          sizes: (p.product_variants || []).map((v: any) => v.size),
          colors: [],
        },
        material: p.material,
        brand: p.brand,
        careInstructions: p.care_instructions,
        care: p.care_instructions, // alias
        featured: p.featured,
        active: p.active,
        metaTitle: p.meta_title || undefined,
        metaDescription: p.meta_description || undefined,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        images: (p.product_images || []).map((img: any) => ({
          id: img.id,
          productId: img.product_id,
          imageUrl: img.image_url,
          displayOrder: img.display_order,
          altText: img.alt_text,
          isPrimary: img.is_primary,
        })),
        variants: (p.product_variants || []).map((v: any) => ({
          id: v.id,
          productId: v.product_id,
          size: v.size,
          stock: v.stock,
          sku: v.sku,
        })),
      }));
    } else {
      const db = initMockDb();
      const rawProducts = includeInactive ? db.products : db.products.filter((p) => p.active);
      
      return rawProducts.map((p) => {
        const images = db.product_images
          .filter((img) => img.productId === p.id)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        const variants = db.product_variants.filter((v) => v.productId === p.id);
        
        return {
          ...p,
          name: p.productName, // alias
          compareAtPrice: p.discountPrice, // alias
          care: p.careInstructions, // alias
          inventory: p.stock, // alias
          metadata: {
            material: p.material,
            care: p.careInstructions,
            sizes: variants.map((v) => v.size),
            colors: [],
          },
          metaTitle: (p as any).metaTitle || p.productName,
          metaDescription: (p as any).metaDescription || p.description,
          images,
          variants,
        } as Product;
      });
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*), product_variants(*)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        categoryId: data.category_id,
        productName: data.product_name,
        name: data.product_name, // alias
        slug: data.slug,
        description: data.description,
        shortDescription: data.short_description,
        price: Number(data.price),
        discountPrice: data.discount_price ? Number(data.discount_price) : undefined,
        compareAtPrice: data.discount_price ? Number(data.discount_price) : undefined, // alias
        stock: data.stock,
        inventory: data.stock, // alias
        sku: data.sku,
        metadata: {
          material: data.material,
          care: data.care_instructions,
          sizes: (data.product_variants || []).map((v: any) => v.size),
          colors: [],
        },
        material: data.material,
        brand: data.brand,
        careInstructions: data.care_instructions,
        care: data.care_instructions, // alias
        featured: data.featured,
        active: data.active,
        metaTitle: data.meta_title || undefined,
        metaDescription: data.meta_description || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        images: (data.product_images || []).map((img: any) => ({
          id: img.id,
          productId: img.product_id,
          imageUrl: img.image_url,
          displayOrder: img.display_order,
          altText: img.alt_text,
          isPrimary: img.is_primary,
        })),
        variants: (data.product_variants || []).map((v: any) => ({
          id: v.id,
          productId: v.product_id,
          size: v.size,
          stock: v.stock,
          sku: v.sku,
        })),
      };
    } else {
      const db = initMockDb();
      const p = db.products.find((prod) => prod.slug === slug);
      if (!p) return null;

      const images = db.product_images.filter((img) => img.productId === p.id).sort((a, b) => a.displayOrder - b.displayOrder);
      const variants = db.product_variants.filter((v) => v.productId === p.id);

      return {
        ...p,
        name: p.productName, // alias
        compareAtPrice: p.discountPrice, // alias
        care: p.careInstructions, // alias
        inventory: p.stock, // alias
        metadata: {
          material: p.material,
          care: p.careInstructions,
          sizes: variants.map((v) => v.size),
          colors: [],
        },
        images,
        variants,
      } as Product;
    }
  },

  async createProduct(
    product: Omit<Product, "id" | "createdAt" | "updatedAt" | "images" | "variants" | "stock" | "name" | "compareAtPrice" | "care" | "inventory"> & {
      images: Omit<ProductImage, "id" | "productId">[];
      variants: Omit<ProductVariant, "id" | "productId">[];
    }
  ): Promise<Product> {
    const cumulativeStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

    if (isSupabaseConfigured() && supabase) {
      const { data: pData, error: pErr } = await supabase
        .from("products")
        .insert([{
          category_id: product.categoryId,
          product_name: product.productName,
          slug: product.slug,
          description: product.description,
          short_description: product.shortDescription,
          price: product.price,
          discount_price: product.discountPrice,
          stock: cumulativeStock,
          sku: product.sku,
          material: product.material,
          brand: product.brand,
          care_instructions: product.careInstructions,
          featured: product.featured,
          active: product.active,
          meta_title: product.metaTitle || null,
          meta_description: product.metaDescription || null,
        }])
        .select()
        .single();
      
      if (pErr) throw pErr;

      const imagesToInsert = product.images.map((img) => ({
        product_id: pData.id,
        image_url: img.imageUrl,
        display_order: img.displayOrder,
        is_primary: img.isPrimary,
        alt_text: img.altText || product.productName,
      }));

      const { data: imgsData, error: imgsErr } = await supabase
        .from("product_images")
        .insert(imagesToInsert)
        .select();
      if (imgsErr) throw imgsErr;

      const variantsToInsert = product.variants.map((v) => ({
        product_id: pData.id,
        size: v.size,
        stock: v.stock,
        sku: v.sku || `${product.sku}-${v.size.toUpperCase()}`,
      }));

      const { data: varsData, error: varsErr } = await supabase
        .from("product_variants")
        .insert(variantsToInsert)
        .select();
      if (varsErr) throw varsErr;

      await this.logActivity("admin_1", "Added Product", `SKU: ${product.sku} Name: ${product.productName}`);

      return {
        ...pData,
        categoryId: pData.category_id,
        productName: pData.product_name,
        name: pData.product_name, // alias
        discountPrice: pData.discount_price,
        compareAtPrice: pData.discount_price, // alias
        inventory: pData.stock, // alias
        careInstructions: pData.care_instructions,
        metaTitle: pData.meta_title || undefined,
        metaDescription: pData.meta_description || undefined,
        metadata: {
          material: pData.material,
          care: pData.care_instructions,
          sizes: varsData.map((v: any) => v.size),
          colors: [],
        },
        care: pData.care_instructions, // alias
        images: imgsData.map((img: any) => ({
          id: img.id,
          productId: img.product_id,
          imageUrl: img.image_url,
          displayOrder: img.display_order,
          isPrimary: img.is_primary,
          altText: img.alt_text,
        })),
        variants: varsData.map((v: any) => ({
          id: v.id,
          productId: v.product_id,
          size: v.size,
          stock: v.stock,
          sku: v.sku,
        })),
      };
    } else {
      const db = initMockDb();
      const newProdId = `prod_${Date.now()}`;
      
      const newProductRow = {
        id: newProdId,
        categoryId: product.categoryId,
        productName: product.productName,
        name: product.productName, // alias
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        discountPrice: product.discountPrice,
        compareAtPrice: product.discountPrice, // alias
        stock: cumulativeStock,
        inventory: cumulativeStock, // alias
        sku: product.sku,
        metadata: {
          material: product.material,
          care: product.careInstructions,
          sizes: product.variants.map((v) => v.size),
          colors: [],
        },
        material: product.material,
        brand: product.brand || "SSS Boutique",
        careInstructions: product.careInstructions,
        care: product.careInstructions, // alias
        featured: product.featured,
        active: product.active,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newImages: ProductImage[] = product.images.map((img, i) => ({
        id: `img_${newProdId}_${i}`,
        productId: newProdId,
        imageUrl: img.imageUrl,
        displayOrder: img.displayOrder,
        isPrimary: img.isPrimary,
        altText: img.altText || product.productName,
      }));

      const newVariants: ProductVariant[] = product.variants.map((v, i) => ({
        id: `var_${newProdId}_${i}`,
        productId: newProdId,
        size: v.size,
        stock: v.stock,
        sku: v.sku || `${product.sku}-${v.size.toUpperCase()}`,
      }));

      db.products.push(newProductRow);
      db.product_images.push(...newImages);
      db.product_variants.push(...newVariants);
      
      writeMockDb(db);
      await this.logActivity("admin_1", "Added Product", `SKU: ${product.sku} Name: ${product.productName}`);

      return {
        ...newProductRow,
        images: newImages,
        variants: newVariants,
      } as Product;
    }
  },

  async updateProduct(
    id: string,
    updates: Partial<Omit<Product, "images" | "variants" | "name" | "compareAtPrice" | "care" | "inventory">> & {
      images?: Omit<ProductImage, "id" | "productId">[];
      variants?: Omit<ProductVariant, "id" | "productId">[];
    }
  ): Promise<Product> {
    if (isSupabaseConfigured() && supabase) {
      const mapped: any = {};
      if (updates.categoryId !== undefined) mapped.category_id = updates.categoryId;
      if (updates.productName !== undefined) mapped.product_name = updates.productName;
      if (updates.slug !== undefined) mapped.slug = updates.slug;
      if (updates.description !== undefined) mapped.description = updates.description;
      if (updates.shortDescription !== undefined) mapped.short_description = updates.shortDescription;
      if (updates.price !== undefined) mapped.price = updates.price;
      if (updates.discountPrice !== undefined) mapped.discount_price = updates.discountPrice;
      if (updates.sku !== undefined) mapped.sku = updates.sku;
      if (updates.material !== undefined) mapped.material = updates.material;
      if (updates.brand !== undefined) mapped.brand = updates.brand;
      if (updates.careInstructions !== undefined) mapped.care_instructions = updates.careInstructions;
      if (updates.featured !== undefined) mapped.featured = updates.featured;
      if (updates.active !== undefined) mapped.active = updates.active;
      if (updates.metaTitle !== undefined) mapped.meta_title = updates.metaTitle;
      if (updates.metaDescription !== undefined) mapped.meta_description = updates.metaDescription;

      if (updates.variants) {
        mapped.stock = updates.variants.reduce((sum, v) => sum + v.stock, 0);
      }

      const { data: pData, error: pErr } = await supabase
        .from("products")
        .update(mapped)
        .eq("id", id)
        .select()
        .single();
      if (pErr) throw pErr;

      if (updates.images) {
        await supabase.from("product_images").delete().eq("product_id", id);
        const imagesToInsert = updates.images.map((img) => ({
          product_id: id,
          image_url: img.imageUrl,
          display_order: img.displayOrder,
          is_primary: img.isPrimary,
          alt_text: img.altText || pData.product_name,
        }));
        await supabase.from("product_images").insert(imagesToInsert);
      }

      if (updates.variants) {
        await supabase.from("product_variants").delete().eq("product_id", id);
        const skuRoot = updates.sku || pData.sku;
        const variantsToInsert = updates.variants.map((v) => ({
          product_id: id,
          size: v.size,
          stock: v.stock,
          sku: v.sku || `${skuRoot}-${v.size.toUpperCase()}`,
        }));
        await supabase.from("product_variants").insert(variantsToInsert);
      }

      const updatedProd = await this.getProductBySlug(pData.slug);
      if (!updatedProd) throw new Error("Update synchronization failed");

      await this.logActivity("admin_1", "Edited Product", `SKU: ${updatedProd.sku} Name: ${updatedProd.productName}`);
      return updatedProd;
    } else {
      const db = initMockDb();
      const idx = db.products.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Product not found");

      const existingProduct = db.products[idx];
      
      const variantsToSave = updates.variants
        ? updates.variants.map((v, i) => ({
            id: `var_${id}_${i}_${Date.now()}`,
            productId: id,
            size: v.size,
            stock: v.stock,
            sku: v.sku || `${updates.sku || existingProduct.sku}-${v.size.toUpperCase()}`,
          }))
        : db.product_variants.filter((v) => v.productId === id);

      const cumulativeStock = variantsToSave.reduce((sum, v) => sum + v.stock, 0);

      const updatedProductRow = {
        ...existingProduct,
        categoryId: updates.categoryId !== undefined ? updates.categoryId : existingProduct.categoryId,
        productName: updates.productName !== undefined ? updates.productName : existingProduct.productName,
        name: updates.productName !== undefined ? updates.productName : existingProduct.productName, // alias
        slug: updates.slug !== undefined ? updates.slug : existingProduct.slug,
        description: updates.description !== undefined ? updates.description : existingProduct.description,
        shortDescription: updates.shortDescription !== undefined ? updates.shortDescription : existingProduct.shortDescription,
        price: updates.price !== undefined ? Number(updates.price) : existingProduct.price,
        discountPrice: updates.discountPrice !== undefined ? Number(updates.discountPrice) : existingProduct.discountPrice,
        compareAtPrice: updates.discountPrice !== undefined ? Number(updates.discountPrice) : existingProduct.discountPrice, // alias
        stock: cumulativeStock,
        inventory: cumulativeStock, // alias
        sku: updates.sku !== undefined ? updates.sku : existingProduct.sku,
        metadata: {
          material: updates.material !== undefined ? updates.material : existingProduct.material,
          care: updates.careInstructions !== undefined ? updates.careInstructions : existingProduct.careInstructions,
          sizes: variantsToSave.map((v) => v.size),
          colors: [],
        },
        material: updates.material !== undefined ? updates.material : existingProduct.material,
        brand: updates.brand !== undefined ? updates.brand : existingProduct.brand,
        careInstructions: updates.careInstructions !== undefined ? updates.careInstructions : existingProduct.careInstructions,
        care: updates.careInstructions !== undefined ? updates.careInstructions : existingProduct.careInstructions, // alias
        featured: updates.featured !== undefined ? updates.featured : existingProduct.featured,
        active: updates.active !== undefined ? updates.active : existingProduct.active,
        updatedAt: new Date().toISOString(),
      };

      db.products[idx] = updatedProductRow;

      if (updates.images) {
        db.product_images = db.product_images.filter((img) => img.productId !== id);
        const newImages: ProductImage[] = updates.images.map((img, i) => ({
          id: `img_${id}_${i}_${Date.now()}`,
          productId: id,
          imageUrl: img.imageUrl,
          displayOrder: img.displayOrder,
          isPrimary: img.isPrimary,
          altText: img.altText || updatedProductRow.productName,
        }));
        db.product_images.push(...newImages);
      }

      if (updates.variants) {
        db.product_variants = db.product_variants.filter((v) => v.productId !== id);
        db.product_variants.push(...variantsToSave);
      }

      writeMockDb(db);
      await this.logActivity("admin_1", "Edited Product", `SKU: ${updatedProductRow.sku} Name: ${updatedProductRow.productName}`);

      return {
        ...updatedProductRow,
        images: db.product_images.filter((img) => img.productId === id),
        variants: db.product_variants.filter((v) => v.productId === id),
      } as Product;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    const targetProd = await this.getProductBySlug(id);
    const searchId = targetProd ? targetProd.id : id;
    const skuLabel = targetProd ? targetProd.sku : "Unknown";

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from("products").delete().eq("id", searchId);
      if (error) throw error;
      
      await this.logActivity("admin_1", "Deleted Product", `SKU: ${skuLabel}`);
      return true;
    } else {
      const db = initMockDb();
      const initialLength = db.products.length;
      
      db.products = db.products.filter((p) => p.id !== searchId);
      db.product_images = db.product_images.filter((img) => img.productId !== searchId);
      db.product_variants = db.product_variants.filter((v) => v.productId !== searchId);
      
      writeMockDb(db);
      await this.logActivity("admin_1", "Deleted Product", `SKU: ${skuLabel}`);
      return db.products.length < initialLength;
    }
  },

  // --- ORDERS ---
  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      return (data || []).map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        userId: o.user_id,
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        subtotal: Number(o.subtotal),
        discount: Number(o.discount),
        shipping: Number(o.shipping),
        tax: Number(o.tax),
        grandTotal: Number(o.grand_total),
        paymentStatus: o.payment_status,
        orderStatus: o.order_status,
        shippingAddress: o.shipping_address,
        trackingNumber: o.tracking_number,
        orderNotes: o.order_notes || undefined,
        createdAt: o.created_at,
        statusHistory: o.status_history || [],
        items: (o.order_items || []).map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          productName: item.product_name,
          productImage: item.product_image,
          variantId: item.variant_id,
          variantSize: item.variant_size,
          quantity: item.quantity,
          price: Number(item.price),
        })),
      }));
    } else {
      const db = initMockDb();
      return [...db.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  async createOrder(order: Omit<Order, "id" | "createdAt" | "orderNumber" | "paymentStatus" | "orderStatus">): Promise<Order> {
    const orderNumber = `SSS-ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const initialHistory = [{
      status: "Pending Payment",
      timestamp: new Date().toISOString(),
      user: "customer",
      action: "Placed order",
    }];

    if (isSupabaseConfigured() && supabase) {
      // 1. Stock Checks to prevent negative inventory
      for (const item of order.items) {
        if (item.variantId) {
          const { data: vData } = await supabase
            .from("product_variants")
            .select("stock")
            .eq("id", item.variantId)
            .single();
          if (!vData || vData.stock < item.quantity) {
            throw new Error(`Insufficient stock for product variant.`);
          }
        }
      }

      const { data: oData, error: oErr } = await supabase
        .from("orders")
        .insert([{
          order_number: orderNumber,
          user_id: order.userId,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          subtotal: order.subtotal,
          discount: order.discount,
          shipping: order.shipping,
          tax: order.tax,
          grand_total: order.grandTotal,
          payment_status: "pending",
          order_status: "pending",
          shipping_address: order.shippingAddress,
          tracking_number: order.trackingNumber,
          order_notes: order.orderNotes || null,
          status_history: initialHistory,
        }])
        .select()
        .single();
      
      if (oErr) throw oErr;

      const itemsToInsert = order.items.map((item) => ({
        order_id: oData.id,
        product_id: item.productId,
        product_name: item.productName,
        product_image: item.productImage,
        variant_id: item.variantId,
        variant_size: item.variantSize,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsErr } = await supabase.from("order_items").insert(itemsToInsert);
      if (itemsErr) throw itemsErr;

      // Decrement stock & check low stock
      for (const item of order.items) {
        if (item.variantId) {
          const { data: currentVariant } = await supabase
            .from("product_variants")
            .select("stock, sku")
            .eq("id", item.variantId)
            .single();
          if (currentVariant) {
            const newVarStock = Math.max(0, currentVariant.stock - item.quantity);
            await supabase.from("product_variants").update({ stock: newVarStock }).eq("id", item.variantId);
            
            if (newVarStock < 5) {
              await this.createNotification(
                "low_stock",
                "Low Stock Alert",
                `Variant ${currentVariant.sku} stock level is low: ${newVarStock} remaining.`
              );
            }
          }
        }
        
        const { data: allVars } = await supabase
          .from("product_variants")
          .select("stock")
          .eq("product_id", item.productId);
        if (allVars) {
          const newCumStock = allVars.reduce((sum, v) => sum + v.stock, 0);
          await supabase.from("products").update({ stock: newCumStock }).eq("id", item.productId);
        }
      }

      await this.logActivity(order.userId || "guest", "Customer placed order", `Order Number: ${orderNumber}`, "127.0.0.1");

      await this.createNotification(
        "new_order",
        "New Order Placed",
        `Order ${orderNumber} placed by ${order.customerName} for a total of $${order.grandTotal}.`
      );

      return {
        ...order,
        id: oData.id,
        orderNumber,
        paymentStatus: "pending",
        orderStatus: "pending",
        orderNotes: oData.order_notes || undefined,
        createdAt: oData.created_at,
        statusHistory: initialHistory,
      };
    } else {
      const db = initMockDb();
      
      // 1. Stock Checks
      for (const item of order.items) {
        const vRec = db.product_variants.find(
          (v) => v.productId === item.productId && v.size === item.variantSize
        );
        if (!vRec || vRec.stock < item.quantity) {
          throw new Error(`Insufficient stock for product variant.`);
        }
      }

      const newOrderId = `ord_${Date.now()}`;
      const newOrder: Order = {
        ...order,
        id: newOrderId,
        orderNumber,
        paymentStatus: "pending",
        orderStatus: "pending",
        createdAt: new Date().toISOString(),
        statusHistory: initialHistory,
        items: order.items.map((item, index) => ({
          ...item,
          id: `ord_item_${Date.now()}_${index}`,
          orderId: newOrderId,
        })),
      };

      // Decrement stock
      order.items.forEach((item) => {
        const vRec = db.product_variants.find(
          (v) => v.productId === item.productId && v.size === item.variantSize
        );
        if (vRec) {
          vRec.stock = Math.max(0, vRec.stock - item.quantity);
          if (vRec.stock < 5) {
            db.notifications.push({
              id: `notif_${Date.now()}_${Math.random()}`,
              type: "low_stock",
              title: "Low Stock Alert",
              message: `Variant ${vRec.sku} stock level is low: ${vRec.stock} remaining.`,
              read: false,
              createdAt: new Date().toISOString(),
            });
          }
        }

        const prod = db.products.find((p) => p.id === item.productId);
        if (prod) {
          const prodVariants = db.product_variants.filter((v) => v.productId === item.productId);
          prod.stock = prodVariants.reduce((sum, v) => sum + v.stock, 0);
        }
      });

      db.orders.push(newOrder);

      db.notifications.push({
        id: `notif_${Date.now()}`,
        type: "new_order",
        title: "New Order Placed",
        message: `Order ${orderNumber} placed by ${order.customerName} for a total of $${order.grandTotal}.`,
        read: false,
        createdAt: new Date().toISOString(),
      });

      db.activity_logs.push({
        id: `log_${Date.now()}`,
        userId: order.userId || "guest",
        action: "Customer placed order",
        details: `Order Number: ${orderNumber}`,
        ip: "127.0.0.1",
        createdAt: new Date().toISOString(),
      });

      writeMockDb(db);
      return newOrder;
    }
  },

  async updateOrderStatus(id: string, status: string, trackingNumber?: string, executor: string = "admin"): Promise<Order> {
    if (isSupabaseConfigured() && supabase) {
      const { data: currentOrder, error: fetchErr } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .single();
      if (fetchErr) throw fetchErr;

      const previousStatus = currentOrder.order_status;
      const history = currentOrder.status_history || [];
      const newEvent = {
        status,
        timestamp: new Date().toISOString(),
        user: executor,
        action: `Updated status to ${status}`,
      };
      const updatedHistory = [...history, newEvent];

      const isCancellation = status.toLowerCase() === "cancelled" || status.toLowerCase() === "returned" || status.toLowerCase() === "refunded";
      const wasCancelled = previousStatus === "cancelled";

      if (isCancellation && !wasCancelled) {
        for (const item of currentOrder.order_items || []) {
          if (item.variant_id) {
            const { data: vData } = await supabase
              .from("product_variants")
              .select("stock")
              .eq("id", item.variant_id)
              .single();
            if (vData) {
              const restoredStock = vData.stock + item.quantity;
              await supabase.from("product_variants").update({ stock: restoredStock }).eq("id", item.variant_id);
            }
          }
          const { data: allVars } = await supabase
            .from("product_variants")
            .select("stock")
            .eq("product_id", item.product_id);
          if (allVars) {
            const newCumStock = allVars.reduce((sum, v) => sum + v.stock, 0);
            await supabase.from("products").update({ stock: newCumStock }).eq("id", item.product_id);
          }
        }

        await this.createNotification(
          "order_cancelled",
          "Order Cancelled",
          `Order ${currentOrder.order_number} has been cancelled.`
        );

        await this.logActivity(executor, "Order cancelled", `Order: ${currentOrder.order_number}`, "127.0.0.1");
      }

      let mappedOrderStatus = "pending";
      let mappedPaymentStatus = currentOrder.payment_status;

      if (status === "Order Confirmed" || status === "Processing") {
        mappedOrderStatus = "confirmed";
        mappedPaymentStatus = "paid";
      } else if (status === "Packed" || status === "Ready For Shipment") {
        mappedOrderStatus = "packed";
        mappedPaymentStatus = "paid";
      } else if (status === "Shipped") {
        mappedOrderStatus = "shipped";
        mappedPaymentStatus = "paid";
      } else if (status === "Delivered") {
        mappedOrderStatus = "delivered";
        mappedPaymentStatus = "paid";
      } else if (status === "Cancelled") {
        mappedOrderStatus = "cancelled";
      } else if (status === "Returned" || status === "Refunded") {
        mappedOrderStatus = "cancelled";
        mappedPaymentStatus = "refunded";
      }

      const payload: any = {
        order_status: mappedOrderStatus,
        payment_status: mappedPaymentStatus,
        status_history: updatedHistory
      };
      if (trackingNumber !== undefined) payload.tracking_number = trackingNumber;

      const { data, error } = await supabase
        .from("orders")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      return {
        id: data.id,
        orderNumber: data.order_number,
        userId: data.user_id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        subtotal: Number(data.subtotal),
        discount: Number(data.discount),
        shipping: Number(data.shipping),
        tax: Number(data.tax),
        grandTotal: Number(data.grand_total),
        paymentStatus: data.payment_status,
        orderStatus: status,
        shippingAddress: data.shipping_address,
        trackingNumber: data.tracking_number,
        createdAt: data.created_at,
        statusHistory: updatedHistory,
        items: (currentOrder.order_items || []).map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          productName: item.product_name,
          productImage: item.product_image,
          variantId: item.variant_id,
          variantSize: item.variant_size,
          quantity: item.quantity,
          price: Number(item.price),
        })),
      };
    } else {
      const db = initMockDb();
      const idx = db.orders.findIndex((o) => o.id === id);
      if (idx === -1) throw new Error("Order not found");
      
      const currentOrder = db.orders[idx];
      const previousStatus = currentOrder.orderStatus;
      const history = currentOrder.statusHistory || [];
      const newEvent = {
        status,
        timestamp: new Date().toISOString(),
        user: executor,
        action: `Updated status to ${status}`,
      };
      const updatedHistory = [...history, newEvent];

      const isCancellation = status.toLowerCase() === "cancelled" || status.toLowerCase() === "returned" || status.toLowerCase() === "refunded";
      const wasCancelled = previousStatus.toLowerCase() === "cancelled" || previousStatus.toLowerCase() === "returned" || previousStatus.toLowerCase() === "refunded";

      if (isCancellation && !wasCancelled) {
        currentOrder.items.forEach((item) => {
          const vRec = db.product_variants.find(
            (v) => v.productId === item.productId && v.size === item.variantSize
          );
          if (vRec) {
            vRec.stock = vRec.stock + item.quantity;
          }
          const prod = db.products.find((p) => p.id === item.productId);
          if (prod) {
            const prodVariants = db.product_variants.filter((v) => v.productId === item.productId);
            prod.stock = prodVariants.reduce((sum, v) => sum + v.stock, 0);
          }
        });

        db.notifications.push({
          id: `notif_${Date.now()}`,
          type: "order_cancelled",
          title: "Order Cancelled",
          message: `Order ${currentOrder.orderNumber} has been cancelled.`,
          read: false,
          createdAt: new Date().toISOString(),
        });

        db.activity_logs.push({
          id: `log_${Date.now()}`,
          userId: executor,
          action: "Order cancelled",
          details: `Order: ${currentOrder.orderNumber}`,
          ip: "127.0.0.1",
          createdAt: new Date().toISOString(),
        });
      }

      db.orders[idx].orderStatus = status;
      db.orders[idx].statusHistory = updatedHistory;
      if (trackingNumber !== undefined) db.orders[idx].trackingNumber = trackingNumber;
      if (status === "delivered") db.orders[idx].paymentStatus = "paid";

      writeMockDb(db);
      return db.orders[idx];
    }
  },

  // --- MOCK USERS ---
  async getMockUsers(): Promise<UserProfile[]> {
    const db = initMockDb();
    return db.users;
  },

  async createMockUser(user: Omit<UserProfile, "id" | "createdAt">): Promise<UserProfile> {
    const db = initMockDb();
    const newUser: UserProfile = {
      ...user,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeMockDb(db);
    return newUser;
  },

  // --- USER PROFILE & ADDRESS MANAGEMENT ---
  async updateProfile(userId: string, fullName: string, phone: string, avatarUrl?: string): Promise<UserProfile> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone,
          avatar: avatarUrl || null
        })
        .eq("id", userId)
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        phone: data.phone,
        avatar: data.avatar || undefined,
        role: data.role,
        createdAt: data.created_at
      };
    } else {
      const db = initMockDb();
      const idx = db.users.findIndex((u) => u.id === userId);
      if (idx === -1) throw new Error("User not found");
      db.users[idx].fullName = fullName;
      db.users[idx].phone = phone;
      if (avatarUrl) db.users[idx].avatar = avatarUrl;
      writeMockDb(db);
      return db.users[idx];
    }
  },

  async getAddresses(userId: string): Promise<Address[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false });
      if (error) throw error;
      return (data || []).map((a: any) => ({
        id: a.id,
        userId: a.user_id,
        name: a.name,
        phone: a.phone,
        address: a.address,
        city: a.city,
        state: a.state,
        country: a.country,
        pincode: a.pincode,
        isDefault: a.is_default
      }));
    } else {
      const db = initMockDb();
      return db.addresses.filter((a) => a.userId === userId);
    }
  },

  async createAddress(address: Omit<Address, "id">): Promise<Address> {
    if (isSupabaseConfigured() && supabase) {
      if (address.isDefault) {
        // Remove default from other addresses
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", address.userId);
      }
      const { data, error } = await supabase
        .from("addresses")
        .insert([{
          user_id: address.userId,
          name: address.name,
          phone: address.phone,
          address: address.address,
          city: address.city,
          state: address.state,
          country: address.country,
          pincode: address.pincode,
          is_default: address.isDefault
        }])
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        isDefault: data.is_default
      };
    } else {
      const db = initMockDb();
      if (address.isDefault) {
        db.addresses.forEach((a) => {
          if (a.userId === address.userId) a.isDefault = false;
        });
      }
      const newAddress: Address = {
        ...address,
        id: `addr_${Date.now()}`
      };
      db.addresses.push(newAddress);
      writeMockDb(db);
      return newAddress;
    }
  },

  async updateAddress(id: string, address: Omit<Address, "id" | "userId">): Promise<Address> {
    if (isSupabaseConfigured() && supabase) {
      const { data: current } = await supabase.from("addresses").select("user_id").eq("id", id).single();
      if (address.isDefault && current) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", current.user_id);
      }
      const { data, error } = await supabase
        .from("addresses")
        .update({
          name: address.name,
          phone: address.phone,
          address: address.address,
          city: address.city,
          state: address.state,
          country: address.country,
          pincode: address.pincode,
          is_default: address.isDefault
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        isDefault: data.is_default
      };
    } else {
      const db = initMockDb();
      const idx = db.addresses.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error("Address not found");
      const userId = db.addresses[idx].userId;
      if (address.isDefault) {
        db.addresses.forEach((a) => {
          if (a.userId === userId) a.isDefault = false;
        });
      }
      db.addresses[idx] = {
        ...db.addresses[idx],
        ...address
      };
      writeMockDb(db);
      return db.addresses[idx];
    }
  },

  async deleteAddress(id: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
      return true;
    } else {
      const db = initMockDb();
      const initialLength = db.addresses.length;
      db.addresses = db.addresses.filter((a) => a.id !== id || a.userId !== userId);
      writeMockDb(db);
      return db.addresses.length < initialLength;
    }
  },

  async setDefaultAddress(id: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
      const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id).eq("user_id", userId);
      if (error) throw error;
      return true;
    } else {
      const db = initMockDb();
      db.addresses.forEach((a) => {
        if (a.userId === userId) {
          a.isDefault = a.id === id;
        }
      });
      writeMockDb(db);
      return true;
    }
  },

  // --- NOTIFICATIONS INFRASTRUCTURE ---
  async getNotifications(): Promise<Notification[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      return (data || []).map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.created_at
      }));
    } else {
      const db = initMockDb();
      return [...db.notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  async createNotification(type: Notification["type"], title: string, message: string): Promise<Notification> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("notifications")
        .insert([{
          type,
          title,
          message,
          read: false
        }])
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        type: data.type,
        title: data.title,
        message: data.message,
        read: data.read,
        createdAt: data.created_at
      };
    } else {
      const db = initMockDb();
      const newNotif: Notification = {
        id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString()
      };
      db.notifications.push(newNotif);
      writeMockDb(db);
      return newNotif;
    }
  },

  async markNotificationAsRead(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);
      if (error) throw error;
      return true;
    } else {
      const db = initMockDb();
      const idx = db.notifications.findIndex((n) => n.id === id);
      if (idx !== -1) {
        db.notifications[idx].read = true;
        writeMockDb(db);
        return true;
      }
      return false;
    }
  },

  async getUnreadNotificationsCount(): Promise<number> {
    if (isSupabaseConfigured() && supabase) {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("read", false);
      return count || 0;
    } else {
      const db = initMockDb();
      return db.notifications.filter((n) => !n.read).length;
    }
  },

  // --- REPORTING & EXPORT ---
  async getExportData(type: "orders" | "customers" | "products"): Promise<string> {
    if (type === "orders") {
      const orders = await this.getOrders();
      const headers = ["Order ID", "Order Number", "Customer Name", "Customer Email", "Subtotal", "Grand Total", "Order Status", "Payment Status", "Created Date"];
      const rows = orders.map((o) => [
        o.id,
        o.orderNumber,
        o.customerName,
        o.customerEmail,
        o.subtotal,
        o.grandTotal,
        o.orderStatus,
        o.paymentStatus,
        o.createdAt
      ]);
      return [headers.join(","), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    } else if (type === "customers") {
      const db = initMockDb();
      // Combine mock and Supabase if needed, here we export profiles/users
      const users = isSupabaseConfigured() && supabase 
        ? (await supabase.from("profiles").select("*")).data || []
        : db.users;
      const headers = ["User ID", "Email", "Full Name", "Role", "Created At"];
      const rows = users.map((u: any) => [
        u.id,
        u.email,
        u.full_name || u.fullName,
        u.role,
        u.created_at || u.createdAt
      ]);
      return [headers.join(","), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    } else {
      const prods = await this.getProducts();
      const headers = ["Product ID", "SKU", "Product Name", "Price", "Stock", "Active", "Created Date"];
      const rows = prods.map((p) => [
        p.id,
        p.sku,
        p.productName || p.name,
        p.price,
        p.stock,
        p.active,
        p.createdAt
      ]);
      return [headers.join(","), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    }
  },

  // --- SHIPMENTS FULFILLMENT MANAGEMENT ---
  async getShipments(): Promise<Shipment[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("shipments")
        .select("*, orders(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((s: any) => ({
        id: s.id,
        orderId: s.order_id,
        orderNumber: s.orders?.order_number,
        customerName: s.orders?.customer_name,
        customerEmail: s.orders?.customer_email,
        shippingAddress: s.orders?.shipping_address,
        courierName: s.courier_name,
        trackingNumber: s.tracking_number,
        status: s.status,
        shippingDate: s.shipping_date,
        estimatedDeliveryDate: s.estimated_delivery_date,
        deliveredDate: s.delivered_date,
        notes: s.notes,
        timeline: s.timeline || [],
        createdAt: s.created_at,
        updatedAt: s.updated_at
      }));
    } else {
      const db = initMockDb();
      return db.shipments.map((s) => {
        const order = db.orders.find((o) => o.id === s.orderId);
        return {
          ...s,
          orderNumber: order?.orderNumber,
          customerName: order?.customerName,
          customerEmail: order?.customerEmail,
          shippingAddress: order?.shippingAddress
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  async getShipmentByOrderId(orderId: string): Promise<Shipment | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("shipments")
        .select("*, orders(*)")
        .eq("order_id", orderId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        orderId: data.order_id,
        orderNumber: data.orders?.order_number,
        customerName: data.orders?.customer_name,
        customerEmail: data.orders?.customer_email,
        shippingAddress: data.orders?.shipping_address,
        courierName: data.courier_name,
        trackingNumber: data.tracking_number,
        status: data.status,
        shippingDate: data.shipping_date,
        estimatedDeliveryDate: data.estimated_delivery_date,
        deliveredDate: data.delivered_date,
        notes: data.notes,
        timeline: data.timeline || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } else {
      const db = initMockDb();
      const s = db.shipments.find((x) => x.orderId === orderId);
      if (!s) return null;
      const order = db.orders.find((o) => o.id === s.orderId);
      return {
        ...s,
        orderNumber: order?.orderNumber,
        customerName: order?.customerName,
        customerEmail: order?.customerEmail,
        shippingAddress: order?.shippingAddress
      };
    }
  },

  async createShipment(shipment: Omit<Shipment, "id" | "createdAt" | "updatedAt" | "timeline">): Promise<Shipment> {
    const timestamp = new Date().toISOString();
    const initialTimeline = [{
      status: shipment.status,
      timestamp,
      action: `Shipment created via ${shipment.courierName} with tracking code ${shipment.trackingNumber}`,
      user: "admin"
    }];

    // Determine corresponding Order status mapping
    let orderStatusValue = "shipped";
    if (shipment.status === "Delivered") orderStatusValue = "delivered";
    else if (shipment.status === "Cancelled" || shipment.status === "Returned") orderStatusValue = "cancelled";
    else if (shipment.status === "Packed") orderStatusValue = "packed";

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("shipments")
        .insert([{
          order_id: shipment.orderId,
          courier_name: shipment.courierName,
          tracking_number: shipment.trackingNumber,
          status: shipment.status,
          shipping_date: shipment.shippingDate || timestamp,
          estimated_delivery_date: shipment.estimatedDeliveryDate || null,
          delivered_date: shipment.deliveredDate || null,
          notes: shipment.notes || null,
          timeline: initialTimeline
        }])
        .select()
        .single();
      if (error) throw error;

      // Update Order tracking and status history
      const { data: ord } = await supabase.from("orders").select("status_history").eq("id", shipment.orderId).single();
      const updatedHistory = [...(ord?.status_history || []), {
        status: orderStatusValue === "shipped" ? "Shipped" : (orderStatusValue === "delivered" ? "Delivered" : "Cancelled"),
        timestamp,
        user: "admin",
        action: `Shipment created. Carrier: ${shipment.courierName}, Tracking: ${shipment.trackingNumber}`
      }];

      await supabase
        .from("orders")
        .update({
          tracking_number: shipment.trackingNumber,
          order_status: orderStatusValue,
          status_history: updatedHistory
        })
        .eq("id", shipment.orderId);

      await this.createNotification(
        "new_order", // type placeholder matching Notification schema
        "Shipment Dispatched",
        `Order shipment created. Carrier: ${shipment.courierName}, Waybill: ${shipment.trackingNumber}`
      );

      await this.logActivity("admin", "Fulfillment shipment created", `Order ID: ${shipment.orderId}`, "127.0.0.1");

      return {
        id: data.id,
        orderId: data.order_id,
        courierName: data.courier_name,
        trackingNumber: data.tracking_number,
        status: data.status,
        shippingDate: data.shipping_date,
        estimatedDeliveryDate: data.estimated_delivery_date,
        deliveredDate: data.delivered_date,
        notes: data.notes,
        timeline: initialTimeline,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } else {
      const db = initMockDb();
      const newShipmentId = `shp_${Date.now()}`;
      const newShipment: Shipment = {
        ...shipment,
        id: newShipmentId,
        timeline: initialTimeline,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      db.shipments.push(newShipment);

      // Update mock order status
      const ordIdx = db.orders.findIndex((o) => o.id === shipment.orderId);
      if (ordIdx !== -1) {
        db.orders[ordIdx].trackingNumber = shipment.trackingNumber;
        db.orders[ordIdx].orderStatus = orderStatusValue === "shipped" ? "Shipped" : (orderStatusValue === "delivered" ? "Delivered" : "Cancelled");
        db.orders[ordIdx].statusHistory = [...(db.orders[ordIdx].statusHistory || []), {
          status: db.orders[ordIdx].orderStatus,
          timestamp,
          user: "admin",
          action: `Shipment created. Carrier: ${shipment.courierName}, Tracking: ${shipment.trackingNumber}`
        }];
      }

      db.notifications.push({
        id: `notif_${Date.now()}`,
        type: "inventory_updated",
        title: "Shipment Dispatched",
        message: `Order shipment created. Carrier: ${shipment.courierName}, Waybill: ${shipment.trackingNumber}`,
        read: false,
        createdAt: timestamp
      });

      db.activity_logs.push({
        id: `log_${Date.now()}`,
        userId: "admin",
        action: "Fulfillment shipment created",
        details: `Order ID: ${shipment.orderId}`,
        ip: "127.0.0.1",
        createdAt: timestamp
      });

      writeMockDb(db);
      return newShipment;
    }
  },

  async updateShipment(id: string, updates: Partial<Shipment>): Promise<Shipment> {
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured() && supabase) {
      const { data: current, error: fetchErr } = await supabase
        .from("shipments")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchErr) throw fetchErr;

      const timeline = current.timeline || [];
      const newTimelineItem = {
        status: updates.status || current.status,
        timestamp,
        action: `Shipment details updated. Status: ${updates.status || current.status}. Notes: ${updates.notes || "None"}`,
        user: "admin"
      };
      const updatedTimeline = [...timeline, newTimelineItem];

      const payload: any = {
        ...updates,
        timeline: updatedTimeline,
        updated_at: timestamp
      };
      
      // Map naming fields from TS camelCase to DB snake_case
      if (updates.courierName) payload.courier_name = updates.courierName;
      if (updates.trackingNumber) payload.tracking_number = updates.trackingNumber;
      if (updates.shippingDate) payload.shipping_date = updates.shippingDate;
      if (updates.estimatedDeliveryDate) payload.estimated_delivery_date = updates.estimatedDeliveryDate;
      if (updates.deliveredDate) payload.delivered_date = updates.deliveredDate;

      // Delete mapped fields to prevent schema collision
      delete payload.courierName;
      delete payload.trackingNumber;
      delete payload.shippingDate;
      delete payload.estimatedDeliveryDate;
      delete payload.deliveredDate;
      delete payload.orderId;
      delete payload.id;

      const { data, error } = await supabase
        .from("shipments")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      // Sync Order Status
      if (updates.status) {
        let orderStatusValue = "shipped";
        if (updates.status === "Delivered") orderStatusValue = "delivered";
        else if (updates.status === "Cancelled" || updates.status === "Returned") orderStatusValue = "cancelled";
        else if (updates.status === "Packed") orderStatusValue = "packed";

        const { data: ord } = await supabase.from("orders").select("status_history").eq("id", current.order_id).single();
        const updatedHistory = [...(ord?.status_history || []), {
          status: orderStatusValue === "shipped" ? "Shipped" : (orderStatusValue === "delivered" ? "Delivered" : "Cancelled"),
          timestamp,
          user: "admin",
          action: `Shipment status transition to ${updates.status}`
        }];

        await supabase
          .from("orders")
          .update({
            order_status: orderStatusValue,
            status_history: updatedHistory
          })
          .eq("id", current.order_id);
      }

      await this.createNotification(
        "inventory_updated",
        "Shipment Updated",
        `Tracking status updated for package: ${updates.status || current.status}`
      );

      await this.logActivity("admin", "Shipment updated", `Shipment ID: ${id}`, "127.0.0.1");

      return {
        id: data.id,
        orderId: data.order_id,
        courierName: data.courier_name,
        trackingNumber: data.tracking_number,
        status: data.status,
        shippingDate: data.shipping_date,
        estimatedDeliveryDate: data.estimated_delivery_date,
        deliveredDate: data.delivered_date,
        notes: data.notes,
        timeline: updatedTimeline,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } else {
      const db = initMockDb();
      const idx = db.shipments.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Shipment not found");

      const current = db.shipments[idx];
      const newTimelineItem = {
        status: updates.status || current.status,
        timestamp,
        action: `Shipment details updated. Status: ${updates.status || current.status}. Notes: ${updates.notes || "None"}`,
        user: "admin"
      };

      const updatedTimeline = [...(current.timeline || []), newTimelineItem];

      db.shipments[idx] = {
        ...current,
        ...updates,
        timeline: updatedTimeline,
        updatedAt: timestamp
      };

      // Sync Order Status
      if (updates.status) {
        let orderStatusValue = "shipped";
        if (updates.status === "Delivered") orderStatusValue = "delivered";
        else if (updates.status === "Cancelled" || updates.status === "Returned") orderStatusValue = "cancelled";
        else if (updates.status === "Packed") orderStatusValue = "packed";

        const ordIdx = db.orders.findIndex((o) => o.id === current.orderId);
        if (ordIdx !== -1) {
          db.orders[ordIdx].orderStatus = orderStatusValue === "shipped" ? "Shipped" : (orderStatusValue === "delivered" ? "Delivered" : "Cancelled");
          db.orders[ordIdx].statusHistory = [...(db.orders[ordIdx].statusHistory || []), {
            status: db.orders[ordIdx].orderStatus,
            timestamp,
            user: "admin",
            action: `Shipment status transition to ${updates.status}`
          }];
        }
      }

      db.notifications.push({
        id: `notif_${Date.now()}`,
        type: "inventory_updated",
        title: "Shipment Updated",
        message: `Tracking status updated for package: ${updates.status || current.status}`,
        read: false,
        createdAt: timestamp
      });

      db.activity_logs.push({
        id: `log_${Date.now()}`,
        userId: "admin",
        action: "Shipment updated",
        details: `Shipment ID: ${id}`,
        ip: "127.0.0.1",
        createdAt: timestamp
      });

      writeMockDb(db);
      return db.shipments[idx];
    }
  },

  async deleteShipment(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from("shipments")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    } else {
      const db = initMockDb();
      const initialLength = db.shipments.length;
      db.shipments = db.shipments.filter((x) => x.id !== id);
      writeMockDb(db);
      return db.shipments.length < initialLength;
    }
  }
};
export default dbService;
