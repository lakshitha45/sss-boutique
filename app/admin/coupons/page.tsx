"use client";

import React, { useState } from "react";
import { Coupon } from "@/types";
import { formatPrice } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Ticket, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

const INITIAL_COUPONS: Coupon[] = [
  {
    id: "coup_1",
    code: "WELCOME10",
    discountType: "percent",
    discountValue: 10,
    minimumOrder: 500,
    expiry: "2026-12-31",
    usageLimit: 500,
    active: true,
  },
  {
    id: "coup_2",
    code: "FLAT500",
    discountType: "fixed",
    discountValue: 500,
    minimumOrder: 3000,
    expiry: "2026-08-31",
    usageLimit: 100,
    active: true,
  },
  {
    id: "coup_3",
    code: "SUMMER25",
    discountType: "percent",
    discountValue: 25,
    minimumOrder: 1500,
    expiry: "2026-07-25",
    usageLimit: 250,
    active: false,
  },
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
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

  const openAddModal = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("percent");
    setDiscountValue("");
    setMinimumOrder("0");
    setExpiry(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]); // 30 days ahead
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
    setUsageLimit(c.usageLimit.toString());
    setActive(c.active);
    setIsModalOpen(true);
  };

  const handleGenerateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let rand = "SSS";
    for (let i = 0; i < 5; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(rand);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      alert("Coupon Code and Value are required");
      return;
    }

    const value = parseFloat(discountValue) || 0;
    const minOrderVal = parseFloat(minimumOrder) || 0;
    const limitVal = parseInt(usageLimit) || 100;

    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id
            ? { ...c, code: code.toUpperCase().trim(), discountType, discountValue: value, minimumOrder: minOrderVal, expiry, usageLimit: limitVal, active }
            : c
        )
      );
    } else {
      const newCoup: Coupon = {
        id: `coup_${Date.now()}`,
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: value,
        minimumOrder: minOrderVal,
        expiry,
        usageLimit: limitVal,
        active,
      };
      setCoupons((prev) => [...prev, newCoup]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const isExpired = (expiryStr: string) => {
    return new Date(expiryStr).getTime() < Date.now();
  };

  return (
    <div className="space-y-8 font-poppins text-zinc-100 bg-[#0A0A0A]">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Promotions & Discounts</span>
          <h1 className="font-serif text-3xl font-light tracking-wide text-white">Coupon Rules</h1>
          <div className="w-12 h-[1px] bg-accent mt-3" />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-accent text-foreground px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] hover:bg-accent/90 transition shadow-luxury"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate Coupon</span>
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Active Coupons</span>
            <span className="text-xl font-bold text-white block">{coupons.filter(c => c.active && !isExpired(c.expiry)).length} Rules</span>
          </div>
          <Ticket className="w-6 h-6 text-accent" />
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Total Redemptions</span>
            <span className="text-xl font-bold text-white block">348 checkout orders</span>
          </div>
          <Sparkles className="w-6 h-6 text-zinc-600" />
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Discounted Revenue</span>
            <span className="text-xl font-bold text-white block">{formatPrice(12400)}</span>
          </div>
          <ShieldAlert className="w-6 h-6 text-zinc-600" />
        </div>
      </div>

      {/* RULES LIST TABLE */}
      <div className="bg-[#121212] border border-[#1C1C1C] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1C1C1C] text-[10px] text-zinc-500 uppercase tracking-widest font-bold bg-[#0C0C0C]">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-right">Value</th>
                <th className="p-4 text-right">Min Order</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4 text-center">Usage limits</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {coupons.map((c) => {
                const expired = isExpired(c.expiry);
                const statusLabel = expired ? "Expired" : (c.active ? "Active" : "Inactive");
                
                return (
                  <tr key={c.id} className="hover:bg-[#1A1A1A] transition">
                    <td className="p-4 font-mono font-bold text-white tracking-wider">{c.code}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 border text-[8px] font-bold uppercase tracking-wider rounded-none ${
                        c.discountType === "percent"
                          ? "bg-sky-950/20 text-sky-400 border-sky-900/35"
                          : "bg-emerald-950/20 text-emerald-400 border-emerald-900/35"
                      }`}>
                        {c.discountType === "percent" ? "Percentage" : "Fixed Discount"}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold text-white">
                      {c.discountType === "percent" ? `${c.discountValue}%` : formatPrice(c.discountValue)}
                    </td>
                    <td className="p-4 text-right text-zinc-400 font-semibold">{formatPrice(c.minimumOrder)}</td>
                    <td className="p-4 text-zinc-400 font-mono">{c.expiry}</td>
                    <td className="p-4 text-center text-zinc-400 font-mono">Limit: {c.usageLimit}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider rounded-none ${
                        expired
                          ? "bg-rose-950/20 text-rose-455 border-rose-900/35"
                          : (c.active
                            ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/35"
                            : "bg-zinc-800/40 text-zinc-500 border-zinc-700/35")
                      }`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 hover:text-accent transition border border-[#1C1C1C] hover:border-accent bg-[#0C0C0C]"
                          title="Edit Rules"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 hover:text-rose-455 transition border border-[#1C1C1C] hover:border-rose-900 bg-[#0C0C0C]"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE / CREATE MODAL */}
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
              className="bg-[#121212] border border-[#1C1C1C] max-w-md w-full relative z-10 shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
            >
              <h2 className="font-serif text-xl font-light text-white mb-6 tracking-wide">
                {editingCoupon ? "Edit Coupon Rules" : "Generate Coupon Code"}
              </h2>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Coupon Code</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white font-mono uppercase tracking-wider"
                      placeholder="e.g. WELCOME10"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="px-3 border border-[#1C1C1C] hover:border-accent bg-[#0C0C0C] text-accent flex items-center space-x-1.5 uppercase font-bold tracking-wider text-[9px]"
                      title="Auto Generate Code"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Random</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as "fixed" | "percent")}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed Flat (₹)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      Discount Value {discountType === "percent" ? "(%)" : "(₹)"}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                      placeholder={discountType === "percent" ? "10" : "500"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Minimum Purchase (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={minimumOrder}
                      onChange={(e) => setMinimumOrder(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Expiry Calendar</label>
                    <input
                      type="date"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Usage limit (orders)</label>
                    <input
                      type="number"
                      min={1}
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-6">
                    <input
                      type="checkbox"
                      id="activeCoupon"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="accent-accent w-4 h-4 bg-[#0A0A0A] border border-[#1C1C1C]"
                    />
                    <label htmlFor="activeCoupon" className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider select-none cursor-pointer">
                      Publish Active
                    </label>
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
                    Save Coupon
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
