"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { fetchProducts, fetchCategories, saveProduct, removeProduct } from "@/features/products/productActions";
import { Product, Category } from "@/types";
import { formatPrice } from "@/utils";
import { uploadProductImage } from "@/services/imageUploadService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Edit2, Trash2, Copy, Archive, Eye, Search, AlertCircle, 
  Sparkles, ChevronRight, ChevronLeft, Save, Upload, CheckCircle, 
  ArrowUp, ArrowDown, Download, CheckSquare, Square, Trash, Crop, 
  X, RefreshCw, Layers 
} from "lucide-react";

const SIZES_LIST = ["XS", "S", "M", "L", "XL", "XXL"];
const ITEMS_PER_PAGE = 10;

interface UploadingFileState {
  id: string;
  name: string;
  progress: number;
  error?: string;
  isCompleted: boolean;
}

interface FormImage {
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Sorting state
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection/Bulk state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formStep, setFormStep] = useState(1); // Steps 1 to 6
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveMsg, setAutoSaveMsg] = useState("");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Form Fields
  const [formFields, setFormFields] = useState({
    name: "",
    categoryId: "",
    brand: "SSS Boutique",
    description: "",
    material: "",
    careInstructions: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    slug: "",
    seoTitle: "",
    seoDescription: "",
    status: "published",
  });

  // Size stocks for Step 4
  const [sizeStocks, setSizeStocks] = useState<Record<string, string>>({
    XS: "10", S: "10", M: "10", L: "10", XL: "10", XXL: "10"
  });

  // Form Images state (Step 2)
  const [formImages, setFormImages] = useState<FormImage[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFileState[]>([]);

  // Cropper State
  const [croppingIndex, setCroppingIndex] = useState<number | null>(null);
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, w: 80, h: 80 }); // percent-based crop box
  const [cropImageLoaded, setCropImageLoaded] = useState(false);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cropImgRef = useRef<HTMLImageElement | null>(null);

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
  }, [isModalOpen, formFields, sizeStocks, formImages]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardActions);
    return () => window.removeEventListener("keydown", handleKeyboardActions);
  }, [handleKeyboardActions]);

  // Autosave draft locally
  useEffect(() => {
    if (!isModalOpen) return;
    const interval = setInterval(() => {
      triggerAutoSave();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, formFields, sizeStocks, formImages]);

  // Unsaved changes unload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isModalOpen && isFormDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to exit?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isModalOpen, isFormDirty]);

  const triggerAutoSave = () => {
    const draftKey = editingProduct ? `sss_draft_${editingProduct.id}` : "sss_draft_new";
    const draftData = { formFields, sizeStocks, formImages };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
    setAutoSaveMsg("Draft auto-saved locally");
    setTimeout(() => setAutoSaveMsg(""), 2000);
  };

  const checkUnsavedClose = (closeAction: () => void) => {
    if (isFormDirty) {
      if (confirm("You have unsaved changes. Discard changes and close?")) {
        closeAction();
      }
    } else {
      closeAction();
    }
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
      price: "",
      compareAtPrice: "",
      sku: "",
      slug: "",
      seoTitle: "",
      seoDescription: "",
      status: "published",
    });
    setSizeStocks({ XS: "10", S: "10", M: "10", L: "10", XL: "10", XXL: "10" });
    setFormImages([]);
    setUploadingFiles([]);
    setViewMode("edit");
    setIsFormDirty(false);

    const savedNew = localStorage.getItem("sss_draft_new");
    if (savedNew) {
      if (confirm("Restore your previously auto-saved draft?")) {
        const parsed = JSON.parse(savedNew);
        setFormFields(parsed.formFields);
        setSizeStocks(parsed.sizeStocks);
        setFormImages(parsed.formImages || []);
        setIsFormDirty(true);
      }
    }
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormStep(1);
    setFormError("");
    setUploadingFiles([]);
    setViewMode("edit");
    setIsFormDirty(false);

    const initFields = {
      name: product.name,
      categoryId: product.categoryId,
      brand: product.brand || "SSS Boutique",
      description: product.description,
      material: product.material || "",
      careInstructions: product.careInstructions || "",
      price: product.price.toString(),
      compareAtPrice: product.discountPrice?.toString() || product.compareAtPrice?.toString() || "",
      sku: product.sku,
      slug: product.slug,
      seoTitle: product.metaTitle || product.name,
      seoDescription: product.metaDescription || product.description,
      status: product.active ? "published" : "draft",
    };
    setFormFields(initFields);

    const initSizeStocks: Record<string, string> = { XS: "0", S: "0", M: "0", L: "0", XL: "0", XXL: "0" };
    product.variants.forEach((v) => {
      initSizeStocks[v.size] = v.stock.toString();
    });
    setSizeStocks(initSizeStocks);

    const mappedImages = product.images.map((img) => ({
      imageUrl: img.imageUrl,
      isPrimary: img.isPrimary,
      displayOrder: img.displayOrder,
    })).sort((a, b) => a.displayOrder - b.displayOrder);
    setFormImages(mappedImages);

    const savedEdit = localStorage.getItem(`sss_draft_${product.id}`);
    if (savedEdit) {
      if (confirm("Restore your previously auto-saved draft for this product?")) {
        const parsed = JSON.parse(savedEdit);
        setFormFields(parsed.formFields);
        setSizeStocks(parsed.sizeStocks);
        setFormImages(parsed.formImages || []);
        setIsFormDirty(true);
      }
    }

    setIsModalOpen(true);
  };

  const handleFieldChange = (key: keyof typeof formFields, val: string) => {
    setIsFormDirty(true);
    setFormFields((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "name" && !prev.slug) {
        next.slug = val.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
        next.seoTitle = val;
      }
      return next;
    });
  };

  const handleSizeStockChange = (size: string, val: string) => {
    if (isNaN(Number(val)) && val !== "") return;
    setIsFormDirty(true);
    setSizeStocks((prev) => ({ ...prev, [size]: val }));
  };

  // HTML5 Image Compression before Upload
  const compressImageFile = (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize if width exceeds boundary
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  });
                  resolve(compressed);
                } else {
                  resolve(file);
                }
              },
              "image/jpeg",
              quality
            );
          } else {
            resolve(file);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Image Upload logic (Supabase Storage direct with progress callback)
  const handleImagesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    await uploadFilesList(Array.from(files));
  };

  const uploadFilesList = async (files: File[]) => {
    const allowedFormats = ["image/jpeg", "image/png", "image/webp"];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    const validFiles = files.filter((f) => {
      const isFormatValid = allowedFormats.includes(f.type);
      const isSizeValid = f.size <= maxFileSize;
      return isFormatValid && isSizeValid;
    });

    const invalidFiles = files.filter((f) => !allowedFormats.includes(f.type) || f.size > maxFileSize);
    if (invalidFiles.length > 0) {
      const details = invalidFiles.map(
        (f) => `${f.name} (${f.size > maxFileSize ? "exceeds 10MB limit" : "unsupported file format"})`
      );
      alert(`The following files were rejected:\n\n${details.join("\n")}`);
    }

    if (validFiles.length === 0) return;
    setIsFormDirty(true);

    const newUploading = validFiles.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${file.name}`,
      name: file.name,
      progress: 0,
      isCompleted: false,
    }));

    setUploadingFiles((prev) => [...prev, ...newUploading]);

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const stateId = newUploading[i].id;

      try {
        // Run canvas image compression before sending to Supabase Storage
        const compressedFile = await compressImageFile(file);

        const publicUrl = await uploadProductImage(compressedFile, "products", (percent) => {
          setUploadingFiles((prev) =>
            prev.map((up) => (up.id === stateId ? { ...up, progress: percent } : up))
          );
        });

        setFormImages((prev) => {
          const next = [
            ...prev,
            {
              imageUrl: publicUrl,
              isPrimary: prev.length === 0,
              displayOrder: prev.length,
            },
          ];
          return next;
        });

        setUploadingFiles((prev) =>
          prev.map((up) => (up.id === stateId ? { ...up, isCompleted: true } : up))
        );
      } catch (err: any) {
        setUploadingFiles((prev) =>
          prev.map((up) => (up.id === stateId ? { ...up, error: err.message || "Failed" } : up))
        );
      }
    }
  };

  const deleteFormImage = (index: number) => {
    setIsFormDirty(true);
    setFormImages((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      const hasCover = next.some((img) => img.isPrimary);
      return next.map((img, idx) => ({
        ...img,
        displayOrder: idx,
        isPrimary: !hasCover && idx === 0 ? true : img.isPrimary,
      }));
    });
  };

  const setAsCover = (index: number) => {
    setIsFormDirty(true);
    setFormImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    );
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    setIsFormDirty(true);
    setFormImages((prev) => {
      const next = [...prev];
      const swapIndex = direction === "left" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= next.length) return prev;

      const temp = next[index];
      next[index] = next[swapIndex];
      next[swapIndex] = temp;

      return next.map((img, idx) => ({ ...img, displayOrder: idx }));
    });
  };

  // HTML5 Image Cropping Dialog logic
  const openCropModal = (index: number) => {
    setCroppingIndex(index);
    setCropBox({ x: 10, y: 10, w: 80, h: 80 });
    setCropImageLoaded(false);
  };

  const handleCropImageLoad = () => {
    setCropImageLoaded(true);
    drawCropOverlay();
  };

  const drawCropOverlay = () => {
    const canvas = cropCanvasRef.current;
    const img = cropImgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw scaled preview inside crop canvas
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);

    // Draw dark overlay mask
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    
    // Top box
    ctx.fillRect(0, 0, canvas.width, (cropBox.y * canvas.height) / 100);
    // Bottom box
    ctx.fillRect(
      0,
      ((cropBox.y + cropBox.h) * canvas.height) / 100,
      canvas.width,
      ((100 - cropBox.y - cropBox.h) * canvas.height) / 100
    );
    // Left box
    ctx.fillRect(
      0,
      (cropBox.y * canvas.height) / 100,
      (cropBox.x * canvas.width) / 100,
      (cropBox.h * canvas.height) / 100
    );
    // Right box
    ctx.fillRect(
      ((cropBox.x + cropBox.w) * canvas.width) / 100,
      (cropBox.y * canvas.height) / 100,
      ((100 - cropBox.x - cropBox.w) * canvas.width) / 100,
      (cropBox.h * canvas.height) / 100
    );

    // Draw gold boundary box
    ctx.strokeStyle = "#C5A880";
    ctx.lineWidth = 4;
    ctx.strokeRect(
      (cropBox.x * canvas.width) / 100,
      (cropBox.y * canvas.height) / 100,
      (cropBox.w * canvas.width) / 100,
      (cropBox.h * canvas.height) / 100
    );
  };

  useEffect(() => {
    if (croppingIndex !== null && cropImageLoaded) {
      drawCropOverlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropBox, croppingIndex, cropImageLoaded]);

  const applyCrop = async () => {
    if (croppingIndex === null) return;
    const img = cropImgRef.current;
    if (!img) return;

    setIsSaving(true);

    const canvas = document.createElement("canvas");
    const sx = (cropBox.x * img.naturalWidth) / 100;
    const sy = (cropBox.y * img.naturalHeight) / 100;
    const sw = (cropBox.w * img.naturalWidth) / 100;
    const sh = (cropBox.h * img.naturalHeight) / 100;

    canvas.width = sw;
    canvas.height = sh;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          const croppedFile = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
          const publicUrl = await uploadProductImage(croppedFile, "products");
          
          setFormImages((prev) =>
            prev.map((item, idx) => (idx === croppingIndex ? { ...item, imageUrl: publicUrl } : item))
          );
          setIsFormDirty(true);
          setCroppingIndex(null);
        } catch (err: any) {
          alert(`Failed to upload cropped image: ${err.message}`);
        } finally {
          setIsSaving(false);
        }
      }
    }, "image/jpeg", 0.85);
  };

  const handleSaveProduct = async () => {
    if (!formFields.name || !formFields.sku || !formFields.price || !formFields.categoryId) {
      setFormError("Product Name, SKU, Category, and Price are required.");
      setFormStep(1);
      return;
    }

    // SKU uniqueness validation
    const skuExists = products.some(
      (p) => p.sku.toLowerCase() === formFields.sku.trim().toLowerCase() && p.id !== editingProduct?.id
    );
    if (skuExists) {
      setFormError(`Product SKU "${formFields.sku.trim()}" is already assigned to another product.`);
      setFormStep(3);
      return;
    }

    // Price validation
    const priceNum = parseFloat(formFields.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("Selling Price must be a valid positive number.");
      setFormStep(3);
      return;
    }
    if (formFields.compareAtPrice) {
      const compareNum = parseFloat(formFields.compareAtPrice);
      if (isNaN(compareNum) || compareNum <= 0) {
        setFormError("Compare At/MRP Price must be a valid positive number.");
        setFormStep(3);
        return;
      }
      if (priceNum > compareNum) {
        setFormError("Selling Price cannot be greater than Compare At Price (MRP).");
        setFormStep(3);
        return;
      }
    }

    // Stock allocation validation
    for (const size of SIZES_LIST) {
      const stockVal = sizeStocks[size];
      if (stockVal !== "" && (isNaN(Number(stockVal)) || parseInt(stockVal) < 0)) {
        setFormError(`Stock quantity for size ${size} must be a non-negative integer.`);
        setFormStep(4);
        return;
      }
    }

    setIsSaving(true);
    setFormError("");

    const variants = SIZES_LIST.map((size) => ({
      size,
      stock: Math.max(0, parseInt(sizeStocks[size]) || 0),
      sku: `${formFields.sku}-${size.toUpperCase()}`,
    }));

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    const payload = {
      id: editingProduct?.id || undefined,
      categoryId: formFields.categoryId,
      productName: formFields.name.trim(),
      name: formFields.name.trim(),
      sku: formFields.sku.trim(),
      price: parseFloat(formFields.price) || 0,
      compareAtPrice: formFields.compareAtPrice ? parseFloat(formFields.compareAtPrice) : undefined,
      discountPrice: formFields.compareAtPrice ? parseFloat(formFields.price) : undefined,
      description: formFields.description.trim(),
      material: formFields.material.trim(),
      brand: formFields.brand.trim() || "SSS Boutique",
      careInstructions: formFields.careInstructions.trim(),
      featured: false,
      active: formFields.status === "published",
      images: formImages.map((img) => ({
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary,
        displayOrder: img.displayOrder,
      })),
      variants,
      inventory: totalStock,
      metaTitle: formFields.seoTitle.trim() || undefined,
      metaDescription: formFields.seoDescription.trim() || undefined,
    };

    try {
      const res = await saveProduct(payload);
      if (res.success) {
        const draftKey = editingProduct ? `sss_draft_${editingProduct.id}` : "sss_draft_new";
        localStorage.removeItem(draftKey);
        setIsFormDirty(false);
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
        active: false,
        images: product.images.map((img) => ({
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary,
          displayOrder: img.displayOrder,
        })),
        variants: product.variants.map((v) => ({ 
          size: v.size, 
          stock: v.stock, 
          sku: `${clonedSku}-${v.size.toUpperCase()}` 
        })),
        inventory: product.stock,
        metaTitle: product.metaTitle ? `${product.metaTitle} (Copy)` : undefined,
        metaDescription: product.metaDescription || undefined,
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

  // Bulk Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete the ${selectedIds.length} selected products?`)) return;
    
    setLoading(true);
    let successCount = 0;
    for (const id of selectedIds) {
      try {
        const res = await removeProduct(id);
        if (res.success) successCount++;
      } catch (err) {
        console.error("Bulk delete error for id:", id, err);
      }
    }
    setSelectedIds([]);
    await loadData();
    alert(`Successfully deleted ${successCount} products.`);
  };

  const handleBulkPublish = async (publish: boolean) => {
    if (selectedIds.length === 0) return;
    const actionLabel = publish ? "Publish" : "Archive";
    if (!confirm(`Are you sure you want to ${actionLabel.toLowerCase()} the ${selectedIds.length} selected products?`)) return;

    setLoading(true);
    let successCount = 0;
    for (const id of selectedIds) {
      const p = products.find((prod) => prod.id === id);
      if (p) {
        try {
          const res = await saveProduct({ ...p, active: publish });
          if (res.success) successCount++;
        } catch (err) {
          console.error(`Bulk ${actionLabel.toLowerCase()} error for id:`, id, err);
        }
      }
    }
    setSelectedIds([]);
    await loadData();
    alert(`Successfully ${publish ? "published" : "archived/unpublished"} ${successCount} products.`);
  };

  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;
    const targetProducts = products.filter((p) => selectedIds.includes(p.id));

    const headers = ["Name", "SKU", "Category", "Price", "Discount Price", "Stock", "Material", "Status", "Images"];
    const rows = targetProducts.map((p) => {
      const catName = categories.find((c) => c.id === p.categoryId)?.name || "";
      const imagesStr = p.images.map((img) => img.imageUrl).join(";");
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.sku}"`,
        `"${catName}"`,
        p.price,
        p.discountPrice || "",
        p.stock,
        `"${(p.material || "").replace(/"/g, '""')}"`,
        p.active ? "Published" : "Draft",
        `"${imagesStr}"`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sss_products_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered and Sorted Products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(search.toLowerCase()) || prod.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || prod.categoryId === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === "out") matchesStock = prod.stock === 0;
    else if (stockFilter === "low") matchesStock = prod.stock > 0 && prod.stock < 5;
    else if (stockFilter === "in") matchesStock = prod.stock >= 5;

    let matchesStatus = true;
    if (statusFilter === "published") matchesStatus = prod.active;
    else if (statusFilter === "draft") matchesStatus = !prod.active;

    return matchesSearch && matchesCategory && matchesStock && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === "price") {
      comparison = a.price - b.price;
    } else if (sortBy === "stock") {
      comparison = a.stock - b.stock;
    } else if (sortBy === "createdAt") {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const primaryPreviewImg = formImages.find((img) => img.isPrimary)?.imageUrl || formImages[0]?.imageUrl || "";

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

      {/* FILTER & SORT BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-zinc-400">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products/SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none pl-9 pr-3 py-2.5 focus:outline-none focus:border-accent text-white"
          />
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
        </div>

        <div className="flex items-center space-x-2">
          <span>Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
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
            onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
          >
            <option value="all">All Levels</option>
            <option value="in">In Stock</option>
            <option value="low">{"Low Stock (< 5)"}</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span>Publish status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* BULK ACTIONS TOOLBAR */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121212] border border-accent/20 p-3.5 flex items-center justify-between text-xs"
        >
          <span className="font-bold text-accent">
            {selectedIds.length} Products Selected
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBulkExport}
              className="flex items-center space-x-1.5 border border-zinc-700 bg-[#0A0A0A] text-zinc-300 px-3 py-1.5 hover:bg-zinc-800 transition font-bold uppercase tracking-wider text-[9px]"
            >
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleBulkPublish(true)}
              className="flex items-center space-x-1.5 border border-zinc-700 bg-[#0A0A0A] text-zinc-300 px-3 py-1.5 hover:bg-zinc-800 transition font-bold uppercase tracking-wider text-[9px]"
            >
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Bulk Publish</span>
            </button>
            <button
              onClick={() => handleBulkPublish(false)}
              className="flex items-center space-x-1.5 border border-zinc-700 bg-[#0A0A0A] text-zinc-300 px-3 py-1.5 hover:bg-zinc-800 transition font-bold uppercase tracking-wider text-[9px]"
            >
              <Archive className="w-3 h-3 text-amber-500" />
              <span>Bulk Archive</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-1.5 border border-rose-950 bg-[#0A0A0A] text-rose-455 px-3 py-1.5 hover:bg-rose-950/20 transition font-bold uppercase tracking-wider text-[9px]"
            >
              <Trash className="w-3 h-3" />
              <span>Delete Selected</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* PRODUCTS INDEX TABLE */}
      <div className="bg-[#121212] border border-[#1C1C1C] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1C1C1C] text-[10px] text-zinc-500 uppercase tracking-widest font-bold bg-[#0C0C0C]">
                <th className="p-4 w-10">
                  <button
                    onClick={() => {
                      if (selectedIds.length === filteredProducts.length) {
                        setSelectedIds([]);
                      } else {
                        setSelectedIds(filteredProducts.map((p) => p.id));
                      }
                    }}
                    className="focus:outline-none"
                  >
                    {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-accent" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-600" />
                    )}
                  </button>
                </th>
                <th className="p-4 cursor-pointer hover:text-white transition" onClick={() => handleSort("name")}>
                  Product details {sortBy === "name" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right cursor-pointer hover:text-white transition" onClick={() => handleSort("stock")}>
                  Inventory {sortBy === "stock" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="p-4 text-right cursor-pointer hover:text-white transition" onClick={() => handleSort("price")}>
                  Price {sortBy === "price" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C] text-zinc-300">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-zinc-500">No matching products found.</td>
                </tr>
              ) : (
                paginatedProducts.map((prod) => {
                  const firstImg = prod.images[0]?.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
                  const catName = categories.find((c) => c.id === prod.categoryId)?.name || "Edit";
                  
                  let stockLabel = "In Stock";
                  let stockColor = "text-zinc-300";
                  if (prod.stock === 0) {
                    stockLabel = "Out of Stock";
                    stockColor = "text-rose-455 font-bold";
                  } else if (prod.stock < 5) {
                    stockLabel = "Low Stock";
                    stockColor = "text-amber-400 font-bold";
                  }

                  return (
                    <tr key={prod.id} className="hover:bg-[#161616] transition">
                      <td className="p-4 text-center">
                        <button onClick={() => handleSelectRow(prod.id)} className="focus:outline-none">
                          {selectedIds.includes(prod.id) ? (
                            <CheckSquare className="w-4 h-4 text-accent" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-700 hover:text-zinc-500" />
                          )}
                        </button>
                      </td>
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
                      <td className="p-4 text-right">
                        <span className={`block font-semibold ${stockColor}`}>{prod.stock} Units</span>
                        <span className="text-[9px] text-zinc-500 block mt-0.5">{stockLabel}</span>
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
                            title={prod.active ? "Archive/Draft" : "Publish/Activate"}
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

        {/* PAGINATION SECTION */}
        {totalPages > 1 && (
          <div className="border-t border-[#1C1C1C] p-4 flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length)} of {sortedProducts.length} entries
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-[#1C1C1C] hover:border-accent disabled:opacity-30 disabled:hover:border-zinc-800 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1 font-mono text-zinc-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-[#1C1C1C] hover:border-accent disabled:opacity-30 disabled:hover:border-zinc-800 transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
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
              onClick={() => checkUnsavedClose(() => setIsModalOpen(false))}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              className="bg-[#121212] border border-[#1C1C1C] max-w-4xl w-full relative z-10 shadow-2xl p-6 flex flex-col max-h-[92vh]"
            >
              {/* Form header */}
              <div className="flex justify-between items-start border-b border-[#1C1C1C]/80 pb-4 mb-4">
                <div>
                  <h2 className="font-serif text-lg font-light text-white tracking-wide">
                    {editingProduct ? `Modify: ${editingProduct.name}` : "Create Product Catalog"}
                  </h2>
                  {autoSaveMsg && <span className="text-[10px] text-accent font-bold tracking-widest">{autoSaveMsg}</span>}
                </div>
                
                {/* Mode toggle (Edit vs Live boutique preview) */}
                <div className="flex items-center space-x-4">
                  <div className="bg-[#0A0A0A] border border-[#1C1C1C] p-0.5 flex space-x-1">
                    <button
                      type="button"
                      onClick={() => setViewMode("edit")}
                      className={`px-3 py-1 font-bold text-[9px] uppercase tracking-wider transition ${
                        viewMode === "edit" ? "bg-accent text-foreground" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Form Editor
                    </button>
                    <button
                      type="button"
                      disabled={!formFields.name}
                      onClick={() => setViewMode("preview")}
                      className={`px-3 py-1 font-bold text-[9px] uppercase tracking-wider transition ${
                        viewMode === "preview" ? "bg-accent text-foreground" : "text-zinc-400 hover:text-white disabled:opacity-30"
                      }`}
                    >
                      Boutique Preview
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => checkUnsavedClose(() => setIsModalOpen(false))}
                    className="p-1 text-zinc-500 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              {viewMode === "edit" && (
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
              )}

              {/* EDIT MODE SCREEN */}
              {viewMode === "edit" ? (
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs">
                  {formError && (
                    <div className="bg-rose-950/20 text-rose-455 border border-rose-900/35 p-3 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* STEP 1: BASIC INFO */}
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
                          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Category</label>
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
                            placeholder="e.g. 100% Silk"
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
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Description</label>
                        <textarea
                          value={formFields.description}
                          onChange={(e) => handleFieldChange("description", e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white min-h-[90px]"
                          placeholder="Detailed description of the product design, embroidery style, and heritage..."
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: DRAG & DROP MULTIPLE UPLOADS */}
                  {formStep === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Upload product images (Supports JPEG, PNG, WEBP up to 10MB)</span>
                      
                      {/* Drag and drop zone */}
                      <div
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          const files = e.dataTransfer.files;
                          if (files) await uploadFilesList(Array.from(files));
                        }}
                        className="border-2 border-dashed border-[#1F1F1F] bg-[#0A0A0A] hover:border-zinc-700 p-6 flex flex-col items-center justify-center text-center transition"
                      >
                        <input
                          type="file"
                          id="prod-images-select"
                          multiple
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImagesSelect}
                          className="hidden"
                        />
                        <label htmlFor="prod-images-select" className="cursor-pointer flex flex-col items-center justify-center space-y-1.5">
                          <Upload className="w-6 h-6 text-zinc-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Drag files here or click to upload</span>
                          <span className="text-[9px] text-zinc-500">Auto-compresses images before upload. Maximum size: 10MB.</span>
                        </label>
                      </div>

                      {/* Upload progress items */}
                      {uploadingFiles.length > 0 && (
                        <div className="space-y-2 border border-[#1C1C1C] p-3 bg-[#0A0A0A] max-h-28 overflow-y-auto">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">Upload Status</span>
                          {uploadingFiles.map((up) => (
                            <div key={up.id} className="space-y-1">
                              <div className="flex justify-between items-center text-[9px] font-mono">
                                <span className="truncate w-2/3 text-zinc-400">{up.name}</span>
                                {up.error ? (
                                  <span className="text-rose-455 font-bold">Failed: {up.error}</span>
                                ) : up.isCompleted ? (
                                  <span className="text-emerald-450 font-bold">Completed</span>
                                ) : (
                                  <span className="text-accent">{up.progress}%</span>
                                )}
                              </div>
                              {!up.isCompleted && !up.error && (
                                <div className="w-full bg-zinc-800 h-0.5 rounded-none overflow-hidden">
                                  <div className="bg-accent h-full transition-all duration-200" style={{ width: `${up.progress}%` }} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Previews & Image Settings (Reordering, Primary selection, Crop, Delete) */}
                      {formImages.length > 0 && (
                        <div className="space-y-3">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Product Gallery ({formImages.length} Images)</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
                            {formImages.map((img, idx) => (
                              <div key={idx} className="flex border border-[#1C1C1C] bg-[#0A0A0A] p-2 items-center justify-between space-x-2">
                                <div className="flex items-center space-x-3 w-3/5 min-w-0">
                                  <div className="w-12 h-16 border border-zinc-800 bg-zinc-950 overflow-hidden flex-shrink-0">
                                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Order: {img.displayOrder + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => setAsCover(idx)}
                                      className={`block text-[9px] uppercase tracking-wide font-bold mt-1 px-1.5 py-0.5 border transition ${
                                        img.isPrimary
                                          ? "bg-accent/20 border-accent text-accent"
                                          : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                                      }`}
                                    >
                                      {img.isPrimary ? "Cover Image" : "Make Cover"}
                                    </button>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end space-y-1">
                                  <div className="flex space-x-1">
                                    <button
                                      type="button"
                                      onClick={() => openCropModal(idx)}
                                      className="p-1 border border-zinc-800 hover:border-accent bg-zinc-900 text-zinc-400 hover:text-white"
                                      title="Crop Image"
                                    >
                                      <Crop className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => moveImage(idx, "left")}
                                      className="p-1 border border-zinc-800 hover:border-zinc-650 bg-zinc-900 disabled:opacity-20"
                                      title="Move Left"
                                    >
                                      <ArrowUp className="w-3 h-3 text-zinc-400 rotate-[-90deg]" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === formImages.length - 1}
                                      onClick={() => moveImage(idx, "right")}
                                      className="p-1 border border-zinc-800 hover:border-zinc-650 bg-zinc-900 disabled:opacity-20"
                                      title="Move Right"
                                    >
                                      <ArrowDown className="w-3 h-3 text-zinc-400 rotate-[-90deg]" />
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => deleteFormImage(idx)}
                                    className="text-[9px] uppercase tracking-wider font-bold text-rose-455 hover:bg-rose-950/20 border border-rose-950/20 px-2 py-0.5"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* STEP 3: PRICING & SKU */}
                  {formStep === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Product SKU (Required)</label>
                          <button
                            type="button"
                            onClick={() => {
                              const catName = categories.find((c) => c.id === formFields.categoryId)?.name || "GEN";
                              const catCode = catName.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
                              const nameCode = (formFields.name || "PRD").slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
                              const rand = Math.floor(1000 + Math.random() * 9000);
                              handleFieldChange("sku", `${catCode}-${nameCode}-${rand}`);
                            }}
                            className="text-[9px] uppercase tracking-wider font-bold text-accent hover:underline focus:outline-none"
                          >
                            Auto Generate SKU
                          </button>
                        </div>
                        <input
                          type="text"
                          value={formFields.sku}
                          onChange={(e) => handleFieldChange("sku", e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white font-mono"
                          placeholder="e.g. SLK-BANARASI-PK-01"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Selling Price (₹)</label>
                          <input
                            type="number"
                            value={formFields.price}
                            onChange={(e) => handleFieldChange("price", e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white font-mono"
                            placeholder="e.g. 5999"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Compare At Price / MRP (₹)</label>
                          <input
                            type="number"
                            value={formFields.compareAtPrice}
                            onChange={(e) => handleFieldChange("compareAtPrice", e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white font-mono"
                            placeholder="e.g. 8999"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: SIZE STOCK LEVEL ALLOCATION */}
                  {formStep === 4 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Allocate stock units per size variant</span>
                      
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
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
                          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white font-mono"
                          placeholder="e.g. pink-banarasi-silk-saree"
                        />
                      </div>

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
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">SEO Meta Description</label>
                        <textarea
                          value={formFields.seoDescription}
                          onChange={(e) => handleFieldChange("seoDescription", e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2.5 focus:outline-none focus:border-accent text-white min-h-[60px]"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 6: PUBLISH OPTION */}
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
                          <p className="text-[9px] text-zinc-500 text-center leading-relaxed">Product goes live immediately on the boutique storefront.</p>
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
                          <p className="text-[9px] text-zinc-500 text-center leading-relaxed">Product remains hidden in draft mode for editing.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                /* LIVE BOUTIQUE PREVIEW MODE */
                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs p-2 select-none">
                  {/* Left Column: Premium Gallery Mockup */}
                  <div className="space-y-4">
                    <div className="aspect-[3/4] w-full bg-zinc-950 border border-zinc-900 relative overflow-hidden flex items-center justify-center">
                      {primaryPreviewImg ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={primaryPreviewImg}
                          alt="Main Preview"
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-zinc-650 flex flex-col items-center space-y-2">
                          <Layers className="w-8 h-8" />
                          <span className="text-[10px] uppercase tracking-widest font-bold">No Image Uploaded</span>
                        </div>
                      )}
                    </div>

                    {formImages.length > 1 && (
                      <div className="flex space-x-2 overflow-x-auto pb-1">
                        {formImages.map((img, idx) => (
                          <div
                            key={idx}
                            className={`w-14 h-16 border flex-shrink-0 bg-zinc-900 overflow-hidden cursor-pointer ${
                              img.isPrimary ? "border-accent" : "border-zinc-800"
                            }`}
                          >
                            <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Premium Details Pane */}
                  <div className="space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] text-accent uppercase tracking-[0.25em] font-bold block">
                          {categories.find((c) => c.id === formFields.categoryId)?.name || "Category"}
                        </span>
                        <h1 className="font-serif text-2xl text-white tracking-wide mt-1 leading-normal font-light">
                          {formFields.name || "Untitled Designer Masterpiece"}
                        </h1>
                        <span className="text-[9px] text-zinc-500 font-mono mt-1 block">SKU: {formFields.sku || "PENDING"}</span>
                      </div>

                      {/* Live Pricing (Selling vs MRP) */}
                      <div className="flex items-baseline space-x-3">
                        <span className="text-lg font-bold text-accent font-mono">
                          {formFields.price ? formatPrice(parseFloat(formFields.price)) : "₹0.00"}
                        </span>
                        {formFields.compareAtPrice && parseFloat(formFields.compareAtPrice) > (parseFloat(formFields.price) || 0) && (
                          <>
                            <span className="text-xs text-zinc-500 line-through font-mono">
                              {formatPrice(parseFloat(formFields.compareAtPrice))}
                            </span>
                            <span className="text-[9px] text-emerald-450 uppercase font-bold tracking-wider">
                              ({Math.round(((parseFloat(formFields.compareAtPrice) - parseFloat(formFields.price)) / parseFloat(formFields.compareAtPrice)) * 100)}% Off)
                            </span>
                          </>
                        )}
                      </div>

                      {/* Sizes Allocation Grid */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Available Sizes</span>
                        <div className="flex flex-wrap gap-2">
                          {SIZES_LIST.map((size) => {
                            const stock = parseInt(sizeStocks[size]) || 0;
                            return (
                              <button
                                key={size}
                                disabled={stock === 0}
                                className={`px-3.5 py-1.5 border text-[9px] font-bold tracking-wider transition ${
                                  stock === 0
                                    ? "border-zinc-900 text-zinc-700 line-through cursor-not-allowed"
                                    : "border-zinc-800 text-zinc-300 hover:border-accent hover:text-accent"
                                }`}
                              >
                                {size} {stock > 0 && stock < 5 && `(${stock} left)`}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Short details */}
                      <div className="space-y-1 bg-[#0A0A0A] p-3 border border-[#1A1A1A] text-zinc-400 text-[11px] leading-relaxed">
                        {formFields.material && <p><strong className="text-zinc-200">Fabric:</strong> {formFields.material}</p>}
                        {formFields.careInstructions && <p><strong className="text-zinc-200">Care:</strong> {formFields.careInstructions}</p>}
                      </div>

                      {/* Long Description */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Description</span>
                        <p className="text-zinc-400 font-light leading-relaxed text-[11px]">
                          {formFields.description || "No description provided yet."}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full bg-accent text-foreground text-[10px] font-bold uppercase tracking-widest py-3 hover:bg-accent/90 transition shadow-luxury"
                    >
                      Add To Shopping Bag
                    </button>
                  </div>
                </div>
              )}

              {/* Wizard Nav buttons */}
              {viewMode === "edit" && (
                <div className="flex justify-between items-center border-t border-[#1C1C1C]/80 pt-4 mt-6">
                  <div>
                    {formStep > 1 && (
                      <button
                        type="button"
                        onClick={() => setFormStep((s) => s - 1)}
                        className="flex items-center space-x-1.5 text-zinc-400 hover:text-white uppercase font-bold tracking-wider text-[10px] transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => checkUnsavedClose(() => setIsModalOpen(false))}
                      className="px-4 py-2 border border-[#1C1C1C] hover:bg-zinc-900 transition text-[10px] uppercase font-bold tracking-wider"
                    >
                      Cancel
                    </button>
                    
                    {formStep < 6 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (formStep === 1 && !formFields.name) {
                            setFormError("Product Name is required");
                            return;
                          }
                          setFormError("");
                          setFormStep((s) => s + 1);
                        }}
                        className="px-5 py-2 bg-zinc-800 text-white hover:bg-zinc-750 transition text-[10px] uppercase font-bold tracking-wider flex items-center space-x-1"
                      >
                        <span>Continue</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={handleSaveProduct}
                        className="px-6 py-2 bg-accent text-foreground hover:bg-accent/90 transition text-[10px] uppercase font-bold tracking-wider disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Save Product"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CROPPER DIALOG MODAL */}
      <AnimatePresence>
        {croppingIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] border border-[#1C1C1C] max-w-lg w-full relative z-10 shadow-2xl p-6 flex flex-col space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[#1C1C1C] pb-3">
                <h3 className="font-serif text-sm text-white tracking-wide">Crop & Compress Product Image</h3>
                <button
                  type="button"
                  onClick={() => setCroppingIndex(null)}
                  className="p-1 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Hidden source image to load dimensions */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={cropImgRef}
                src={formImages[croppingIndex]?.imageUrl}
                alt=""
                className="hidden"
                crossOrigin="anonymous"
                onLoad={handleCropImageLoad}
              />

              {/* Canvas viewport */}
              <div className="w-full aspect-[4/3] bg-zinc-950 flex items-center justify-center overflow-hidden border border-zinc-900 relative">
                <canvas ref={cropCanvasRef} className="max-w-full max-h-full object-contain" />
                {!cropImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-accent animate-spin" />
                  </div>
                )}
              </div>

              {/* Sliders for Crop Box adjust */}
              {cropImageLoaded && (
                <div className="space-y-2 text-[10px] text-zinc-400 font-bold uppercase tracking-wider bg-[#0C0C0C] p-3 border border-[#1C1C1C]">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Crop Width ({cropBox.w}%)</span>
                      <span className="text-zinc-600 font-mono">Size Adjust</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={cropBox.w}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCropBox((prev) => ({
                          ...prev,
                          w: val,
                          h: val, // maintain square aspect ratio
                          x: Math.min(prev.x, 100 - val),
                          y: Math.min(prev.y, 100 - val),
                        }));
                      }}
                      className="w-full accent-accent bg-zinc-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1">
                      <span>Horizontal Position ({cropBox.x}%)</span>
                      <input
                        type="range"
                        min="0"
                        max={100 - cropBox.w}
                        value={cropBox.x}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setCropBox((prev) => ({ ...prev, x: val }));
                        }}
                        className="w-full accent-accent bg-zinc-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <span>Vertical Position ({cropBox.y}%)</span>
                      <input
                        type="range"
                        min="0"
                        max={100 - cropBox.h}
                        value={cropBox.y}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setCropBox((prev) => ({ ...prev, y: val }));
                        }}
                        className="w-full accent-accent bg-zinc-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#1C1C1C]">
                <button
                  type="button"
                  onClick={() => setCroppingIndex(null)}
                  className="px-4 py-2 border border-[#1C1C1C] hover:bg-zinc-900 transition text-[9px] uppercase font-bold tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCrop}
                  className="px-5 py-2 bg-accent text-foreground hover:bg-accent/90 transition text-[9px] uppercase font-bold tracking-wider"
                >
                  Apply Crop
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
