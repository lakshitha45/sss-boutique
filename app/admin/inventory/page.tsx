"use client";

import React, { useEffect, useState } from "react";
import { fetchProducts, fetchCategories, updateVariantStock } from "@/features/products/productActions";
import { Product, Category } from "@/types";
import { formatPrice } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronUp, Save, CheckCircle, Package, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingStocks, setEditingStocks] = useState<Record<string, Record<string, string>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([fetchProducts(true), fetchCategories()]);
      setProducts(prods);
      setCategories(cats);

      // Initialize editing stocks local state
      const initialStocks: Record<string, Record<string, string>> = {};
      prods.forEach((p) => {
        initialStocks[p.id] = {};
        p.variants.forEach((v) => {
          initialStocks[p.id][v.size] = v.stock.toString();
        });
      });
      setEditingStocks(initialStocks);
    } catch (err) {
      console.error("Failed to load inventory data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockChange = (productId: string, size: string, val: string) => {
    if (isNaN(Number(val)) && val !== "") return;
    setEditingStocks((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: val,
      },
    }));
  };

  const handleSaveStock = async (product: Product) => {
    setSavingId(product.id);
    const updatedVariants = product.variants.map((v) => {
      const editedStock = editingStocks[product.id]?.[v.size] || "0";
      return {
        size: v.size,
        stock: Math.max(0, parseInt(editedStock) || 0),
        sku: v.sku,
      };
    });

    try {
      const res = await updateVariantStock(product.id, updatedVariants);
      if (res.success) {
        setSaveSuccessId(product.id);
        setTimeout(() => setSaveSuccessId(null), 2000);
        loadData();
      } else {
        alert(res.error || "Failed to update inventory");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update inventory");
    } finally {
      setSavingId(null);
    }
  };

  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 5).length;

  // Filtered Products list
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(search.toLowerCase()) || prod.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || prod.categoryId === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === "out") matchesStock = prod.stock === 0;
    else if (stockFilter === "low") matchesStock = prod.stock > 0 && prod.stock < 5;
    else if (stockFilter === "instock") matchesStock = prod.stock >= 5;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStockBadge = (stock: number) => {
    if (stock === 0) return "bg-rose-950/20 text-rose-455 border-rose-900/35";
    if (stock < 5) return "bg-amber-950/20 text-amber-400 border-amber-900/35";
    return "bg-zinc-800/40 text-zinc-400 border-zinc-700/35";
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
      <div className="space-y-1">
        <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Stock Management</span>
        <h1 className="font-serif text-3xl font-light tracking-wide text-white">Inventory Cockpit</h1>
        <div className="w-12 h-[1px] bg-accent mt-3" />
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Total Products</span>
            <span className="text-xl font-bold text-white block">{products.length} Items</span>
          </div>
          <Package className="w-6 h-6 text-zinc-600" />
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Total Stock Units</span>
            <span className="text-xl font-bold text-white block">{totalStockUnits} Units</span>
          </div>
          <ShieldCheck className="w-6 h-6 text-accent" />
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Out of Stock</span>
            <span className={`text-xl font-bold block ${outOfStockCount > 0 ? "text-rose-455 animate-pulse" : "text-white"}`}>
              {outOfStockCount} Items
            </span>
          </div>
          <AlertTriangle className={`w-6 h-6 ${outOfStockCount > 0 ? "text-rose-455" : "text-zinc-600"}`} />
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Low Stock Alert</span>
            <span className={`text-xl font-bold block ${lowStockCount > 0 ? "text-amber-400" : "text-white"}`}>
              {lowStockCount} Items
            </span>
          </div>
          <HelpCircle className={`w-6 h-6 ${lowStockCount > 0 ? "text-amber-400" : "text-zinc-600"}`} />
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-xs text-zinc-400">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search SKU or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none pl-9 pr-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white placeholder:text-zinc-500"
          />
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto justify-end">
          <div className="flex items-center space-x-2">
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2 focus:outline-none focus:border-accent text-white"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span>Stock Status:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2 focus:outline-none focus:border-accent text-white"
            >
              <option value="all">All Inventory</option>
              <option value="instock">{"In Stock (>= 5)"}</option>
              <option value="low">{"Low Stock (< 5)"}</option>
              <option value="out">{"Out of Stock (= 0)"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* PRODUCTS INVENTORY GRID */}
      <div className="bg-[#121212] border border-[#1C1C1C] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1C1C1C] text-[10px] text-zinc-500 uppercase tracking-widest font-bold bg-[#0C0C0C]">
                <th className="p-4 w-12"></th>
                <th className="p-4">Product details</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Fulfillment Status</th>
                <th className="p-4 text-right">Cumulative Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filteredProducts.map((prod) => {
                const isExpanded = expandedId === prod.id;
                const imagesList = prod.images || [];
                const firstImg = imagesList[0]?.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
                const catName = categories.find((c) => c.id === prod.categoryId)?.name || "Edit";
                
                return (
                  <React.Fragment key={prod.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : prod.id)}
                      className="hover:bg-[#1A1A1A] transition cursor-pointer"
                    >
                      <td className="p-4 text-center">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                      </td>
                      <td className="p-4 flex items-center space-x-3">
                        <div className="w-8 h-10 bg-zinc-950 overflow-hidden flex-shrink-0 border border-zinc-900">
                          <img src={firstImg} alt="" className="object-cover w-full h-full" />
                        </div>
                        <div>
                          <span className="font-serif text-sm font-light text-white block">{prod.name}</span>
                          <span className="text-[10px] text-accent block mt-0.5">{formatPrice(prod.price)}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-zinc-400">{prod.sku}</td>
                      <td className="p-4 text-zinc-400">{catName}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider rounded-none ${getStockBadge(prod.stock)}`}>
                          {prod.stock === 0 ? "Out of Stock" : (prod.stock < 5 ? "Low Stock" : "In Stock")}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-white pr-6">{prod.stock} Units</td>
                    </tr>

                    {/* EXPANDED SIZES EDITOR ROW */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-[#0C0C0C] p-5 border-t border-[#1C1C1C]">
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 max-w-2xl text-xs"
                          >
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Sizes Variant Quantities allocation</span>
                            
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                              {prod.variants.map((v) => (
                                <div key={v.size} className="bg-[#121212] border border-[#1F1F1F] p-3 flex flex-col items-center space-y-2">
                                  <span className="font-bold text-zinc-400">{v.size}</span>
                                  <input
                                    type="text"
                                    value={editingStocks[prod.id]?.[v.size] || ""}
                                    onChange={(e) => handleStockChange(prod.id, v.size, e.target.value)}
                                    className="w-16 bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-2 py-1 text-center font-mono focus:outline-none focus:border-accent text-white"
                                    placeholder="0"
                                  />
                                  <span className="text-[9px] text-zinc-600 font-mono">{v.sku}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                              <button
                                disabled={savingId === prod.id}
                                onClick={() => handleSaveStock(prod)}
                                className="flex items-center space-x-2 bg-[#1A1A1A] hover:bg-zinc-800 text-white px-4 py-2 border border-[#262626] font-bold uppercase tracking-wider text-[9px] transition"
                              >
                                {savingId === prod.id ? (
                                  <div className="w-3 h-3 border border-t-transparent border-white animate-spin rounded-full" />
                                ) : (
                                  saveSuccessId === prod.id ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Save className="w-3.5 h-3.5 text-accent" />
                                  )
                                )}
                                <span>{saveSuccessId === prod.id ? "Updated!" : "Save Stock"}</span>
                              </button>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
