"use client";

import React, { useEffect, useState, useCallback } from "react";
import { fetchProducts, fetchCategories, saveProduct, removeProduct } from "@/features/products/productActions";
import { Product, Category } from "@/types";
import { formatPrice } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Copy, Archive, Eye, Search, AlertCircle, Sparkles, ChevronRight, ChevronLeft, Save, HelpCircle, CheckCircle } from "lucide-react";

const SIZES_LIST = ["XS", "S", "M", "L", "XL"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formStep, setFormStep] = useState(1); // 1 to 6 steps
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveMsg, setAutoSaveMsg] = useState("");

  // Form Fields
  const [formFields, setFormFields] = useState({
    name: "",
    categoryId: "",
    brand: "SSS Boutique",
    description: "",
    material: "",
    careInstructions: "",
    tags: "",
    imagesStr: "", // Semicolon separated
    price: "",
    compareAtPrice: "",
    sku: "",
    barcode: "",
    seoTitle: "",
    seoDescription: "",
    slug: "",
    canonicalUrl: "",
    status: "published", // published / draft
  });

  // Size stocks for Step 4
  const [sizeStocks, setSizeStocks] = useState<Record<string, string>>({
    XS: "10", S: "10", M: "10", L: "10", XL: "10"
  });

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([fetchProducts(true), fetchCategories()]);
      setProducts(prods);
      setCategories(cats);
      if (cats.length > 0 && !formFields.categoryId) {
        setFormFields((prev) => ({ ...prev, categoryId: cats[0].id }));
      }
    } catch (err) {
      console.error("Failed to load products list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcut Ctrl+N/Ctrl+S
  const handleKeyboardActions = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      openAddModal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "s" && isModalOpen) {
      e.preventDefault();
      triggerAutoSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, formFields, sizeStocks]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardActions);
    return () => window.removeEventListener("keydown", handleKeyboardActions);
  }, [handleKeyboardActions]);

  // Autosave interval (every 30 seconds)
  useEffect(() => {
    if (!isModalOpen) return;
    const interval = setInterval(() => {
      triggerAutoSave();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, formFields, sizeStocks]);

  const triggerAutoSave = () => {
    const draftKey = editingProduct ? `sss_draft_${editingProduct.id}` : "sss_draft_new";
    const draftData = { formFields, sizeStocks };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
    setAutoSaveMsg("Draft auto-saved locally");
    setTimeout(() => setAutoSaveMsg(""), 2000);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormStep(1);
    setFormError("");
    setFormFields({
      name: "",
      categoryId: categories[0]?.id || "",
      brand: "SSS Boutique",
      description: "",
      material: "",
      careInstructions: "",
      tags: "Saree, Designer",
      imagesStr: "",
      price: "",
      compareAtPrice: "",
      sku: "",
      barcode: "",
      seoTitle: "",
      seoDescription: "",
      slug: "",
      canonicalUrl: "",
      status: "published",
    });
    setSizeStocks({ XS: "10", S: "10", M: "10", L: "10", XL: "10" });
    
    // Check if there is an unsaved new draft in localStorage
    const savedNew = localStorage.getItem("sss_draft_new");
    if (savedNew) {
      if (confirm("Restore your previously auto-saved draft?")) {
        const parsed = JSON.parse(savedNew);
        setFormFields(parsed.formFields);
        setSizeStocks(parsed.sizeStocks);
      }
    }
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormStep(1);
    setFormError("");
    
    const imageString = product.images.map((img) => img.imageUrl).join(";");
    const initFields = {
      name: product.name,
      categoryId: product.categoryId,
      brand: product.brand || "SSS Boutique",
      description: product.description,
      material: product.material || "",
      careInstructions: product.careInstructions || "",
      tags: "Saree, Traditional",
      imagesStr: imageString,
      price: product.price.toString(),
      compareAtPrice: product.compareAtPrice?.toString() || "",
      sku: product.sku,
      barcode: `BAR-${product.sku}`,
      seoTitle: product.metadata?.brand || product.name,
      seoDescription: product.shortDescription || product.description,
      slug: product.slug,
      canonicalUrl: `https://sssboutique.com/shop/${product.slug}`,
      status: product.active ? "published" : "draft",
    };
    
    setFormFields(initFields);

    const initSizeStocks: Record<string, string> = { XS: "0", S: "0", M: "0", L: "0", XL: "0" };
    product.variants.forEach((v) => {
      initSizeStocks[v.size] = v.stock.toString();
    });
    setSizeStocks(initSizeStocks);

    // Check if there is an unsaved edit draft in localStorage
    const savedEdit = localStorage.getItem(`sss_draft_${product.id}`);
    if (savedEdit) {
      if (confirm("Restore your previously auto-saved draft for this product?")) {
        const parsed = JSON.parse(savedEdit);
        setFormFields(parsed.formFields);
        setSizeStocks(parsed.sizeStocks);
      }
    }

    setIsModalOpen(true);
  };

  const handleFieldChange = (key: keyof typeof formFields, val: string) => {
    setFormFields((prev) => {
      const next = { ...prev, [key]: val };
      // Auto fill SEO slug/title based on Name
      if (key === "name" && !prev.slug) {
        next.slug = val.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        next.seoTitle = val;
      }
      return next;
    });
  };

  const handleSizeStockChange = (size: string, val: string) => {
    if (isNaN(Number(val)) && val !== "") return;
    setSizeStocks((prev) => ({
      ...prev,
      [size]: val,
    }));
  };

  const handleSaveProduct = async () => {
    // Validate
    if (!formFields.name || !formFields.sku || !formFields.price || !formFields.categoryId) {
      setFormError("Product Name, SKU, Category and Price are required.");
      setFormStep(1);
      return;
    }

    setIsSaving(true);
    setFormError("");

    const images = formFields.imagesStr
      .split(";")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const variants = SIZES_LIST.map((size) => ({
      size,
      stock: Math.max(0, parseInt(sizeStocks[size]) || 0),
      sku: `${formFields.sku}-${size.toUpperCase()}`,
    }));

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    const payload = {
      id: editingProduct?.id || undefined,
      categoryId: formFields.categoryId,
      productName: formFields.name,
      name: formFields.name,
      sku: formFields.sku,
      price: parseFloat(formFields.price) || 0,
      compareAtPrice: formFields.compareAtPrice ? parseFloat(formFields.compareAtPrice) : undefined,
      description: formFields.description,
      material: formFields.material,
      brand: formFields.brand,
      careInstructions: formFields.careInstructions,
      featured: false,
      active: formFields.status === "published",
      images,
      variants,
      inventory: totalStock,
      metadata: {
        material: formFields.material || undefined,
        care: formFields.careInstructions || undefined,
        sizes: SIZES_LIST,
        colors: [],
      },
    };

    try {
      const res = await saveProduct(payload);
      if (res.success) {
        // Clear drafts local storage
        const draftKey = editingProduct ? `sss_draft_${editingProduct.id}` : "sss_draft_new";
        localStorage.removeItem(draftKey);
        
        setIsModalOpen(false);
        loadData();
      } else {
        setFormError(res.error || "Failed to save product details");
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to save product details");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      const res = await removeProduct(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || "Failed to delete product");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  const handleDuplicate = async (product: Product) => {
    if (!confirm(`Duplicate product "${product.name}"?`)) return;
    setLoading(true);
    try {
      const clonedSku = `${product.sku}-COPY`;
      const clonedSlug = `${product.slug}-copy`;
      const clonedName = `${product.name} (Copy)`;

      const payload = {
        categoryId: product.categoryId,
        productName: clonedName,
        name: clonedName,
        sku: clonedSku,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        description: product.description,
        material: product.material,
        brand: product.brand || "SSS Boutique",
        careInstructions: product.careInstructions,
        featured: false,
        active: false, // draft by default
        images: product.images.map((img) => img.imageUrl),
        variants: product.variants.map((v) => ({ size: v.size, stock: v.stock, sku: `${clonedSku}-${v.size.toUpperCase()}` })),
        inventory: product.stock,
      };

      const res = await saveProduct(payload);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || "Failed to duplicate product");
      }
    } catch (err: any) {
      alert(err.message || "Failed to duplicate product");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArchive = async (product: Product) => {
    const actionLabel = product.active ? "Archive" : "Unarchive";
    if (!confirm(`${actionLabel} product "${product.name}"?`)) return;
    try {
      const res = await saveProduct({
        ...product,
        active: !product.active,
      });
      if (res.success) {
        loadData();
      } else {
        alert(res.error || `Failed to ${actionLabel} product`);
      }
    } catch (err: any) {
      alert(err.message || `Failed to ${actionLabel} product`);
    }
  };

  // Filtered Products list
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(search.toLowerCase()) || prod.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || prod.categoryId === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === "out") matchesStock = prod.stock === 0;
    else if (stockFilter === "low") matchesStock = prod.stock > 0 && prod.stock < 5;

    let matchesStatus = true;
    if (statusFilter === "published") matchesStatus = prod.active;
    else if (statusFilter === "draft") matchesStatus = !prod.active;

    return matchesSearch && matchesCategory && matchesStock && matchesStatus;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-poppins text-zinc-100 bg-[#0A0A0A]">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Product Catalog Cockpit</span>
          <h1 className="font-serif text-3xl font-light tracking-wide text-white">Products Catalog</h1>
          <div className="w-12 h-[1px] bg-accent mt-3" />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-accent text-foreground px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] hover:bg-accent/90 transition shadow-luxury"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Product</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-zinc-400">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none pl-9 pr-3 py-2.5 focus:outline-none focus:border-accent text-white"
          />
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
        </div>

        <div className="flex items-center space-x-2">
          <span>Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span>Stock status:</span>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
          >
            <option value="all">All Inventory levels</option>
            <option value="out">Out of Stock</option>
            <option value="low">{"Low Stock (< 5)"}</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span>Publish status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* PRODUCTS INDEX TABLE */}
      <div className="bg-[#121212] border border-[#1C1C1C] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1C1C1C] text-[10px] text-zinc-500 uppercase tracking-widest font-bold bg-[#0C0C0C]">
                <th className="p-4">Product details</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Inventory</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C] text-zinc-300">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-zinc-500">No matching products found.</td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const firstImg = prod.images[0]?.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
                  const catName = categories.find((c) => c.id === prod.categoryId)?.name || "Edit";
                  return (
                    <tr key={prod.id} className="hover:bg-[#161616] transition">
                      <td className="p-4 flex items-center space-x-3">
                        <div className="w-9 h-11 bg-zinc-950 border border-zinc-900 overflow-hidden flex-shrink-0">
                          <img src={firstImg} alt="" className="object-cover w-full h-full" />
                        </div>
                        <div>
                          <span className="font-serif text-sm font-light text-white block">{prod.name}</span>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">Created: {new Date(prod.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-zinc-400">{prod.sku}</td>
                      <td className="p-4 text-zinc-400">{catName}</td>
                      <td className="p-4 text-right font-semibold text-white">
                        <span className={prod.stock === 0 ? "text-rose-455 font-bold" : (prod.stock < 5 ? "text-amber-400 font-bold" : "")}>
                          {prod.stock} Units
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold text-accent">{formatPrice(prod.price)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 border text-[8px] font-bold uppercase tracking-wider rounded-none ${
                          prod.active
                            ? "bg-emerald-950/20 text-emerald-450 border-emerald-900/35"
                            : "bg-zinc-850 text-zinc-400 border-zinc-700/35"
                        }`}>
                          {prod.active ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex space-x-1.5 justify-center">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 hover:text-accent border border-[#1C1C1C] hover:border-accent bg-[#0C0C0C] transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(prod)}
                            className="p-1.5 hover:text-accent border border-[#1C1C1C] hover:border-accent bg-[#0C0C0C] transition"
                            title="Clone/Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleArchive(prod)}
                            className={`p-1.5 border border-[#1C1C1C] bg-[#0C0C0C] transition ${
                              prod.active ? "hover:text-amber-500 hover:border-amber-900" : "hover:text-emerald-400 hover:border-emerald-900"
                            }`}
                            title={prod.active ? "Archive Product" : "Publish Product"}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="p-1.5 hover:text-rose-455 border border-[#1C1C1C] hover:border-rose-900 bg-[#0C0C0C] transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MULTI STEP WIZARD MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              className="bg-[#121212] border border-[#1C1C1C] max-w-2xl w-full relative z-10 shadow-2xl p-6 flex flex-col max-h-[92vh]"
            >
              {/* Form title / Header */}
              <div className="flex justify-between items-start border-b border-[#1C1C1C]/80 pb-4 mb-4">
                <div>
                  <h2 className="font-serif text-lg font-light text-white tracking-wide">
                    {editingProduct ? `Modify catalog: ${editingProduct.name}` : "Create New Product Catalog"}
                  </h2>
                  {autoSaveMsg && <span className="text-[10px] text-accent font-bold tracking-widest">{autoSaveMsg}</span>}
                </div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  Step {formStep} of 6
                </div>
              </div>

              {/* Form Steps Progress indicator */}
              <div className="w-full bg-[#0A0A0A] h-1 border-b border-[#1C1C1C] mb-6 flex">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-full transition-all duration-300 ${
                      i + 1 <= formStep ? "bg-accent" : "bg-transparent"
                    }`}
                  />
                ))}
              </div>

              {/* Form step screens container */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs select-none">
                {formError && (
                  <div className="bg-rose-950/20 text-rose-455 border border-rose-900/35 p-3 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* STEP 1: BASIC INFORMATION */}
                {formStep === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Product Name</label>
                        <input
                          type="text"
                          value={formFields.name}
                          onChange={(e) => handleFieldChange("name", e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                          placeholder="e.g. Pink Banarasi Silk Saree"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Category Category</label>
                        <select
                          value={formFields.categoryId}
                          onChange={(e) => handleFieldChange("categoryId", e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Fabric Material</label>
                        <input
                          type="text"
                          value={formFields.material}
                          onChange={(e) => handleFieldChange("material", e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                          placeholder="e.g. 100% Organza Silk"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Garments care</label>
                        <input
                          type="text"
                          value={formFields.careInstructions}
                          onChange={(e) => handleFieldChange("careInstructions", e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                          placeholder="e.g. Dry Clean Only"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Detailed description</label>
                      <textarea
                        value={formFields.description}
                        onChange={(e) => handleFieldChange("description", e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white min-h-[90px]"
                        placeholder="Provide details about zari borders, color contrasts, drape styles..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: IMAGES */}
                {formStep === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Images URLs (Semicolon separated)</label>
                      <textarea
                        value={formFields.imagesStr}
                        onChange={(e) => handleFieldChange("imagesStr", e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white min-h-[80px] font-mono text-[10px]"
                        placeholder="https://images.unsplash.com/...;https://images.unsplash.com/..."
                      />
                      <span className="text-[9px] text-zinc-500 italic block mt-1">
                        First image URL will automatically act as the primary catalog display thumbnail.
                      </span>
                    </div>

                    {/* Previews */}
                    <div className="grid grid-cols-5 gap-3 pt-2">
                      {formFields.imagesStr.split(";").map((img, idx) => {
                        const cleanUrl = img.trim();
                        if (!cleanUrl) return null;
                        return (
                          <div key={idx} className="relative w-full h-20 border border-[#1F1F1F] bg-zinc-950 overflow-hidden">
                            <img src={cleanUrl} alt="" className="object-cover w-full h-full" />
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 bg-accent/90 text-foreground text-[8px] font-bold uppercase tracking-wider px-1">
                                Cover
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: PRICING & SKU */}
                {formStep === 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">SKU Code (Required)</label>
                        <input
                          type="text"
                          value={formFields.sku}
                          onChange={(e) => handleFieldChange("sku", e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white font-mono"
                          placeholder="e.g. PINK-KANCHI-01"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Barcode / EAN</label>
                        <input
                          type="text"
                          value={formFields.barcode}
                          onChange={(e) => handleFieldChange("barcode", e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Selling Price (₹)</label>
                        <input
                          type="number"
                          value={formFields.price}
                          onChange={(e) => handleFieldChange("price", e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Compare At Price (Discount Base)</label>
                        <input
                          type="number"
                          value={formFields.compareAtPrice}
                          onChange={(e) => handleFieldChange("compareAtPrice", e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white font-mono"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: INVENTORY QUANTITIES */}
                {formStep === 4 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Allocate size variant stocks</span>
                    
                    <div className="grid grid-cols-5 gap-3">
                      {SIZES_LIST.map((size) => (
                        <div key={size} className="bg-[#0A0A0A] border border-[#1C1C1C] p-3 flex flex-col items-center space-y-2">
                          <span className="font-bold text-zinc-400">{size}</span>
                          <input
                            type="text"
                            value={sizeStocks[size] || ""}
                            onChange={(e) => handleSizeStockChange(size, e.target.value)}
                            className="w-16 bg-[#121212] border border-[#1F1F1F] px-2 py-1 text-center font-mono focus:outline-none focus:border-accent text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: SEO METADATA */}
                {formStep === 5 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">URL slug path</label>
                      <input
                        type="text"
                        value={formFields.slug}
                        onChange={(e) => handleFieldChange("slug", e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white font-mono text-[10px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">SEO Meta Title</label>
                        <input
                          type="text"
                          value={formFields.seoTitle}
                          onChange={(e) => handleFieldChange("seoTitle", e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Canonical URL</label>
                        <input
                          type="text"
                          value={formFields.canonicalUrl}
                          onChange={(e) => handleFieldChange("canonicalUrl", e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white font-mono text-[10px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">SEO Meta Description</label>
                      <textarea
                        value={formFields.seoDescription}
                        onChange={(e) => handleFieldChange("seoDescription", e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white min-h-[60px]"
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 6: PUBLISH SCHEDULE */}
                {formStep === 6 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">Select Publish Status</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => handleFieldChange("status", "published")}
                        className={`border p-4 flex flex-col items-center justify-center space-y-2 cursor-pointer transition ${
                          formFields.status === "published"
                            ? "bg-accent/15 border-accent text-accent"
                            : "bg-[#0A0A0A] border-[#1C1C1C] hover:border-zinc-700"
                        }`}
                      >
                        <Sparkles className="w-5 h-5" />
                        <span className="font-bold text-[10px] uppercase tracking-wider">Publish Immediately</span>
                        <p className="text-[9px] text-zinc-500 text-center leading-relaxed">Product goes live immediately on the SSS storefront.</p>
                      </div>

                      <div
                        onClick={() => handleFieldChange("status", "draft")}
                        className={`border p-4 flex flex-col items-center justify-center space-y-2 cursor-pointer transition ${
                          formFields.status === "draft"
                            ? "bg-accent/15 border-accent text-accent"
                            : "bg-[#0A0A0A] border-[#1C1C1C] hover:border-zinc-700"
                        }`}
                      >
                        <Save className="w-5 h-5" />
                        <span className="font-bold text-[10px] uppercase tracking-wider">Save As Draft</span>
                        <p className="text-[9px] text-zinc-500 text-center leading-relaxed">Product is kept invisible, stored in drafts console.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Form Footer Stepper triggers */}
              <div className="flex justify-between items-center border-t border-[#1C1C1C] pt-4 mt-6">
                <div>
                  {formStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setFormStep(formStep - 1)}
                      className="flex items-center space-x-1.5 px-3 py-2 border border-[#1C1C1C] hover:bg-zinc-900 transition text-[9px] uppercase font-bold tracking-wider"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous Step</span>
                    </button>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Save local draft before cancel
                      triggerAutoSave();
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2 border border-[#1C1C1C] hover:bg-zinc-900 transition text-[9px] uppercase font-bold tracking-wider"
                  >
                    Cancel
                  </button>

                  {formStep < 6 ? (
                    <button
                      type="button"
                      onClick={() => setFormStep(formStep + 1)}
                      className="flex items-center space-x-1.5 px-4 py-2.5 bg-accent text-foreground hover:bg-accent/90 transition text-[9px] uppercase font-bold tracking-wider font-semibold"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveProduct}
                      className="px-5 py-2.5 bg-accent text-foreground hover:bg-accent/90 transition text-[9px] uppercase font-bold tracking-wider flex items-center space-x-2"
                    >
                      {isSaving ? (
                        <div className="w-3 h-3 border border-t-transparent border-foreground animate-spin rounded-full" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      <span>Finish & Save</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
