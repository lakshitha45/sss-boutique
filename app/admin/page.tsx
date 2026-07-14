"use client";

import React, { useEffect, useState } from "react";
import { fetchOrders, changeOrderStatus } from "@/features/orders/orderActions";
import { fetchProducts, updateVariantStock } from "@/features/products/productActions";
import { Order, Product } from "@/types";
import { formatPrice } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, ShoppingBag, FolderHeart, AlertTriangle, Users, TrendingUp, TrendingDown, ArrowRight, Sparkles, Check, Edit2, Save } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Low Stock Widget State
  const [selectedLowProd, setSelectedLowProd] = useState<Product | null>(null);
  const [lowStockQty, setLowStockQty] = useState("");
  const [updatingLowStockId, setUpdatingLowStockId] = useState<string | null>(null);
  const [updateSuccessId, setUpdateSuccessId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [allOrders, allProducts] = await Promise.all([fetchOrders(), fetchProducts(true)]);
      setOrders(allOrders);
      setProducts(allProducts);
      
      // Default low stock selection to first item under 5 stock
      const lowInv = allProducts.filter((p) => p.stock < 5 && p.active);
      if (lowInv.length > 0 && !selectedLowProd) {
        setSelectedLowProd(lowInv[0]);
        setLowStockQty(lowInv[0].variants[0]?.stock.toString() || "0");
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateLowStock = async () => {
    if (!selectedLowProd) return;
    setUpdatingLowStockId(selectedLowProd.id);

    // Flat allocate edited quantity to first size variant for simplicity
    const newQty = Math.max(0, parseInt(lowStockQty) || 0);
    const updatedVariants = selectedLowProd.variants.map((v, i) => ({
      size: v.size,
      stock: i === 0 ? newQty : v.stock,
      sku: v.sku,
    }));

    try {
      const res = await updateVariantStock(selectedLowProd.id, updatedVariants);
      if (res.success) {
        setUpdateSuccessId(selectedLowProd.id);
        setTimeout(() => setUpdateSuccessId(null), 2000);
        loadData();
      } else {
        alert(res.error || "Failed to update stock");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update stock");
    } finally {
      setUpdatingLowStockId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate Metrics
  const completedOrders = orders.filter((o) => o.orderStatus !== "cancelled");
  const totalSales = completedOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const outOfStockCount = products.filter((p) => p.stock === 0 && p.active).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 5 && p.active).length;

  const lowInventoryProducts = products.filter((p) => p.stock < 5 && p.active);

  // Sparkline mini coordinates helpers
  const sparklineData1 = [10, 15, 8, 20, 25, 18, 30];
  const sparklineData2 = [8, 5, 12, 10, 15, 20, 18];
  const sparklineData3 = [15, 12, 10, 8, 14, 18, 22];
  const sparklineData4 = [5, 10, 15, 12, 8, 4, 2];

  const renderSparkline = (dataPoints: number[], color: string) => {
    const maxVal = Math.max(...dataPoints);
    const minVal = Math.min(...dataPoints);
    const height = 24;
    const width = 80;
    const points = dataPoints.map((val, idx) => {
      const x = (idx * width) / (dataPoints.length - 1);
      const y = height - ((val - minVal) / (maxVal - minVal || 1)) * (height - 4);
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg className="w-20 h-6">
        <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
      </svg>
    );
  };

  return (
    <div className="space-y-8 font-poppins text-zinc-100 bg-[#0A0A0A]">
      {/* Title */}
      <div className="space-y-1">
        <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Concierge Management Console</span>
        <h1 className="font-serif text-3xl font-light tracking-wide text-white">Dashboard Overview</h1>
        <div className="w-12 h-[1px] bg-accent mt-3" />
      </div>

      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury flex flex-col justify-between h-32 group hover:border-zinc-700 transition duration-300">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Total Sales Revenue</span>
              <span className="text-xl font-bold tracking-tight text-white block">{formatPrice(totalSales)}</span>
            </div>
            <div className="w-8 h-8 bg-emerald-950/20 text-emerald-400 border border-emerald-900/35 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-[#1C1C1C]/40">
            <span className="text-[10px] text-emerald-450 font-bold flex items-center space-x-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 14%</span>
            </span>
            {renderSparkline(sparklineData1, "#10B981")}
          </div>
        </div>

        {/* Orders Placed */}
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury flex flex-col justify-between h-32 group hover:border-zinc-700 transition duration-300">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Fulfillment Orders</span>
              <span className="text-xl font-bold tracking-tight text-white block">{totalOrders} checkouts</span>
            </div>
            <div className="w-8 h-8 bg-indigo-950/20 text-indigo-400 border border-indigo-900/35 flex items-center justify-center">
              <FolderHeart className="w-4 h-4" />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-[#1C1C1C]/40">
            <span className="text-[10px] text-emerald-450 font-bold flex items-center space-x-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 8.2%</span>
            </span>
            {renderSparkline(sparklineData2, "#6366F1")}
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury flex flex-col justify-between h-32 group hover:border-zinc-700 transition duration-300">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Avg Order Value (AOV)</span>
              <span className="text-xl font-bold tracking-tight text-white block">{formatPrice(avgOrderValue)}</span>
            </div>
            <div className="w-8 h-8 bg-amber-950/20 text-amber-400 border border-amber-900/35 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-[#1C1C1C]/40">
            <span className="text-[10px] text-rose-455 font-bold flex items-center space-x-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>↓ 1.4%</span>
            </span>
            {renderSparkline(sparklineData3, "#F59E0B")}
          </div>
        </div>

        {/* Inventory low alert */}
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury flex flex-col justify-between h-32 group hover:border-zinc-700 transition duration-300">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Low Stock Alert</span>
              <span className={`text-xl font-bold tracking-tight block ${outOfStockCount > 0 || lowStockCount > 0 ? "text-rose-455" : "text-white"}`}>
                {outOfStockCount + lowStockCount} Items
              </span>
            </div>
            <div className={`w-8 h-8 flex items-center justify-center border ${
              outOfStockCount > 0 || lowStockCount > 0
                ? "bg-rose-950/20 text-rose-455 border-rose-900/35 animate-pulse"
                : "bg-zinc-800/40 text-zinc-500 border-zinc-700/35"
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-[#1C1C1C]/40">
            <span className="text-[9px] text-zinc-500 font-mono">
              {outOfStockCount} empty • {lowStockCount} critical
            </span>
            {renderSparkline(sparklineData4, "#EF4444")}
          </div>
        </div>
      </div>

      {/* GRAPH CHART & LOW STOCK WIDGET ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SVG line chart (left 7 cols) */}
        <div className="lg:col-span-8 bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-serif text-base font-semibold text-white tracking-wide">Sales Analytics</h3>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mt-0.5">Month-on-month revenue trends</span>
            </div>
            <Link href="/admin/analytics" className="text-[10px] text-accent font-bold uppercase tracking-wider hover:underline flex items-center space-x-1">
              <span>Full Reports</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="relative pt-4 w-full overflow-x-auto">
            {/* SVG line chart */}
            <svg viewBox="0 0 500 160" className="w-full min-w-[400px] h-auto">
              <line x1="40" y1="10" x2="480" y2="10" stroke="#1F1F1F" strokeWidth="1" />
              <line x1="40" y1="80" x2="480" y2="80" stroke="#1F1F1F" strokeWidth="1" />
              <line x1="40" y1="150" x2="480" y2="150" stroke="#2E2E2E" strokeWidth="1" />
              
              <polyline
                fill="none"
                stroke="url(#grad)"
                strokeWidth="2.5"
                points="50,130 120,95 190,110 260,70 330,55 400,25 470,12"
              />
              <circle cx="50" cy="130" r="3.5" fill="#C5A880" />
              <circle cx="120" cy="95" r="3.5" fill="#C5A880" />
              <circle cx="190" cy="110" r="3.5" fill="#C5A880" />
              <circle cx="260" cy="70" r="3.5" fill="#C5A880" />
              <circle cx="330" cy="55" r="3.5" fill="#C5A880" />
              <circle cx="400" cy="25" r="3.5" fill="#C5A880" />
              <circle cx="470" cy="12" r="3.5" fill="#C5A880" />
              
              <text x="50" y="160" fill="#71717a" fontSize="8" textAnchor="middle">Jan</text>
              <text x="120" y="160" fill="#71717a" fontSize="8" textAnchor="middle">Feb</text>
              <text x="190" y="160" fill="#71717a" fontSize="8" textAnchor="middle">Mar</text>
              <text x="260" y="160" fill="#71717a" fontSize="8" textAnchor="middle">Apr</text>
              <text x="330" y="160" fill="#71717a" fontSize="8" textAnchor="middle">May</text>
              <text x="400" y="160" fill="#71717a" fontSize="8" textAnchor="middle">Jun</text>
              <text x="470" y="160" fill="#71717a" fontSize="8" textAnchor="middle">Jul</text>
              
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D45D79" />
                  <stop offset="100%" stopColor="#C5A880" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Low Stock Adjuster widget (right 4 cols) */}
        <div className="lg:col-span-4 bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-base font-semibold text-white tracking-wide flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Low Stock Widget</span>
              </h3>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mt-0.5">Quickly restore stock counts</span>
            </div>

            {lowInventoryProducts.length === 0 ? (
              <p className="text-zinc-500 font-light text-xs py-8 text-center">All active products hold healthy stock levels.</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Select Critical Product</label>
                  <select
                    value={selectedLowProd?.id || ""}
                    onChange={(e) => {
                      const found = lowInventoryProducts.find((p) => p.id === e.target.value);
                      if (found) {
                        setSelectedLowProd(found);
                        setLowStockQty(found.variants[0]?.stock.toString() || "0");
                      }
                    }}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white text-xs"
                  >
                    {lowInventoryProducts.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                    ))}
                  </select>
                </div>

                {selectedLowProd && (
                  <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-3 space-y-2.5 text-xs text-zinc-400">
                    <div className="flex justify-between items-center text-[10px]">
                      <span>SKU Root:</span>
                      <span className="font-mono text-white font-bold">{selectedLowProd.sku}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">Size {selectedLowProd.variants[0]?.size || "XS"} Quantity:</span>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="text"
                          value={lowStockQty}
                          onChange={(e) => {
                            if (!isNaN(Number(e.target.value)) || e.target.value === "") {
                              setLowStockQty(e.target.value);
                            }
                          }}
                          className="w-16 bg-[#121212] border border-[#1C1C1C] rounded-none px-2 py-1 text-center text-white font-mono"
                          placeholder="0"
                        />
                        <span className="text-zinc-500">Units</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedLowProd && lowInventoryProducts.length > 0 && (
            <button
              onClick={handleUpdateLowStock}
              disabled={updatingLowStockId === selectedLowProd.id}
              className="w-full mt-4 flex items-center justify-center space-x-2 bg-accent text-foreground hover:bg-accent/90 disabled:bg-zinc-800 transition py-3 font-bold uppercase tracking-wider text-[10px]"
            >
              {updatingLowStockId === selectedLowProd.id ? (
                <div className="w-3.5 h-3.5 border border-t-transparent border-foreground animate-spin rounded-full" />
              ) : (
                updateSuccessId === selectedLowProd.id ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )
              )}
              <span>{updateSuccessId === selectedLowProd.id ? "Stock Saved!" : "Restore Inventory"}</span>
            </button>
          )}
        </div>

      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif text-base font-semibold text-white tracking-wide">Recent Store Activity</h3>
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mt-0.5">Latest order checkout payments</span>
          </div>
          <Link href="/admin/orders" className="text-[10px] text-accent font-bold uppercase tracking-wider hover:underline flex items-center space-x-1">
            <span>Manage Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1C1C1C] text-[9px] text-zinc-500 uppercase tracking-widest font-bold bg-[#0C0C0C]">
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Payment Status</th>
                <th className="p-3 text-right">Total charged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C] text-zinc-300">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500">No checkout orders recorded yet.</td>
                </tr>
              ) : (
                orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#161616] transition">
                    <td className="p-3 font-mono font-bold text-white">{ord.id}</td>
                    <td className="p-3">
                      <div>
                        <span className="font-medium text-white block">{ord.customerName}</span>
                        <span className="text-[9px] text-zinc-500 block font-mono mt-0.5">{ord.customerEmail}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border text-[8px] font-bold uppercase tracking-wider rounded-none ${
                        ord.orderStatus === "delivered"
                          ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/35"
                          : ord.orderStatus === "cancelled"
                          ? "bg-rose-950/20 text-rose-455 border-rose-900/35"
                          : "bg-amber-950/20 text-amber-400 border-amber-900/35"
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 border text-[8px] font-bold uppercase tracking-wider rounded-none ${
                        ord.paymentStatus === "paid"
                          ? "bg-emerald-950/20 text-emerald-450 border-emerald-900/35"
                          : "bg-amber-950/20 text-amber-400 border-amber-900/35"
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-accent">{formatPrice(ord.grandTotal)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
