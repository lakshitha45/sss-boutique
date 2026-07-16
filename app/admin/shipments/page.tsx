"use client";

import React, { useEffect, useState } from "react";
import { fetchShipments, createNewShipment, modifyShipment, removeShipment } from "@/features/shipments/shipmentActions";
import { fetchOrders } from "@/features/orders/orderActions";
import { Shipment, Order } from "@/types";
import { formatPrice } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertCircle, Edit2, Trash2, Check, Truck, Clock, Eye, Calendar, User, Phone, MapPin, X, ArrowUpDown, Filter, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

const COURIER_OPTIONS = ["Professional Couriers", "DTDC", "Blue Dart", "Delhivery", "India Post", "Other"];

const STATUS_OPTIONS = [
  "Shipment Pending",
  "Packed",
  "Ready For Pickup",
  "Picked Up",
  "In Transit",
  "Out For Delivery",
  "Delivered",
  "Delivery Failed",
  "Returned",
  "Cancelled"
];

export default function AdminShipmentDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [courierFilter, setCourierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Detail Modal
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // Create Shipment Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedCourier, setSelectedCourier] = useState(COURIER_OPTIONS[0]);
  const [customCourierName, setCustomCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipmentStatus, setShipmentStatus] = useState("Shipment Pending");
  const [notes, setNotes] = useState("");
  const [estDeliveryDate, setEstDeliveryDate] = useState("");

  // Edit Shipment Modal
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [editCourier, setEditCourier] = useState("");
  const [editCustomCourier, setEditCustomCourier] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editEstDate, setEditEstDate] = useState("");

  const getAuthToken = async () => {
    if (!supabase) return undefined;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const loadData = async () => {
    try {
      const token = await getAuthToken();
      const shps = await fetchShipments(token);
      setShipments(shps);
      const ords = await fetchOrders(token);
      setOrders(ords);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !trackingNumber) {
      alert("Please select an order and enter tracking number");
      return;
    }
    const finalCourier = selectedCourier === "Other" ? customCourierName : selectedCourier;
    const token = await getAuthToken();
    const res = await createNewShipment({
      orderId: selectedOrderId,
      courierName: finalCourier || "Other",
      trackingNumber,
      status: shipmentStatus,
      estimatedDeliveryDate: estDeliveryDate || undefined,
      notes
    }, token);

    if (res.success) {
      setShowCreateModal(false);
      setSelectedOrderId("");
      setTrackingNumber("");
      setNotes("");
      setEstDeliveryDate("");
      loadData();
    } else {
      alert(res.error || "Failed to create shipment");
    }
  };

  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipment) return;
    const finalCourier = editCourier === "Other" ? editCustomCourier : editCourier;
    const token = await getAuthToken();
    const res = await modifyShipment(editingShipment.id, {
      courierName: finalCourier || "Other",
      trackingNumber: editTracking,
      status: editStatus,
      estimatedDeliveryDate: editEstDate || undefined,
      notes: editNotes
    }, token);

    if (res.success) {
      setEditingShipment(null);
      loadData();
    } else {
      alert(res.error || "Failed to update shipment");
    }
  };

  const handleDeleteShipment = async (id: string) => {
    if (confirm("Are you sure you want to delete this shipment?")) {
      const token = await getAuthToken();
      const res = await removeShipment(id, token);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || "Failed to delete shipment");
      }
    }
  };

  // Metrics
  const pendingCount = shipments.filter(s => s.status === "Shipment Pending" || s.status === "Packed" || s.status === "Ready For Pickup").length;
  const shippedCount = shipments.filter(s => s.status === "Picked Up" || s.status === "In Transit" || s.status === "Out For Delivery").length;
  const deliveredCount = shipments.filter(s => s.status === "Delivered").length;
  const cancelledCount = shipments.filter(s => s.status === "Cancelled").length;
  const returnedCount = shipments.filter(s => s.status === "Returned").length;

  // Filtered list
  const filteredShipments = shipments.filter(s => {
    const matchesSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      (s.orderNumber ? s.orderNumber.toLowerCase().includes(search.toLowerCase()) : false) ||
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.customerName ? s.customerName.toLowerCase().includes(search.toLowerCase()) : false);

    const matchesCourier = courierFilter === "all" || s.courierName === courierFilter;
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const time = new Date(s.createdAt).getTime();
      const now = Date.now();
      if (dateFilter === "today") matchesDate = now - time <= 24 * 60 * 60 * 1000;
      else if (dateFilter === "week") matchesDate = now - time <= 7 * 24 * 60 * 60 * 1000;
      else if (dateFilter === "month") matchesDate = now - time <= 30 * 24 * 60 * 60 * 1000;
    }

    return matchesSearch && matchesCourier && matchesStatus && matchesDate;
  }).sort((a, b) => {
    if (sortBy === "date-desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "date-asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return 0;
  });

  return (
    <div className="space-y-8 font-poppins text-xs text-zinc-100 bg-[#0A0A0A]">
      
      {/* Title */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Parcels & dispatches</span>
          <h1 className="font-serif text-3xl font-light tracking-wide text-white">Shipping & Fulfillment</h1>
          <div className="w-12 h-[1px] bg-accent mt-3" />
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-accent text-zinc-950 font-bold uppercase tracking-widest px-4 py-2.5 transition hover:bg-white"
        >
          <Plus className="w-4 h-4" />
          <span>New Shipment</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Pending Shipments", count: pendingCount, color: "text-amber-400" },
          { label: "Shipped Orders", count: shippedCount, color: "text-indigo-400" },
          { label: "Delivered Orders", count: deliveredCount, color: "text-emerald-400" },
          { label: "Returned Shipments", count: returnedCount, color: "text-zinc-400" },
          { label: "Cancelled Shipments", count: cancelledCount, color: "text-rose-455" }
        ].map((c, i) => (
          <div key={i} className="bg-[#121212] border border-[#1C1C1C] p-4 space-y-2">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">{c.label}</span>
            <span className={`text-2xl font-mono font-bold block ${c.color}`}>{c.count}</span>
          </div>
        ))}
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-[#121212] border border-[#1C1C1C] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search by tracking, order, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none pl-9 pr-3 py-2.5 focus:outline-none focus:border-accent text-white"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end text-zinc-400">
          {/* Courier */}
          <select
            value={courierFilter}
            onChange={(e) => setCourierFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-2.5 py-2 text-xs focus:outline-none focus:border-accent text-white"
          >
            <option value="all">All Couriers</option>
            {COURIER_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-2.5 py-2 text-xs focus:outline-none focus:border-accent text-white"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Date */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-2.5 py-2 text-xs focus:outline-none focus:border-accent text-white"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* SHIPMENTS LIST TABLE */}
      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredShipments.length === 0 ? (
        <div className="bg-[#121212] border border-[#1C1C1C] p-12 text-center text-zinc-500 font-light flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="w-6 h-6 text-zinc-650" />
          <span>No shipments matching criteria found.</span>
        </div>
      ) : (
        <div className="bg-[#121212] border border-[#1C1C1C] overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1C1C1C] text-[9px] text-zinc-500 uppercase tracking-widest bg-[#161616]">
                <th className="p-4">Shipment ID</th>
                <th className="p-4">Order Number</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Courier</th>
                <th className="p-4">Tracking Key</th>
                <th className="p-4">Status</th>
                <th className="p-4">Dispatch Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C] text-zinc-300">
              {filteredShipments.map((s) => (
                <tr key={s.id} className="hover:bg-[#161616]/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-accent">{s.id.slice(-6).toUpperCase()}</td>
                  <td className="p-4 font-mono">{s.orderNumber || s.orderId.slice(-6).toUpperCase()}</td>
                  <td className="p-4">{s.customerName || "Boutique Guest"}</td>
                  <td className="p-4">{s.courierName}</td>
                  <td className="p-4 font-mono">{s.trackingNumber}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider ${
                      s.status === "Delivered" ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/35" : (
                        s.status === "Cancelled" || s.status === "Returned" ? "bg-rose-950/20 text-rose-450 border-rose-900/35" : "bg-amber-950/20 text-amber-400 border-amber-900/35"
                      )
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-500">{new Date(s.shippingDate || s.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right flex justify-end space-x-2.5">
                    <button
                      onClick={() => setSelectedShipment(s)}
                      className="p-1.5 border border-[#1F1F1F] hover:bg-zinc-900 transition text-zinc-400 hover:text-white"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingShipment(s);
                        setEditCourier(COURIER_OPTIONS.includes(s.courierName) ? s.courierName : "Other");
                        setEditCustomCourier(COURIER_OPTIONS.includes(s.courierName) ? "" : s.courierName);
                        setEditTracking(s.trackingNumber);
                        setEditStatus(s.status);
                        setEditNotes(s.notes || "");
                        setEditEstDate(s.estimatedDeliveryDate ? new Date(s.estimatedDeliveryDate).toISOString().split("T")[0] : "");
                      }}
                      className="p-1.5 border border-[#1F1F1F] hover:bg-zinc-900 transition text-zinc-400 hover:text-white"
                      title="Edit Shipment"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteShipment(s.id)}
                      className="p-1.5 border border-[#1F1F1F] hover:bg-zinc-900 transition text-rose-400 hover:text-rose-500"
                      title="Delete Shipment"
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

      {/* CREATE SHIPMENT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-[#121212] border border-[#1C1C1C] max-w-md w-full relative z-10 p-6 overflow-y-auto max-h-[90vh] space-y-6">
              <div className="flex justify-between items-start border-b border-[#1C1C1C] pb-4">
                <div>
                  <span className="text-[9px] text-accent font-bold uppercase tracking-wider block">Fulfillment Journey</span>
                  <h3 className="font-serif text-lg text-white">Create New Shipment</h3>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleCreateShipment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Select Order</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent"
                    required
                  >
                    <option value="">-- Choose Packed Order --</option>
                    {orders.filter(o => {
                      const s = o.orderStatus.toLowerCase();
                      return s === "packed" || s === "ready for shipment" || s === "order confirmed" || s === "payment received" || s === "pending payment" || s === "processing";
                    }).map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber || o.id.slice(-6).toUpperCase()} - {o.customerName} ({formatPrice(o.grandTotal)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Courier Partner</label>
                    <select
                      value={selectedCourier}
                      onChange={(e) => setSelectedCourier(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent"
                      required
                    >
                      {COURIER_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Tracking ID</label>
                    <input
                      type="text"
                      placeholder="Waybill Code..."
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent font-mono"
                      required
                    />
                  </div>
                </div>

                {selectedCourier === "Other" && (
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Custom Courier Name</label>
                    <input
                      type="text"
                      value={customCourierName}
                      onChange={(e) => setCustomCourierName(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Fulfillment Status</label>
                    <select
                      value={shipmentStatus}
                      onChange={(e) => setShipmentStatus(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Estimated Delivery</label>
                    <input
                      type="date"
                      value={estDeliveryDate}
                      onChange={(e) => setEstDeliveryDate(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Internal notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button type="submit" className="bg-accent text-zinc-950 px-6 py-2.5 hover:bg-white text-[10px] font-bold uppercase tracking-wider transition">Create Shipment</button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="border border-zinc-700 text-zinc-400 px-6 py-2.5 hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-wider transition">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT SHIPMENT MODAL */}
      <AnimatePresence>
        {editingShipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setEditingShipment(null)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-[#121212] border border-[#1C1C1C] max-w-md w-full relative z-10 p-6 overflow-y-auto max-h-[90vh] space-y-6">
              <div className="flex justify-between items-start border-b border-[#1C1C1C] pb-4">
                <div>
                  <span className="text-[9px] text-accent font-bold uppercase tracking-wider block">Fulfillment Journey</span>
                  <h3 className="font-serif text-lg text-white">Edit Shipment Details</h3>
                </div>
                <button onClick={() => setEditingShipment(null)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleUpdateShipment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Courier Partner</label>
                    <select
                      value={editCourier}
                      onChange={(e) => setEditCourier(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent"
                      required
                    >
                      {COURIER_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Tracking ID</label>
                    <input
                      type="text"
                      value={editTracking}
                      onChange={(e) => setEditTracking(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent font-mono"
                      required
                    />
                  </div>
                </div>

                {editCourier === "Other" && (
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Custom Courier Name</label>
                    <input
                      type="text"
                      value={editCustomCourier}
                      onChange={(e) => setEditCustomCourier(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Fulfillment Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Estimated Delivery</label>
                    <input
                      type="date"
                      value={editEstDate}
                      onChange={(e) => setEditEstDate(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Internal notes</label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button type="submit" className="bg-accent text-zinc-950 px-6 py-2.5 hover:bg-white text-[10px] font-bold uppercase tracking-wider transition">Save Changes</button>
                  <button type="button" onClick={() => setEditingShipment(null)} className="border border-zinc-700 text-zinc-400 px-6 py-2.5 hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-wider transition">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL WITH TIMELINE */}
      <AnimatePresence>
        {selectedShipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedShipment(null)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-[#121212] border border-[#1C1C1C] max-w-xl w-full relative z-10 p-6 overflow-y-auto max-h-[90vh] space-y-6">
              <button onClick={() => setSelectedShipment(null)} className="absolute top-4 right-4 p-1.5 border border-[#1C1C1C] hover:bg-zinc-900 transition text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>

              <div className="space-y-6 text-xs text-zinc-300">
                <div className="border-b border-[#1C1C1C] pb-4">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Detailed Logs</span>
                  <h3 className="font-serif text-lg font-light text-white tracking-wide">
                    Shipment: {selectedShipment.id.slice(-6).toUpperCase()}
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">Tracking ID: {selectedShipment.trackingNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-[#0A0A0A] border border-[#1F1F1F] p-4">
                  <div>
                    <h4 className="text-[9px] text-accent font-bold uppercase tracking-wider mb-1.5">Shipping Details</h4>
                    <p className="font-semibold text-white">{selectedShipment.customerName || "Boutique Guest"}</p>
                    <p className="mt-1 font-light leading-relaxed">
                      {selectedShipment.shippingAddress?.addressLine1 || "No address line 1"}, {selectedShipment.shippingAddress?.city}, {selectedShipment.shippingAddress?.state} - {selectedShipment.shippingAddress?.postalCode}
                    </p>
                    <p className="mt-1 flex items-center space-x-1 text-zinc-500 font-mono">
                      <Phone className="w-3 h-3" />
                      <span>{selectedShipment.shippingAddress?.phone}</span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[9px] text-accent font-bold uppercase tracking-wider mb-1.5">Fulfillment Summary</h4>
                    <p>Carrier: <span className="font-semibold text-white">{selectedShipment.courierName}</span></p>
                    <p className="mt-1">Order Ref: <span className="font-mono">{selectedShipment.orderNumber}</span></p>
                    <p className="mt-1">Estimated Delivery: <span className="font-bold text-white">{selectedShipment.estimatedDeliveryDate ? new Date(selectedShipment.estimatedDeliveryDate).toLocaleDateString() : "Pending update"}</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Shipment Timeline History</h4>
                  <div className="relative border-l border-accent/20 pl-4 ml-2.5 space-y-4 pt-1 pb-1">
                    {selectedShipment.timeline && selectedShipment.timeline.length > 0 ? (
                      selectedShipment.timeline.map((item, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 bg-accent border border-black rounded-full" />
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-white uppercase text-[9px] tracking-wide bg-accent/10 border border-accent/25 px-1.5 py-0.5">
                                {item.status}
                              </span>
                              <span className="text-[9px] text-zinc-500 font-mono">
                                {new Date(item.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-zinc-400 text-[10px] leading-relaxed">
                              Action by <span className="text-zinc-300 font-semibold">{item.user}</span>: {item.action}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-500 italic">No timeline updates recorded.</p>
                    )}
                  </div>
                </div>

                {selectedShipment.notes && (
                  <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-4 text-[11px]">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold mb-1">Internal Notes</span>
                    <p className="font-light italic">"{selectedShipment.notes}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
