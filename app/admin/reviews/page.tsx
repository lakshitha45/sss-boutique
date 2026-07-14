"use client";

import React, { useState } from "react";
import { Review } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Check, X as CancelIcon, Trash2, ShieldAlert } from "lucide-react";

// Mock reviews
const INITIAL_REVIEWS = [
  {
    id: "rev_1",
    productId: "prod_1",
    productName: "Kanchipuram Silk Saree",
    customerName: "Radhika Krishnan",
    rating: 5,
    review: "Absolutely stunning saree! The weave is tight and the silk is premium. Perfect gold zari luster, felt so royal wearing it to the wedding.",
    createdAt: "Jul 12, 2026",
    status: "pending" as const,
    reply: "",
  },
  {
    id: "rev_2",
    productId: "prod_3",
    productName: "Monarch Leather Tote",
    customerName: "Aiswarya R.",
    rating: 4,
    review: "Beautiful leather quality, holds its shape perfectly. Muted gold branding is very classy. Deducted one star because shipping took 6 days.",
    createdAt: "Jul 10, 2026",
    status: "approved" as const,
    reply: "Thank you Aiswarya! We are glad you love the bag quality. We'll work with the shipping provider to speed up next time.",
  },
  {
    id: "rev_3",
    productId: "prod_2",
    productName: "Midnight Organza Suit",
    customerName: "Simran Kaur",
    rating: 5,
    review: "The embroidery detail is gorgeous! Fits like a glove. Received so many compliments on Eid. Organizer bag was a nice touch.",
    createdAt: "Jul 08, 2026",
    status: "approved" as const,
    reply: "",
  },
  {
    id: "rev_4",
    productId: "prod_1",
    productName: "Kanchipuram Silk Saree",
    customerName: "Sushma Sen",
    rating: 2,
    review: "The color in the picture looked hot pink but it is more of a dark magenta. Quality is ok but expected the exact visual match.",
    createdAt: "Jul 04, 2026",
    status: "rejected" as const,
    reply: "",
  },
  {
    id: "rev_5",
    productId: "prod_4",
    productName: "Hand-Block Print Kurti",
    customerName: "Tanya Goel",
    rating: 4,
    review: "Very breathable cotton fabric, perfect for Delhi summers. The indigo prints look authentic. Good value for money.",
    createdAt: "Jun 28, 2026",
    status: "approved" as const,
    reply: "",
  },
  {
    id: "rev_6",
    productId: "prod_5",
    productName: "Peach Lehenga Choli",
    customerName: "Divya Reddy",
    rating: 3,
    review: "Skirt volume is great, but the border stitching was a bit loose. Had to get it customized local before wear.",
    createdAt: "Jun 20, 2026",
    status: "pending" as const,
    reply: "",
  }
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [replyingReview, setReplyingReview] = useState<typeof INITIAL_REVIEWS[0] | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleUpdateStatus = (id: string, newStatus: "approved" | "rejected") => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this customer feedback?")) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const handleOpenReply = (rev: typeof INITIAL_REVIEWS[0]) => {
    setReplyingReview(rev);
    setReplyText(rev.reply || "");
  };

  const handleSaveReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;

    setReviews((prev) =>
      prev.map((r) =>
        r.id === replyingReview.id
          ? { ...r, reply: replyText, status: "approved" } // Auto approve when replying
          : r
      )
    );
    setReplyingReview(null);
  };

  const filteredReviews = reviews.filter((r) => filter === "all" || r.status === filter);

  // Stats calculation
  const totalReviews = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-0.5 text-accent">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i < rating ? "fill-accent text-accent" : "text-zinc-700"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 font-poppins text-zinc-100 bg-[#0A0A0A]">
      <div className="space-y-1">
        <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Customer Feedback</span>
        <h1 className="font-serif text-3xl font-light tracking-wide text-white">Review Moderation</h1>
        <div className="w-12 h-[1px] bg-accent mt-3" />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Total Reviews</span>
          <span className="text-xl font-bold text-white block mt-1">{totalReviews} Feedbacks</span>
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Average Rating</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xl font-bold text-white">{avgRating.toFixed(1)}</span>
            {renderStars(Math.round(avgRating))}
          </div>
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Pending Moderation</span>
          <span className={`text-xl font-bold block mt-1 ${pendingCount > 0 ? "text-amber-400" : "text-white"}`}>
            {pendingCount} Pending
          </span>
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Approved Reviews</span>
          <span className="text-xl font-bold text-white block mt-1">{approvedCount} Published</span>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex border-b border-[#1C1C1C] text-[10px] font-bold uppercase tracking-wider text-zinc-500 gap-6">
        {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 relative transition-colors ${filter === tab ? "text-accent" : "hover:text-zinc-300"}`}
          >
            {tab} reviews
            {filter === tab && (
              <motion.div layoutId="reviewTabUnderline" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* REVIEWS LIST TABLE */}
      <div className="bg-[#121212] border border-[#1C1C1C] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1C1C1C] text-[10px] text-zinc-500 uppercase tracking-widest font-bold bg-[#0C0C0C]">
                <th className="p-4 w-44">Product</th>
                <th className="p-4 w-36">Customer</th>
                <th className="p-4 w-28">Rating</th>
                <th className="p-4">Feedback / Content</th>
                <th className="p-4 w-28 text-center">Status</th>
                <th className="p-4 w-32 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 font-light">
                    No reviews matching this selection.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-[#1A1A1A] transition align-top">
                    <td className="p-4 font-medium text-white">{rev.productName}</td>
                    <td className="p-4">
                      <span className="font-semibold text-white block">{rev.customerName}</span>
                      <span className="text-[9px] text-zinc-500 block mt-0.5 font-mono">{rev.createdAt}</span>
                    </td>
                    <td className="p-4">{renderStars(rev.rating)}</td>
                    <td className="p-4 space-y-2">
                      <p className="text-zinc-300 leading-relaxed font-light">{rev.review}</p>
                      {rev.reply && (
                        <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-3 text-[11px] leading-relaxed">
                          <span className="text-[9px] text-accent font-bold uppercase tracking-widest block mb-1">Store Response</span>
                          <span className="text-zinc-400 font-light">{rev.reply}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider rounded-none ${
                        rev.status === "pending"
                          ? "bg-amber-950/20 text-amber-400 border-amber-900/35"
                          : rev.status === "approved"
                          ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/35"
                          : "bg-rose-950/20 text-rose-455 border-rose-900/35"
                      }`}>
                        {rev.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex space-x-1.5 justify-center">
                        <button
                          disabled={rev.status === "approved"}
                          onClick={() => handleUpdateStatus(rev.id, "approved")}
                          className="p-1.5 hover:text-emerald-400 disabled:text-zinc-700 disabled:border-zinc-800 transition border border-[#1C1C1C] bg-[#0C0C0C]"
                          title="Approve Review"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={rev.status === "rejected"}
                          onClick={() => handleUpdateStatus(rev.id, "rejected")}
                          className="p-1.5 hover:text-rose-455 disabled:text-zinc-700 disabled:border-zinc-800 transition border border-[#1C1C1C] bg-[#0C0C0C]"
                          title="Reject Review"
                        >
                          <CancelIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenReply(rev)}
                          className="p-1.5 hover:text-accent transition border border-[#1C1C1C] bg-[#0C0C0C]"
                          title="Write Reply Response"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rev.id)}
                          className="p-1.5 hover:text-rose-455 transition border border-[#1C1C1C] bg-[#0C0C0C]"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPLY DIALOG MODAL */}
      <AnimatePresence>
        {replyingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setReplyingReview(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-[#121212] border border-[#1C1C1C] max-w-md w-full relative z-10 shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
            >
              <h2 className="font-serif text-xl font-light text-white mb-4 tracking-wide">Write Response Reply</h2>

              <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-3 text-xs mb-4">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block mb-1">
                  Original Feedback by {replyingReview.customerName}
                </span>
                <p className="text-zinc-300 leading-relaxed font-light italic">"{replyingReview.review}"</p>
              </div>

              <form onSubmit={handleSaveReply} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Your Response Response</label>
                  <textarea
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white min-h-[120px] leading-relaxed"
                    placeholder="Write a response response (submitting will auto-approve this review)..."
                  />
                </div>

                <div className="flex space-x-3 border-t border-[#1C1C1C] pt-5 mt-6 justify-end">
                  <button
                    type="button"
                    onClick={() => setReplyingReview(null)}
                    className="px-4 py-2.5 border border-[#1C1C1C] hover:bg-zinc-900 transition text-[10px] uppercase font-bold tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-accent text-foreground hover:bg-accent/90 transition text-[10px] uppercase font-bold tracking-wider flex items-center space-x-2"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Response Response</span>
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
