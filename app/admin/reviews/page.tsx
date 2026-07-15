"use client";

import React, { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { fetchReviews, deleteReview } from "@/features/products/productActions";

interface ReviewData {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  review: string;
  createdAt: string;
  status: string;
  reply: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const loadData = async () => {
    try {
      const data = await fetchReviews();
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this customer review?")) return;
    try {
      const res = await deleteReview(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || "Failed to delete review");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (activeTab === "all") return true;
    return r.status.toLowerCase() === activeTab;
  });

  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

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
        <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Customer Feedback</span>
        <h1 className="font-serif text-3xl font-light tracking-wide text-white">Product Reviews</h1>
        <div className="w-12 h-[1px] bg-accent mt-3" />
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Total Reviews</span>
          <span className="text-xl font-bold text-white block mt-1">{reviews.length} reviews</span>
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Average Score</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xl font-bold text-accent">{averageRating}</span>
            <div className="flex text-accent">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(Number(averageRating)) ? "fill-accent text-accent" : "text-zinc-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Customer Sentiment</span>
          <span className="text-xl font-bold text-emerald-400 block mt-1">
            {reviews.length > 0 ? ((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100).toFixed(0) : "0"}% Positive
          </span>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex border-b border-[#1C1C1C] text-xs">
        {["all", "approved"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 border-b-2 font-medium capitalize transition tracking-wider ${
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* REVIEWS LIST */}
      <div className="bg-[#121212] border border-[#1C1C1C] overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-light">
            No customer reviews found in this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1C1C1C] text-[10px] text-zinc-500 uppercase tracking-widest font-bold bg-[#0C0C0C]">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Review Text</th>
                  <th className="p-4 text-right">Submitted</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C] text-zinc-300">
                {filteredReviews.map((r) => (
                  <tr key={r.id} className="hover:bg-[#151515] transition">
                    <td className="p-4 font-semibold text-white">{r.productName}</td>
                    <td className="p-4 text-zinc-400">{r.customerName}</td>
                    <td className="p-4">
                      <div className="flex text-accent">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < r.rating ? "fill-accent text-accent" : "text-zinc-700"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-zinc-300 font-light max-w-xs truncate" title={r.review}>
                      {r.review}
                    </td>
                    <td className="p-4 text-right font-mono text-zinc-400">{r.createdAt}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
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
    </div>
  );
}
