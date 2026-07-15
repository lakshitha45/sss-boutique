"use server";

import { revalidatePath } from "next/cache";
import { dbService } from "@/services/dbService";
import { Product, Category } from "@/types";
import { slugify } from "@/utils";

export async function fetchProducts(includeInactive = false): Promise<Product[]> {
  return await dbService.getProducts(includeInactive);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  return await dbService.getProductBySlug(slug);
}

export async function fetchCategories(): Promise<Category[]> {
  return await dbService.getCategories();
}

export async function saveProduct(
  productData: {
    id?: string;
    categoryId: string;
    name?: string;
    productName?: string;
    sku: string;
    price: number;
    discountPrice?: number;
    compareAtPrice?: number;
    description: string;
    shortDescription?: string;
    material?: string;
    brand?: string;
    careInstructions?: string;
    care?: string;
    featured?: boolean;
    active?: boolean;
    images?: any[];
    inventory?: number | string;
    metadata?: {
      material?: string;
      care?: string;
      sizeFit?: string;
      sizes?: string[];
      colors?: string[];
    };
    variants?: { size: string; stock: number; sku?: string }[];
    metaTitle?: string;
    metaDescription?: string;
  }
): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    const productName = productData.productName || productData.name || "";
    const slug = slugify(productName);
    
    // Check if slug is unique (especially for new products)
    if (!productData.id) {
      const existing = await dbService.getProductBySlug(slug);
      if (existing) {
        return { success: false, error: `A product with the name "${productName}" already exists.` };
      }
    }

    // 1. Transform flat images list into relational image rows
    const imagesPayload = (productData.images || []).map((img, index) => {
      const url = typeof img === "string" ? img : img.imageUrl || "";
      return {
        imageUrl: url,
        displayOrder: index,
        isPrimary: index === 0,
        altText: productName,
      };
    });

    // 2. Transform sizes list and stock counts into size variants
    const sizes = productData.metadata?.sizes && productData.metadata.sizes.length > 0
      ? productData.metadata.sizes
      : ["XS", "S", "M", "L"];
    const totalInventory = Number(productData.inventory || "0");
    const stockPerSize = Math.max(0, Math.floor(totalInventory / sizes.length));
    const remainder = totalInventory % sizes.length;

    const variantsPayload = productData.variants && productData.variants.length > 0
      ? productData.variants.map((v) => ({
          size: v.size,
          stock: Number(v.stock),
          sku: v.sku || `${productData.sku}-${v.size.toUpperCase()}`,
        }))
      : sizes.map((size, index) => ({
          size,
          stock: stockPerSize + (index === 0 ? remainder : 0), // Allocate remainder to first size
          sku: `${productData.sku}-${size.toUpperCase()}`,
        }));

    let product: Product;
    if (productData.id) {
      product = await dbService.updateProduct(productData.id, {
        categoryId: productData.categoryId,
        productName,
        slug,
        description: productData.description,
        shortDescription: productData.shortDescription,
        price: Number(productData.price),
        discountPrice: productData.discountPrice ? Number(productData.discountPrice) : (productData.compareAtPrice ? Number(productData.compareAtPrice) : undefined),
        sku: productData.sku,
        material: productData.material,
        brand: productData.brand || "SSS Boutique",
        careInstructions: productData.careInstructions || productData.care,
        featured: productData.featured || false,
        active: productData.active !== undefined ? productData.active : true,
        images: imagesPayload,
        variants: variantsPayload,
        metaTitle: productData.metaTitle,
        metaDescription: productData.metaDescription,
      });
    } else {
      product = await dbService.createProduct({
        categoryId: productData.categoryId,
        productName,
        slug,
        description: productData.description,
        shortDescription: productData.shortDescription,
        price: Number(productData.price),
        discountPrice: productData.discountPrice ? Number(productData.discountPrice) : (productData.compareAtPrice ? Number(productData.compareAtPrice) : undefined),
        sku: productData.sku,
        material: productData.material,
        brand: productData.brand || "SSS Boutique",
        careInstructions: productData.careInstructions || productData.care,
        featured: productData.featured || false,
        active: productData.active !== undefined ? productData.active : true,
        images: imagesPayload,
        variants: variantsPayload,
        metaTitle: productData.metaTitle,
        metaDescription: productData.metaDescription,
      });
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${slug}`);
    revalidatePath("/admin/products");
    return { success: true, product };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save product." };
  }
}

export async function removeProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await dbService.deleteProduct(id);
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete product." };
  }
}

// Custom CSV Parser function
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result.map((val) => val.replace(/^"|"$/g, "").replace(/""/g, '"'));
}

export async function importProductsFromCsv(
  csvContent: string
): Promise<{ success: boolean; importedCount: number; errors: string[] }> {
  try {
    const lines = csvContent.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length < 2) {
      return { success: false, importedCount: 0, errors: ["CSV file is empty or missing headers"] };
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
    
    // Required headers validation
    const requiredHeaders = ["name", "price", "sku", "inventory", "category", "description"];
    const missing = requiredHeaders.filter((req) => !headers.includes(req));
    if (missing.length > 0) {
      return {
        success: false,
        importedCount: 0,
        errors: [`Missing required columns: ${missing.join(", ")}`],
      };
    }

    const categories = await dbService.getCategories();
    const errors: string[] = [];
    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const row = parseCSVLine(lines[i]);
        if (row.length < headers.length) {
          if (row.join("").trim() === "") continue; // Skip blank lines
          errors.push(`Row ${i + 1}: Column count mismatch. Expected ${headers.length}, got ${row.length}`);
          continue;
        }

        const getVal = (headerName: string) => {
          const idx = headers.indexOf(headerName);
          return idx > -1 ? row[idx] : "";
        };

        const name = getVal("name") || getVal("product_name");
        const priceStr = getVal("price");
        const compareAtPriceStr = getVal("compareatprice") || getVal("compare_at_price") || getVal("discount_price");
        const sku = getVal("sku");
        const inventoryStr = getVal("inventory") || getVal("stock");
        const categoryName = getVal("category");
        const description = getVal("description");
        const imagesStr = getVal("images") || getVal("image") || getVal("image_url_1");
        const material = getVal("material");
        const care = getVal("care") || getVal("care_instructions");
        const sizeFit = getVal("sizefit") || getVal("size_fit");
        const sizesStr = getVal("sizes") || getVal("size");
        const colorsStr = getVal("colors") || getVal("color");

        if (!name || !priceStr || !sku || !categoryName) {
          errors.push(`Row ${i + 1}: Name, Price, SKU, and Category are required.`);
          continue;
        }

        const price = Number(priceStr);
        const inventory = Number(inventoryStr || "0");
        if (isNaN(price)) {
          errors.push(`Row ${i + 1}: Invalid price "${priceStr}".`);
          continue;
        }

        const compareAtPrice = compareAtPriceStr ? Number(compareAtPriceStr) : undefined;

        // Resolve or create category
        let category = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
        if (!category) {
          const catSlug = slugify(categoryName);
          category = await dbService.createCategory({
            name: categoryName,
            slug: catSlug,
            description: `Seeded category for ${categoryName}`,
            bannerImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
            isFeatured: false,
          });
          categories.push(category);
        }

        // Support multiple comma/semicolon images URLs or collect columns image_url_1..5
        const imagesList: string[] = [];
        if (imagesStr) {
          imagesStr.split(";").map((img) => img.trim()).forEach((url) => {
            if (url) imagesList.push(url);
          });
        } else {
          // Collect up to 5 individual image columns if present in headers
          for (let colIdx = 1; colIdx <= 5; colIdx++) {
            const val = getVal(`image_url_${colIdx}`);
            if (val) imagesList.push(val);
          }
        }

        if (imagesList.length === 0) {
          imagesList.push("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop");
        }

        const sizes = sizesStr
          ? sizesStr.split(";").map((s) => s.trim().toUpperCase()).filter((s) => s !== "")
          : ["XS", "S", "M", "L"];
        
        const colors = colorsStr
          ? colorsStr.split(";").map((c) => c.trim()).filter((c) => c !== "")
          : [];

        // Check if SKU exists to update, otherwise insert
        const existingProducts = await dbService.getProducts(true);
        const existing = existingProducts.find((p) => p.sku === sku);

        const slug = slugify(name);

        // 1. Map to relational structures
        const imagesPayload = imagesList.map((url, idx) => ({
          imageUrl: url,
          displayOrder: idx,
          isPrimary: idx === 0,
          altText: name,
        }));

        const stockPerSize = Math.max(0, Math.floor(inventory / sizes.length));
        const remainder = inventory % sizes.length;

        const variantsPayload = sizes.map((size, idx) => ({
          size,
          stock: stockPerSize + (idx === 0 ? remainder : 0),
          sku: `${sku}-${size.toUpperCase()}`,
        }));

        const productPayload = {
          categoryId: category.id,
          productName: name,
          slug,
          description,
          price,
          discountPrice: compareAtPrice,
          sku,
          material: material || undefined,
          brand: "SSS Boutique",
          careInstructions: care || undefined,
          featured: false,
          active: true,
          images: imagesPayload,
          variants: variantsPayload,
        };

        if (existing) {
          await dbService.updateProduct(existing.id, productPayload);
        } else {
          await dbService.createProduct(productPayload);
        }

        importedCount++;
      } catch (rowErr: any) {
        errors.push(`Row ${i + 1}: ${rowErr.message || "Unknown error occurred"}`);
      }
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true, importedCount, errors };
  } catch (err: any) {
    return { success: false, importedCount: 0, errors: [err.message || "Failed to parse CSV"] };
  }
}

export async function updateVariantStock(productId: string, variants: { size: string; stock: number; sku: string }[]): Promise<{ success: boolean; error?: string }> {
  try {
    await dbService.updateProduct(productId, { variants });
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update stock" };
  }
}

export async function saveCategory(data: {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  isFeatured: boolean;
  active?: boolean;
  displayOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (data.id) {
      await dbService.updateCategory(data.id, {
        name: data.name,
        slug: data.slug,
        description: data.description,
        bannerImage: data.bannerImage,
        isFeatured: data.isFeatured,
        active: data.active,
        displayOrder: data.displayOrder,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      });
    } else {
      await dbService.createCategory({
        name: data.name,
        slug: data.slug,
        description: data.description,
        bannerImage: data.bannerImage,
        isFeatured: data.isFeatured,
        active: data.active !== undefined ? data.active : true,
        displayOrder: data.displayOrder !== undefined ? data.displayOrder : 0,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      });
    }
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save category" };
  }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await dbService.deleteCategory(id);
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete category" };
  }
}

// --- ADMIN BANNERS, COUPONS & REVIEWS ACTIONS ---
export async function fetchBanners() {
  return await dbService.getBanners();
}

export async function saveBanner(banner: any) {
  try {
    const saved = await dbService.saveBanner(banner);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true, banner: saved };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteBanner(id: string) {
  try {
    await dbService.deleteBanner(id);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchCoupons() {
  return await dbService.getCoupons();
}

export async function saveCoupon(coupon: any) {
  try {
    const saved = await dbService.saveCoupon(coupon);
    revalidatePath("/admin/coupons");
    return { success: true, coupon: saved };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await dbService.deleteCoupon(id);
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchReviews() {
  return await dbService.getReviews();
}

export async function deleteReview(id: string) {
  try {
    await dbService.deleteReview(id);
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

