"use client";

import React, { useState } from "react";
import { HomepageBanner } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Eye, X, Image as ImageIcon, Sparkles } from "lucide-react";

const DEFAULT_BANNERS: HomepageBanner[] = [
  {
    id: "banner_1",
    title: "Summer Handlooms & Chiffons Collection",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    buttonText: "Browse Collection",
    buttonLink: "/shop?category=sarees",
    priority: 1,
    active: true,
  },
  {
    id: "banner_2",
    title: "Exclusive Silk Sarees Festival - Up to 50% Off",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
    buttonText: "Shop the Sale",
    buttonLink: "/shop?featured=true",
    priority: 2,
    active: true,
  },
  {
    id: "banner_3",
    title: "Elegant Cotton Kurtis & Accessories",
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop",
    buttonText: "New Arrivals",
    buttonLink: "/shop?category=kurtis",
    priority: 3,
    active: false,
  },
];

export default function BannersPage() {
  const [banners, setBanners] = useState<HomepageBanner[]>(DEFAULT_BANNERS);
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert("Title and Image URL are required");
      return;
    }

    if (editingBanner) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === editingBanner.id
            ? { ...b, title, imageUrl, buttonText, buttonLink, priority, active }
            : b
        ).sort((a, b) => a.priority - b.priority)
      );
    } else {
      const newBanner: HomepageBanner = {
        id: `banner_${Date.now()}`,
        title,
        imageUrl,
        buttonText,
        buttonLink,
        priority,
        active,
      };
      setBanners((prev) => [...prev, newBanner].sort((a, b) => a.priority - b.priority));
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this promotional banner?")) return;
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const movePriority = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= banners.length) return;

    const list = [...banners];
    const tempPriority = list[index].priority;
    list[index].priority = list[targetIdx].priority;
    list[targetIdx].priority = tempPriority;

    const sorted = list.sort((a, b) => a.priority - b.priority);
    setBanners(sorted);
  };

  return (
    <div className="space-y-8 font-poppins text-zinc-100 bg-[#0A0A0A]">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Content Management</span>
          <h1 className="font-serif text-3xl font-light tracking-wide text-white">Homepage Banners</h1>
          <div className="w-12 h-[1px] bg-accent mt-3" />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-accent text-foreground px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] hover:bg-accent/90 transition shadow-luxury"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Banner</span>
        </button>
      </div>

      {/* CARDS LIST */}
      <div className="grid grid-cols-1 gap-6">
        {banners.map((b, index) => (
          <div
            key={b.id}
            className="bg-[#121212] border border-[#1C1C1C] flex flex-col md:flex-row hover:border-zinc-700 transition duration-300 relative group overflow-hidden"
          >
            {/* Banner preview thumbnail */}
            <div className="w-full md:w-80 h-44 bg-zinc-900 relative overflow-hidden flex-shrink-0">
              <img src={b.imageUrl} alt="" className="object-cover w-full h-full opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-transparent to-transparent hidden md:block" />
              
              <div className="absolute top-4 left-4 flex space-x-2 text-[9px] uppercase tracking-widest font-bold">
                <span className={`px-2 py-0.5 border backdrop-blur-sm ${
                  b.active
                    ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/35"
                    : "bg-zinc-800/40 text-zinc-500 border-zinc-700/35"
                }`}>
                  {b.active ? "Active" : "Inactive"}
                </span>
                
                <span className="bg-[#0A0A0A]/40 text-zinc-300 border border-zinc-700/30 px-2 py-0.5 backdrop-blur-sm">
                  Priority {b.priority}
                </span>
              </div>
            </div>

            {/* Info details */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4 md:space-y-0">
              <div className="space-y-2">
                <h3 className="font-serif text-lg font-light text-white tracking-wide leading-tight">{b.title}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-500 font-mono">
                  <span>Action: {b.buttonText}</span>
                  <span>Link: {b.buttonLink}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#1C1C1C]/60 pt-4 mt-2">
                {/* Priority arrow toggles */}
                <div className="flex items-center space-x-1 border border-[#1C1C1C] bg-[#0C0C0C]">
                  <button
                    disabled={index === 0}
                    onClick={() => movePriority(index, "up")}
                    className="p-2 hover:text-accent disabled:text-zinc-700 transition"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-[1px] h-4 bg-[#1C1C1C]" />
                  <button
                    disabled={index === banners.length - 1}
                    onClick={() => movePriority(index, "down")}
                    className="p-2 hover:text-accent disabled:text-zinc-700 transition"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex space-x-2 text-xs">
                  <button
                    onClick={() => setPreviewBanner(b)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 hover:text-accent transition border border-[#1C1C1C] hover:border-accent bg-[#0C0C0C]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-2 hover:text-accent transition border border-[#1C1C1C] hover:border-accent bg-[#0C0C0C]"
                    title="Edit Banner"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-2 hover:text-rose-450 transition border border-[#1C1C1C] hover:border-rose-900 bg-[#0C0C0C]"
                    title="Remove Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FULL-WIDTH BANNER PREVIEW MODAL */}
      <AnimatePresence>
        {previewBanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setPreviewBanner(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-5xl bg-[#121212] border border-[#1C1C1C] relative z-10 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setPreviewBanner(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-[#0A0A0A]/60 hover:bg-[#0A0A0A] border border-zinc-800 text-white rounded-none transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="h-[350px] relative flex items-center px-12 md:px-20 text-white bg-zinc-950">
                <img
                  src={previewBanner.imageUrl}
                  alt=""
                  className="absolute inset-0 object-cover w-full h-full opacity-40 select-none pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                
                <div className="relative max-w-xl space-y-5 text-left">
                  <span className="text-[10px] text-accent font-bold uppercase tracking-[0.25em] flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Exclusive Preview</span>
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl font-light tracking-wide leading-tight">
                    {previewBanner.title}
                  </h2>
                  <button className="bg-white hover:bg-zinc-100 text-black px-6 py-3 font-semibold text-[10px] uppercase tracking-widest transition duration-300">
                    {previewBanner.buttonText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD/EDIT MODAL */}
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
                {editingBanner ? "Edit Promotional Banner" : "Schedule New Banner"}
              </h2>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Banner Headline</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                    placeholder="e.g. SSS Festive Collection Launch"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                    placeholder="Spreadsheet image link or R2 storage URL..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Button CTA Text</label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                      placeholder="e.g. Browse Now"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">CTA Link URL</label>
                    <input
                      type="text"
                      value={buttonLink}
                      onChange={(e) => setButtonLink(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                      placeholder="e.g. /shop?category=sarees"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Display Priority</label>
                    <input
                      type="number"
                      min={1}
                      value={priority}
                      onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-6">
                    <input
                      type="checkbox"
                      id="activeBanner"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="accent-accent w-4 h-4 bg-[#0A0A0A] border border-[#1C1C1C]"
                    />
                    <label htmlFor="activeBanner" className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider select-none cursor-pointer">
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
                    Save Banner
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
