"use client";

import React, { useEffect, useState } from "react";
import { HomepageBanner } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Eye, X, Image as ImageIcon, Sparkles } from "lucide-react";
import { fetchBanners, saveBanner, deleteBanner } from "@/features/products/productActions";

export default function BannersPage() {
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HomepageBanner | null>(null);
  const [previewBanner, setPreviewBanner] = useState<HomepageBanner | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [priority, setPriority] = useState(1);
  const [active, setActive] = useState(true);

  const loadData = async () => {
    try {
      const data = await fetchBanners();
      setBanners(data);
    } catch (err) {
      console.error("Failed to load banners", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle("");
    setImageUrl("");
    setButtonText("Explore More");
    setButtonLink("/shop");
    setPriority(banners.length + 1);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: HomepageBanner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setImageUrl(b.imageUrl);
    setButtonText(b.buttonText);
    setButtonLink(b.buttonLink);
    setPriority(b.priority);
    setActive(b.active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert("Title and Image URL are required");
      return;
    }

    const payload = {
      id: editingBanner ? editingBanner.id : `banner_temp_${Date.now()}`,
      title,
      imageUrl,
      buttonText,
      buttonLink,
      priority,
      active,
    };

    try {
      const res = await saveBanner(payload);
      if (res.success) {
        setIsModalOpen(false);
        loadData();
      } else {
        alert(res.error || "Failed to save banner");
      }
    } catch (err: any) {
      alert(err.message || "Failed to save banner");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this promotional banner?")) return;
    try {
      const res = await deleteBanner(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || "Failed to delete banner");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete banner");
    }
  };

  const movePriority = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= banners.length) return;

    const list = [...banners];
    const temp = list[index].priority;
    list[index].priority = list[targetIdx].priority;
    list[targetIdx].priority = temp;

    // Save priorities in sequence
    try {
      await Promise.all([
        saveBanner(list[index]),
        saveBanner(list[targetIdx])
      ]);
      loadData();
    } catch (err) {
      console.error("Failed to reorder banners", err);
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
      <div className="flex justify-between items-end border-b border-[#1C1C1C] pb-5">
        <div className="space-y-1">
          <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Content Management</span>
          <h1 className="font-serif text-3xl font-light tracking-wide text-white">Promotional Banners</h1>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-accent text-black font-semibold text-xs px-4 py-2.5 hover:bg-[#c39665] transition rounded-none uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-[#121212] border border-[#1C1C1C] p-12 text-center text-zinc-500 font-light text-xs">
          No banners found. Click "Add Banner" to upload promotional content.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((b, index) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#121212] border border-[#1C1C1C] overflow-hidden flex flex-col group"
            >
              {/* Image Preview */}
              <div className="h-44 bg-[#080808] relative overflow-hidden flex items-center justify-center border-b border-[#1C1C1C]">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-650" />
                )}
                <div className="absolute top-3 left-3 bg-[#0A0A0A]/85 border border-[#1F1F1F] px-2 py-0.5 text-[9px] font-bold text-zinc-400">
                  Priority {b.priority}
                </div>
                {b.active ? (
                  <div className="absolute top-3 right-3 bg-emerald-950/85 border border-emerald-900/40 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                    Active
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 bg-zinc-800/85 border border-zinc-700/40 px-2 py-0.5 text-[9px] font-bold text-zinc-500">
                    Inactive
                  </div>
                )}
              </div>

              {/* Title & Link */}
              <div className="p-4 flex-grow space-y-3">
                <h3 className="font-serif text-sm font-medium text-white group-hover:text-accent transition leading-snug line-clamp-2">
                  {b.title}
                </h3>
                <div className="space-y-1 text-[11px] text-zinc-400 leading-normal">
                  <p>CTA: <span className="text-zinc-200 font-mono font-medium">{b.buttonText || "None"}</span></p>
                  <p>Link: <span className="text-zinc-500 truncate font-mono block max-w-full">{b.buttonLink || "None"}</span></p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="px-4 py-3 bg-[#0C0C0C] border-t border-[#1C1C1C] flex items-center justify-between">
                <div className="flex space-x-1.5">
                  <button
                    disabled={index === 0}
                    onClick={() => movePriority(index, "up")}
                    className="p-1.5 bg-[#121212] border border-[#1F1F1F] text-zinc-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === banners.length - 1}
                    onClick={() => movePriority(index, "down")}
                    className="p-1.5 bg-[#121212] border border-[#1F1F1F] text-zinc-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setPreviewBanner(b)}
                    className="p-1.5 text-zinc-400 hover:text-accent transition"
                    title="Live Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 text-zinc-400 hover:text-white transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 text-zinc-500 hover:text-error transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121212] border border-[#1F1F1F] p-6 max-w-md w-full text-xs font-poppins space-y-5"
            >
              <div className="flex justify-between items-center border-b border-[#1F1F1F] pb-3">
                <span className="font-serif text-sm font-semibold tracking-wide text-white">
                  {editingBanner ? "Modify Banner" : "New Promotional Banner"}
                </span>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Banner Title / Hook</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-2 focus:outline-none focus:border-accent text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Image URL</label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://unsplash.com/..."
                    className="w-full bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-2 focus:outline-none focus:border-accent text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Button Text</label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-2 focus:outline-none focus:border-accent text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Button Link</label>
                    <input
                      type="text"
                      value={buttonLink}
                      onChange={(e) => setButtonLink(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-2 focus:outline-none focus:border-accent text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Sequence Priority</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={priority}
                      onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                      className="w-full bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-2 focus:outline-none focus:border-accent text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-3 mt-4 justify-end">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Status Active</span>
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
                  Save Settings
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL WIDTH PREVIEW DRAWER */}
      <AnimatePresence>
        {previewBanner && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50">
            <div className="max-w-5xl w-full space-y-4">
              <div className="flex justify-between items-center text-zinc-400 text-xs">
                <span>Promotional Banner Live Preview (Mockup Layout)</span>
                <button onClick={() => setPreviewBanner(null)} className="text-zinc-500 hover:text-white flex items-center space-x-1">
                  <X className="w-4.5 h-4.5" />
                  <span>Close Preview</span>
                </button>
              </div>
              <div className="w-full aspect-[21/9] bg-[#0A0A0A] relative flex items-center border border-[#1F1F1F]">
                <img src={previewBanner.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-75" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
                <div className="relative pl-12 sm:pl-20 max-w-xl space-y-6">
                  <span className="text-[10px] text-accent font-bold uppercase tracking-widest flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Exclusive Showcase</span>
                  </span>
                  <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-white leading-tight">
                    {previewBanner.title}
                  </h2>
                  <a
                    href={previewBanner.buttonLink}
                    className="inline-block bg-white text-black font-semibold text-[10px] uppercase tracking-widest px-6 py-3 hover:bg-accent hover:text-white transition duration-300 rounded-none"
                  >
                    {previewBanner.buttonText || "Shop Now"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
