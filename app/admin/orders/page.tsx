"use client";

import React, { useEffect, useState } from "react";
import { fetchOrders, changeOrderStatus, getExportCsv } from "@/features/orders/orderActions";
import { fetchShipments } from "@/features/shipments/shipmentActions";
import { Order, Shipment } from "@/types";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/utils";
import { motion as m, AnimatePresence } from "framer-motion";
import { Search, AlertCircle, Edit2, Check, Printer, FileText, MapPin, Phone, User, Calendar, CreditCard, Sparkles, X, ChevronRight, Download, Filter, ArrowUpDown, Clock } from "lucide-react";

const ALL_STATUSES = [
  "Pending Payment",
  "Payment Received",
  "Order Confirmed",
  "Processing",
  "Packed",
  "Ready For Shipment",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded"
];

const PAYMENT_STATUSES = [
  { value: "all", label: "All Payments" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid / Received" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" }
];

const DATE_FILTERS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "Last 30 Days" }
];

const COURIERS_LIST = ["Not Assigned", "Professional Couriers", "Delhivery", "Blue Dart", "DTDC", "India Post", "DHL Express", "FedEx India", "UPS India"];

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Modal / Print / Details state
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [exporting, setExporting] = useState(false);

  const getAuthToken = async () => {
    if (!supabase) return undefined;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const loadOrdersData = async () => {
    try {
      const token = await getAuthToken();
      const [allOrders, allShipments] = await Promise.all([
        fetchOrders(token),
        fetchShipments(token)
      ]);
      setOrders(allOrders);
      setShipments(allShipments);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrdersData();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const token = await getAuthToken();
      const res = await changeOrderStatus(id, status, undefined, "admin", token);
      if (res.success) {
        if (selectedOrderDetails?.id === id && res.order) {
          setSelectedOrderDetails(res.order);
        }
        loadOrdersData();
      } else {
        alert(res.error || "Failed to update status");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };


  const handlePrintInvoice = () => {
    window.print();
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const csvContent = await getExportCsv("orders");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `orders_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export orders", err);
    } finally {
      setExporting(false);
    }
  };

  // Filter and Sort orders
  const filteredOrders = orders.filter((order) => {
    // 1. Search
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      (order.shippingAddress?.phone || "").includes(search);

    // 2. Status
    const matchesStatus = statusFilter === "all" || 
      order.orderStatus.toLowerCase() === statusFilter.toLowerCase();

    // 3. Payment Status
    const matchesPayment = paymentFilter === "all" || 
      order.paymentStatus.toLowerCase() === paymentFilter.toLowerCase();

    // 4. Date
    let matchesDate = true;
    if (dateFilter !== "all") {
      const orderTime = new Date(order.createdAt).getTime();
      const now = Date.now();
      if (dateFilter === "today") {
        matchesDate = now - orderTime <= 24 * 60 * 60 * 1000;
      } else if (dateFilter === "week") {
        matchesDate = now - orderTime <= 7 * 24 * 60 * 60 * 1000;
      } else if (dateFilter === "month") {
        matchesDate = now - orderTime <= 30 * 24 * 60 * 60 * 1000;
      }
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  }).sort((a, b) => {
    if (sortBy === "date-desc") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "date-asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === "total-desc") {
      return b.grandTotal - a.grandTotal;
    }
    if (sortBy === "total-asc") {
      return a.grandTotal - b.grandTotal;
    }
    return 0;
  });

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("pending")) return "bg-amber-950/20 text-amber-400 border-amber-900/35";
    if (s.includes("received") || s.includes("paid") || s.includes("confirm")) return "bg-sky-950/20 text-sky-400 border-sky-900/35";
    if (s.includes("process") || s.includes("pack")) return "bg-blue-950/20 text-blue-400 border-blue-900/35";
    if (s.includes("ship") || s.includes("ready")) return "bg-indigo-950/20 text-indigo-400 border-indigo-900/35";
    if (s.includes("deliver")) return "bg-emerald-950/20 text-emerald-400 border-emerald-900/35";
    if (s.includes("cancel") || s.includes("refund") || s.includes("return")) return "bg-rose-950/20 text-rose-450 border-rose-900/35";
    return "bg-zinc-800/40 text-zinc-400 border-zinc-700/35";
  };

  return (
    <div className="space-y-8 font-poppins text-xs text-zinc-100 bg-[#0A0A0A] print:bg-white print:text-black">
      
      {/* Title */}
      <div className="flex justify-between items-end print:hidden">
        <div className="space-y-1">
          <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Customer Purchases</span>
          <h1 className="font-serif text-3xl font-light tracking-wide text-white">Order Management</h1>
          <div className="w-12 h-[1px] bg-accent mt-3" />
        </div>
        
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="flex items-center space-x-2 bg-[#121212] border border-[#1F1F1F] hover:border-accent text-zinc-300 hover:text-white px-4 py-2 rounded-none transition"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? "Exporting..." : "Export CSV"}</span>
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury space-y-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 relative">
            <input
              type="text"
              placeholder="Search by ID, Number, name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none pl-9 pr-3 py-2.5 focus:outline-none focus:border-accent text-white"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          </div>

          <div className="md:col-span-8 flex flex-wrap gap-3 items-center md:justify-end text-zinc-400">
            {/* Status Filter */}
            <div className="flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-2.5 py-2 text-xs focus:outline-none focus:border-accent text-white"
              >
                <option value="all">All Fulfillment Statuses</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-2.5 py-2 text-xs focus:outline-none focus:border-accent text-white"
            >
              {PAYMENT_STATUSES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-2.5 py-2 text-xs focus:outline-none focus:border-accent text-white"
            >
              {DATE_FILTERS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>

            {/* Sorting */}
            <div className="flex items-center space-x-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-2.5 py-2 text-xs focus:outline-none focus:border-accent text-white"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="total-desc">Total: High to Low</option>
                <option value="total-asc">Total: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <div className="h-[40vh] flex items-center justify-center print:hidden">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#121212] border border-[#1C1C1C] p-12 text-center text-zinc-500 font-light flex flex-col items-center justify-center space-y-3 shadow-luxury print:hidden">
          <AlertCircle className="w-6 h-6 text-zinc-650" />
          <span>No purchases match your criteria.</span>
        </div>
      ) : (
        <div className="space-y-6 print:hidden">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-[#121212] border border-[#1C1C1C] shadow-luxury overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative group">
              
              {/* Order Info */}
              <div className="lg:col-span-3 p-5 bg-[#0F0F0F] border-r border-[#1C1C1C] space-y-4">
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Order ID</span>
                  <span className="font-mono font-bold text-white text-xs">{order.orderNumber}</span>
                </div>
                
                <div onClick={() => setSelectedOrderDetails(order)} className="cursor-pointer hover:underline group">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Customer (click details)</span>
                  <p className="font-semibold text-white flex items-center space-x-1">
                    <span>{order.customerName}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-accent" />
                  </p>
                  <p className="text-zinc-400 font-poppins">{order.customerEmail}</p>
                </div>
                
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Date Placed</span>
                  <p className="text-zinc-350">{new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <button
                    onClick={() => setInvoiceOrder(order)}
                    className="flex items-center space-x-1.5 text-accent hover:underline text-[9px] uppercase font-bold tracking-wider pt-2"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>
                </div>
              </div>

              {/* Status and Action Panel */}
              <div className="lg:col-span-5 p-5 border-r border-[#1C1C1C] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Fulfillment Status</span>
                    <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider rounded-none ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Payment Status</span>
                    <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider rounded-none ${
                      order.paymentStatus.toLowerCase() === "paid" ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/35" : "bg-amber-950/20 text-amber-400 border-amber-900/35"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#1C1C1C]/40 pt-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-zinc-500 uppercase tracking-widest font-bold text-[9px] block">Grand Total charged</span>
                    <span className="font-bold text-sm text-white">{formatPrice(order.grandTotal)}</span>
                  </div>

                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-2 py-1.5 text-[10px] focus:outline-none focus:border-accent text-white"
                  >
                    {ALL_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Courier assignment & tracking - Read Only from Shipments table */}
              <div className="lg:col-span-4 p-5 flex flex-col justify-between space-y-4 border-l border-[#1C1C1C]/40">
                <div className="space-y-4">
                  <div className="border-b border-[#1C1C1C]/40 pb-2">
                    <span className="text-[10px] text-accent font-bold uppercase tracking-widest block">Fulfillment Details</span>
                  </div>
                  
                  {(() => {
                    const matchingShipment = shipments.find((s) => s.orderId === order.id);
                    if (matchingShipment) {
                      return (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Courier Partner</span>
                            <span className="text-xs font-semibold text-zinc-100 block py-1">
                              {matchingShipment.courierName}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Tracking Number</span>
                            <span className="text-xs font-mono font-bold text-accent bg-[#121212] border border-[#1C1C1C] px-3 py-2 block w-fit">
                              {matchingShipment.trackingNumber}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Shipment Status</span>
                            <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded-full mt-1">
                              {matchingShipment.status}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="py-6 text-center space-y-2">
                        <span className="text-[10px] text-zinc-500 font-medium block">
                          No shipment assigned yet.
                        </span>
                        <span className="text-[9px] text-zinc-600 block">
                          Transition this order to "Packed" or "Ready For Shipment" to create a shipment.
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <div className="text-[9px] text-zinc-500 font-poppins pt-2 border-t border-[#1C1C1C]/40">
                  Manage carrier assignments & waybills in the Shipments tab.
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* PRINT INVOICE MODAL POPUP */}
      <AnimatePresence>
        {invoiceOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm print:hidden"
              onClick={() => setInvoiceOrder(null)}
            />
            
            <m.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white text-black max-w-2xl w-full relative z-10 shadow-2xl p-8 overflow-y-auto max-h-[92vh] print:max-h-full print:shadow-none print:border-0"
            >
              {/* Close & Print buttons */}
              <div className="absolute top-4 right-4 flex space-x-3 print:hidden">
                <button
                  onClick={handlePrintInvoice}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-900 text-white hover:bg-black transition text-[10px] uppercase font-bold tracking-wider"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="p-1.5 border border-zinc-300 hover:bg-zinc-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Invoice Layout */}
              <div className="space-y-6 text-xs leading-relaxed font-poppins">
                <div className="flex justify-between items-start border-b border-zinc-200 pb-5 mt-4">
                  <div className="space-y-1">
                    <h2 className="font-serif text-lg font-bold tracking-wide">SSS BOUTIQUE</h2>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Premium Fashion Showroom</p>
                    <p className="text-zinc-400">12, Landmark Enclave, T. Nagar, Chennai - 600017</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-mono text-base font-bold text-zinc-800">INVOICE</h3>
                    <p className="text-zinc-500">Order Ref: <span className="font-mono">{invoiceOrder.orderNumber}</span></p>
                    <p className="text-zinc-500">Date: {new Date(invoiceOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-[11px]">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Bill / Ship To</span>
                    <p className="font-bold text-zinc-900">{invoiceOrder.customerName}</p>
                    <p className="text-zinc-600 font-light leading-relaxed">
                      {invoiceOrder.shippingAddress.addressLine1}, {invoiceOrder.shippingAddress.city}, {invoiceOrder.shippingAddress.state} - {invoiceOrder.shippingAddress.postalCode}
                    </p>
                    <p className="text-zinc-500 mt-1">Phone: {invoiceOrder.shippingAddress.phone}</p>
                  </div>
                  
                  <div className="space-y-1 text-right">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Fulfillment Details</span>
                    {(() => {
                      const shp = shipments.find((s) => s.orderId === invoiceOrder.id);
                      return (
                        <>
                          <p>Courier: <span className="font-semibold">{shp ? shp.courierName : "Not Assigned"}</span></p>
                          <p>Tracking: <span className="font-mono font-semibold">{shp ? shp.trackingNumber : "Not Assigned"}</span></p>
                        </>
                      );
                    })()}
                    <p>Status: <span className="font-bold uppercase text-[9px]">{invoiceOrder.orderStatus}</span></p>
                  </div>
                </div>

                {/* Items table */}
                <div className="border border-zinc-200 mt-4">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 text-[9px] text-zinc-500 uppercase tracking-widest font-bold bg-zinc-50">
                        <th className="p-3">Item Details</th>
                        <th className="p-3 text-center">Size</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 text-zinc-700">
                      {invoiceOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-semibold text-zinc-900">{item.productName}</td>
                          <td className="p-3 text-center font-mono">{item.variantSize || "One Size"}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right font-mono">{formatPrice(item.price)}</td>
                          <td className="p-3 text-right font-bold text-zinc-900 font-mono">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end pt-3">
                  <div className="w-60 space-y-2 text-[11px] text-zinc-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-mono">{formatPrice(invoiceOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount code:</span>
                      <span className="font-mono">- {formatPrice(invoiceOrder.discount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping/Courier:</span>
                      <span className="font-mono">{formatPrice(invoiceOrder.shipping)}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-200 pt-2 font-bold text-zinc-900 text-xs">
                      <span>Grand Total charged:</span>
                      <span className="font-mono">{formatPrice(invoiceOrder.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-8 mt-6 text-center text-zinc-400 text-[10px]">
                  Thank you for shopping at SSS Boutique. For support queries, email concierge@sssboutique.com.
                </div>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL WITH ORDER TIMELINE */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedOrderDetails(null)}
            />
            
            <m.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121212] border border-[#1C1C1C] max-w-xl w-full relative z-10 shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="absolute top-4 right-4 p-1.5 border border-[#1C1C1C] hover:bg-zinc-900 transition text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6 text-xs text-zinc-300">
                <div className="border-b border-[#1C1C1C] pb-4">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Detailed Logs</span>
                  <h3 className="font-serif text-lg font-light text-white tracking-wide">
                    Order {selectedOrderDetails.orderNumber}
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">ID: {selectedOrderDetails.id}</p>
                </div>

                {/* Shipping info */}
                <div className="grid grid-cols-2 gap-6 bg-[#0A0A0A] border border-[#1F1F1F] p-4">
                  <div>
                    <h4 className="text-[9px] text-accent font-bold uppercase tracking-wider mb-1.5">Shipping Details</h4>
                    <p className="font-semibold text-white">{selectedOrderDetails.customerName}</p>
                    <p className="mt-1 font-light leading-relaxed">
                      {selectedOrderDetails.shippingAddress.addressLine1}, {selectedOrderDetails.shippingAddress.city}, {selectedOrderDetails.shippingAddress.state} - {selectedOrderDetails.shippingAddress.postalCode}
                    </p>
                    <p className="mt-1 flex items-center space-x-1 text-zinc-500 font-mono">
                      <Phone className="w-3 h-3" />
                      <span>{selectedOrderDetails.shippingAddress.phone}</span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[9px] text-accent font-bold uppercase tracking-wider mb-1.5">Order Metadata</h4>
                    <p>Notes: <span className="font-light">{selectedOrderDetails.orderNotes || "None"}</span></p>
                    <p className="mt-1">Items count: <span className="font-bold text-white">{selectedOrderDetails.items.length} items</span></p>
                    <p className="mt-1">Date: <span className="font-poppins">{new Date(selectedOrderDetails.createdAt).toLocaleString()}</span></p>
                  </div>
                </div>

                {/* Items detail list */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Ordered Silhouettes</h4>
                  <div className="space-y-2">
                    {selectedOrderDetails.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-[#1F1F1F] pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center space-x-2.5">
                          {item.productImage && (
                            <img src={item.productImage} alt="" className="w-9 h-12 object-cover border border-[#1F1F1F]" />
                          )}
                          <div>
                            <p className="font-semibold text-white">{item.productName}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">Size: {item.variantSize || "One Size"} • Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-mono text-zinc-400">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TIMELINE */}
                <div className="space-y-4">
                  <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Order Status History Timeline</h4>
                  <div className="relative border-l border-accent/20 pl-4 ml-2.5 space-y-4 pt-1 pb-1">
                    {selectedOrderDetails.statusHistory && selectedOrderDetails.statusHistory.length > 0 ? (
                      selectedOrderDetails.statusHistory.map((item, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 bg-accent border border-black rounded-full" />
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-white uppercase text-[10px] tracking-wide bg-accent/10 border border-accent/20 px-1.5 py-0.5">
                                {item.status}
                              </span>
                              <span className="text-[9px] text-zinc-500 font-mono flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(item.timestamp).toLocaleString()}</span>
                              </span>
                            </div>
                            <p className="text-zinc-400 text-[10px] leading-relaxed">
                              Action by <span className="text-zinc-300 font-semibold">{item.user}</span>: {item.action}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="relative">
                        <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 bg-accent border border-black rounded-full" />
                        <div>
                          <p className="font-semibold text-white">Order Created</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{new Date(selectedOrderDetails.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cancel Trigger */}
                {selectedOrderDetails.orderStatus !== "Cancelled" && selectedOrderDetails.orderStatus !== "Cancelled".toLowerCase() && (
                  <div className="pt-2 border-t border-[#1C1C1C] flex justify-end">
                    <button
                      onClick={() => handleStatusChange(selectedOrderDetails.id, "Cancelled")}
                      className="px-4 py-2 border border-rose-900/50 text-rose-455 hover:bg-rose-950/20 transition font-bold uppercase tracking-wider text-[10px]"
                    >
                      Cancel / Refund Order
                    </button>
                  </div>
                )}
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
}
