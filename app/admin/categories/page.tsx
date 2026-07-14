"use client";

import React, { useEffect, useState } from "react";
import { fetchCategories, fetchProducts, saveCategory, deleteCategory } from "@/features/products/productActions";
import { Category, Product } from "@/types";
import { uploadProductImage } from "@/services/imageUploadService";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Folder, AlertCircle, Sparkles, Upload, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState("0");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [error, setError] = useState("");

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const loadData = async () => {
    try {
      const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts(true)]);
      setCategories(cats);
      setProducts(prods);
    } catch (err: any) {
      console.error("Failed to load categories data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setBannerImage("");
    setIsFeatured(false);
    setActive(true);
    setDisplayOrder("0");
    setMetaTitle("");
    setMetaDescription("");
    setError("");
    setUploadProgress(0);
    setIsUploading(false);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setBannerImage(cat.bannerImage || cat.imageUrl || "");
    setIsFeatured(cat.isFeatured);
    setActive(cat.active !== undefined ? cat.active : true);
    setDisplayOrder((cat.displayOrder || 0).toString());
    setMetaTitle(cat.metaTitle || "");
    setMetaDescription(cat.metaDescription || "");
    setError("");
    setUploadProgress(0);
    setIsUploading(false);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate slug from name if not manually editing
    setSlug(val.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, ""));
    setMetaTitle(val);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category Name is required");
      return;
    }
    if (!slug.trim()) {
      setError("Category Slug is required");
      return;
    }

    try {
      const res = await saveCategory({
        id: editingCategory?.id,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        bannerImage: bannerImage.trim(),
        isFeatured,
        active,
        displayOrder: parseInt(displayOrder) || 0,
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
      });

      if (!res.success) {
        setError(res.error || "Failed to save category");
        return;
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await deleteCategory(id);
      if (!res.success) {
        alert(res.error || "Failed to delete category");
        return;
      }
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete category");
    }
  };

  // Drag and Drop Upload Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError("");
    try {
      const publicUrl = await uploadProductImage(file, "categories", (percent) => {
        setUploadProgress(percent);
      });
      setBannerImage(publicUrl);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please check credentials.");
    } finally {
      setIsUploading(false);
    }
  };

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
          <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Product Organization</span>
          <h1 className="font-serif text-3xl font-light tracking-wide text-white">Categories Manager</h1>
          <div className="w-12 h-[1px] bg-accent mt-3" />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-accent text-foreground px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] hover:bg-accent/90 transition shadow-luxury"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Category</span>
        </button>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {[...categories]
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map((cat) => {
            const catProductsCount = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              key={cat.id}
              className={`bg-[#121212] border ${cat.active === false ? "border-zinc-800 opacity-60" : "border-[#1C1C1C] hover:border-zinc-700"} rounded-none overflow-hidden transition duration-300 flex flex-col group relative`}
            >
              {/* Image Banner */}
              <div className="h-40 bg-zinc-900 relative overflow-hidden">
                <img
                  src={cat.bannerImage || cat.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"}
                  alt={cat.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                
                {/* Feature / Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {cat.isFeatured && (
                    <span className="bg-accent/20 text-accent border border-accent/30 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 flex items-center space-x-1.5 backdrop-blur-sm w-fit">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Featured</span>
                    </span>
                  )}
                  {cat.active === false && (
                    <span className="bg-zinc-900/80 text-zinc-400 border border-zinc-700 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 flex items-center space-x-1.5 backdrop-blur-sm w-fit">
                      <EyeOff className="w-2.5 h-2.5" />
                      <span>Inactive</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Contents */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-light text-white tracking-wide">{cat.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-wider">/{cat.slug}</p>
                  {cat.description && (
                    <p className="text-[11px] text-zinc-400 font-light line-clamp-2 mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-[#1C1C1C] pt-3.5">
                  <span className="text-[10px] text-zinc-400 flex items-center space-x-1.5">
                    <Folder className="w-3.5 h-3.5 text-accent" />
                    <span>{catProductsCount} Products</span>
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 hover:text-accent transition border border-[#1C1C1C] hover:border-accent bg-[#0C0C0C]"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 hover:text-rose-455 transition border border-[#1C1C1C] hover:border-rose-900 bg-[#0C0C0C]"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-[#121212] border border-[#1C1C1C] max-w-lg w-full relative z-10 shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
            >
              <h2 className="font-serif text-xl font-light text-white mb-6 tracking-wide">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                {error && (
                  <div className="bg-rose-950/20 text-rose-455 border border-rose-900/35 p-3 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Category Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                      placeholder="e.g. Sarees, Salwars"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Slug Path</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white font-mono"
                      placeholder="e.g. sarees"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white min-h-[60px]"
                      placeholder="Brief description of products in this category..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Display Order</label>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>

                {/* DRAG & DROP IMAGE UPLOADER */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Category Image</label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-none p-4 flex flex-col items-center justify-center transition ${
                      isDragOver ? "border-accent bg-accent/5" : "border-[#1F1F1F] bg-[#0A0A0A] hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="file"
                      id="cat-image-file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {isUploading ? (
                      <div className="w-full text-center space-y-2">
                        <span className="text-[10px] text-zinc-400 block">Uploading file to Supabase Storage...</span>
                        <div className="w-full bg-zinc-800 h-1 rounded-none overflow-hidden">
                          <div className="bg-accent h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <span className="text-xs text-accent font-mono">{uploadProgress}%</span>
                      </div>
                    ) : bannerImage ? (
                      <div className="w-full flex items-center space-x-3">
                        <div className="w-16 h-10 border border-zinc-800 overflow-hidden flex-shrink-0 bg-zinc-950">
                          <img src={bannerImage} alt="Uploaded Banner" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-emerald-450 flex items-center space-x-1.5 font-bold">
                            <CheckCircle className="w-3 h-3" />
                            <span>Uploaded successfully</span>
                          </span>
                          <span className="text-[9px] text-zinc-500 block truncate font-mono mt-0.5">{bannerImage}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBannerImage("")}
                          className="text-[9px] uppercase font-bold tracking-wider text-rose-455 border border-rose-950 px-2 py-1 hover:bg-rose-950/20"
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="cat-image-file" className="cursor-pointer flex flex-col items-center justify-center space-y-1.5 text-center">
                        <Upload className="w-5 h-5 text-zinc-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Drag file here or click to browse</span>
                        <span className="text-[9px] text-zinc-500">Supports PNG, JPG, JPEG, WEBP</span>
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* Status Toggle */}
                  <div className="flex items-center space-x-3 border border-[#1C1C1C] p-3 bg-[#0A0A0A]">
                    <input
                      type="checkbox"
                      id="active"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="accent-accent w-4 h-4"
                    />
                    <label htmlFor="active" className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider select-none cursor-pointer">
                      Category Active Status
                    </label>
                  </div>

                  {/* Featured Toggle */}
                  <div className="flex items-center space-x-3 border border-[#1C1C1C] p-3 bg-[#0A0A0A]">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="accent-accent w-4 h-4"
                    />
                    <label htmlFor="isFeatured" className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider select-none cursor-pointer">
                      Feature on Carousel
                    </label>
                  </div>
                </div>

                {/* SEO METADATA SECTION */}
                <div className="border-t border-[#1C1C1C] pt-4 space-y-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Category SEO Metadata</span>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">SEO Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                      placeholder="e.g. Designer Sarees | Buy silk sarees online"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">SEO Meta Description</label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white min-h-[50px]"
                      placeholder="Compelling meta description to show in search engine results..."
                    />
                  </div>
                </div>

                <div className="flex space-x-3 border-t border-[#1C1C1C] pt-5 mt-6 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 border border-[#1C1C1C] hover:bg-zinc-900 transition text-[10px] uppercase font-bold tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-accent text-foreground hover:bg-accent/90 transition text-[10px] uppercase font-bold tracking-wider"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
