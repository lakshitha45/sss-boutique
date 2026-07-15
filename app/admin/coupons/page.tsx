"use client";

import React, { useEffect, useState } from "react";
import { Coupon } from "@/types";
import { formatPrice } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Ticket, X, RefreshCw } from "lucide-react";
import { fetchCoupons, saveCoupon, deleteCoupon } from "@/features/products/productActions";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form fields state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"fixed" | "percent">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumOrder, setMinimumOrder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [active, setActive] = useState(true);

  const loadData = async () => {
    try {
      const data = await fetchCoupons();
      setCoupons(data);
    } catch (err) {
      console.error("Failed to load coupons", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("percent");
    setDiscountValue("");
    setMinimumOrder("0");
    setExpiry(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]); // +30 days
    setUsageLimit("100");
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue.toString());
    setMinimumOrder(c.minimumOrder.toString());
    setExpiry(c.expiry);
    setUsageLimit(c.usageLimit?.toString() || "");
    setActive(c.active);
    setIsModalOpen(true);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let generated = "SSS";
    for (let i = 0; i < 6; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(generated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) {
      alert("Code and discount value are required");
      return;
    }

    const payload = {
      id: editingCoupon ? editingCoupon.id : `coup_temp_${Date.now()}`,
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: parseFloat(discountValue) || 0,
      minimumOrder: parseFloat(minimumOrder) || 0,
      expiry,
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
      active,
    };

    try {
      const res = await saveCoupon(payload);
      if (res.success) {
        setIsModalOpen(false);
        loadData();
      } else {
        alert(res.error || "Failed to save coupon");
      }
    } catch (err: any) {
      alert(err.message || "Failed to save coupon");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promotional rule coupon code?")) return;
    try {
      const res = await deleteCoupon(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || "Failed to delete coupon");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete coupon");
    }
  };

  const activeCount = coupons.filter((c) => c.active).length;

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-poppins text-zinc-100 bg-[#0A0A0A]">
      <div className="flex justify-between items-end border-b border-[#1C1C1C] pb-5">
        <div className="space-y-1">
          <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Promotions</span>
          <h1 className="font-serif text-3xl font-light tracking-wide text-white">Discount Coupons</h1>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-accent text-black font-semibold text-xs px-4 py-2.5 hover:bg-[#c39665] transition rounded-none uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Total Coupons</span>
          <span className="text-xl font-bold text-white block mt-1">{coupons.length}</span>
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Active Rules</span>
          <span className="text-xl font-bold text-emerald-400 block mt-1">{activeCount} active</span>
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Expired / Disabled</span>
          <span className="text-xl font-bold text-zinc-500 block mt-1">{coupons.length - activeCount} rules</span>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-[#121212] border border-[#1C1C1C] overflow-hidden">
        {coupons.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-light">
            No active coupon rules in the catalog database. Click "New Coupon" to configure code rewards.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1C1C1C] text-[10px] text-zinc-500 uppercase tracking-widest font-bold bg-[#0C0C0C]">
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Value</th>
                  <th className="p-4 text-right">Min Order</th>
                  <th className="p-4 text-right">Expiry Date</th>
                  <th className="p-4 text-right">Limit</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C] text-zinc-300">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#151515] transition">
                    <td className="p-4 font-mono font-bold text-white text-xs">{c.code}</td>
                    <td className="p-4 uppercase tracking-wider text-[10px] text-zinc-400">
                      {c.discountType === "percent" ? "Percentage" : "Flat Rate"}
                    </td>
                    <td className="p-4 font-semibold text-accent">
                      {c.discountType === "percent" ? `${c.discountValue}%` : formatPrice(c.discountValue)}
                    </td>
                    <td className="p-4 text-right font-medium text-white">{formatPrice(c.minimumOrder)}</td>
                    <td className="p-4 text-right font-mono text-zinc-400">{c.expiry}</td>
                    <td className="p-4 text-right text-zinc-400">{c.usageLimit || "Unlimited"}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider ${
                        c.active
                          ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/35"
                          : "bg-zinc-850 text-zinc-500 border-zinc-700/35"
                      }`}>
                        {c.active ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1 text-zinc-400 hover:text-white transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1 text-zinc-500 hover:text-error transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121212] border border-[#1F1F1F] p-6 max-w-sm w-full text-xs font-poppins space-y-5"
            >
              <div className="flex justify-between items-center border-b border-[#1F1F1F] pb-3">
                <span className="font-serif text-sm font-semibold tracking-wide text-white">
                  {editingCoupon ? "Edit Promotion Rule" : "Configure New Coupon"}
                </span>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Promo Code</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. LUXURY50"
                      className="flex-grow bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-2 focus:outline-none focus:border-accent text-white font-mono uppercase text-xs"
                    />
                    <button
                      type="button"
                      onClick={generateCode}
                      className="p-2 bg-[#1C1C1C] border border-[#2F2F2F] text-accent hover:text-white transition flex items-center justify-center"
                      title="Auto-Generate"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as "fixed" | "percent")}
                      className="w-full bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                    >
                      <option value="percent">Percentage %</option>
                      <option value="fixed">Flat Amount ₹</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Discount Value</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === "percent" ? "15" : "500"}
                      className="w-full bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Min Order (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={minimumOrder}
                      onChange={(e) => setMinimumOrder(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-2 focus:outline-none focus:border-accent text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-2 focus:outline-none focus:border-accent text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Usage Limit</label>
                    <input
                      type="number"
                      min={1}
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      placeholder="Unlimited"
                      className="w-full bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-2 focus:outline-none focus:border-accent text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-3 mt-4 justify-end">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Active Status</span>
                    <button
                      type="button"
                      onClick={() => setActive(!active)}
                      className={`relative w-8 h-4 transition duration-200 rounded-full ${active ? "bg-accent" : "bg-zinc-800"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${active ? "translate-x-4" : ""}`} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent text-black font-semibold uppercase tracking-wider py-2.5 hover:bg-[#c39665] transition mt-2 rounded-none"
                >
                  Create Reward Code
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
