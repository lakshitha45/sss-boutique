"use client";

import React, { useEffect, useState } from "react";
import { fetchOrders, changeOrderStatus } from "@/features/orders/orderActions";
import { Order } from "@/types";
import { formatPrice } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertCircle, Edit2, Check, Printer, FileText, MapPin, Phone, User, Calendar, CreditCard, Sparkles, X, ChevronRight } from "lucide-react";

const ORDER_STEPS = ["pending", "confirmed", "packed", "shipped", "delivered"];

const COURIERS_LIST = ["Delhivery", "Blue Dart", "DTDC", "DHL Express", "FedEx India", "UPS India"];

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingTrackingId, setEditingTrackingId] = useState<string | null>(null);
  const [tempTracking, setTempTracking] = useState("");
  
  // Courier state
  const [selectedCouriers, setSelectedCouriers] = useState<Record<string, string>>({});
  
  // Modal / Print / Details state
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [selectedCustomerOrder, setSelectedCustomerOrder] = useState<Order | null>(null);

  const loadOrdersData = async () => {
    try {
      const allOrders = await fetchOrders();
      setOrders(allOrders);

      // Initialize courier partner state randomly or with mock
      const couriers: Record<string, string> = {};
      allOrders.forEach((ord) => {
        couriers[ord.id] = COURIERS_LIST[Math.floor((ord.grandTotal % 6))];
      });
      setSelectedCouriers(couriers);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrdersData();
  }, []);

  const handleStatusChange = async (id: string, status: Order["orderStatus"]) => {
    try {
      const res = await changeOrderStatus(id, status);
      if (res.success) {
        loadOrdersData();
      } else {
        alert(res.error || "Failed to update status");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleSaveTracking = async (id: string, currentStatus: Order["orderStatus"]) => {
    try {
      const res = await changeOrderStatus(id, currentStatus, tempTracking);
      if (res.success) {
        setEditingTrackingId(null);
        loadOrdersData();
      } else {
        alert(res.error || "Failed to update tracking");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update tracking");
    }
  };

  const handleCourierChange = (id: string, name: string) => {
    setSelectedCouriers((prev) => ({ ...prev, [id]: name }));
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Order["orderStatus"]) => {
    switch (status) {
      case "pending":
        return "bg-amber-950/20 text-amber-400 border-amber-900/35";
      case "confirmed":
        return "bg-sky-950/20 text-sky-400 border-sky-900/35";
      case "packed":
        return "bg-blue-950/20 text-blue-400 border-blue-900/35";
      case "shipped":
        return "bg-indigo-950/20 text-indigo-400 border-indigo-900/35";
      case "delivered":
        return "bg-emerald-950/20 text-emerald-400 border-emerald-900/35";
      case "cancelled":
        return "bg-rose-950/20 text-rose-455 border-rose-900/35";
      default:
        return "bg-zinc-800/40 text-zinc-400 border-zinc-700/35";
    }
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
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#121212] border border-[#1C1C1C] p-4 shadow-luxury print:hidden">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by ID, name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none pl-9 pr-3 py-2.5 focus:outline-none focus:border-accent text-white"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end text-zinc-400">
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2 text-xs focus:outline-none focus:border-accent text-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
              
              {/* Order info */}
              <div className="lg:col-span-3 p-5 bg-[#0F0F0F] border-r border-[#1C1C1C] space-y-4">
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Order Number</span>
                  <span className="font-mono font-bold text-white text-xs">{order.id}</span>
                </div>
                <div onClick={() => setSelectedCustomerOrder(order)} className="cursor-pointer hover:underline group">
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

              {/* Timeline fulfillment progress (middle 5 cols) */}
              <div className="lg:col-span-5 p-5 border-r border-[#1C1C1C] flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block mb-3.5">Fulfillment Timeline</span>
                  
                  {order.orderStatus === "cancelled" ? (
                    <div className="bg-rose-950/10 text-rose-455 border border-rose-900/30 p-3 text-[11px]">
                      This order has been cancelled.
                    </div>
                  ) : (
                    <div className="flex items-center justify-between relative py-2">
                      {/* Connection bar */}
                      <div className="absolute left-3 right-3 top-[17px] h-0.5 bg-zinc-800" />
                      
                      {ORDER_STEPS.map((step, idx) => {
                        const currentIdx = ORDER_STEPS.indexOf(order.orderStatus);
                        const active = idx <= currentIdx;
                        
                        return (
                          <div key={step} className="flex flex-col items-center z-10 relative">
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                              active ? "bg-accent text-foreground" : "bg-zinc-900 border border-zinc-800 text-zinc-500"
                            }`}>
                              {active && "✓"}
                            </span>
                            <span className="text-[8px] uppercase tracking-widest mt-1.5 text-zinc-400 scale-90">
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-[#1C1C1C]/40 pt-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-zinc-500 uppercase tracking-widest font-bold text-[9px] block">Grand Total charged</span>
                    <span className="font-bold text-sm text-white">{formatPrice(order.grandTotal)}</span>
                  </div>

                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order["orderStatus"])}
                    className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-2 py-1.5 text-[10px] focus:outline-none focus:border-accent text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Courier assignment & tracking */}
              <div className="lg:col-span-4 p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Courier Partner</span>
                    <select
                      value={selectedCouriers[order.id] || "Delhivery"}
                      onChange={(e) => handleCourierChange(order.id, e.target.value)}
                      className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2 text-[11px] focus:outline-none focus:border-accent text-white w-full"
                    >
                      {COURIERS_LIST.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Tracking Number</span>
                    {editingTrackingId === order.id ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={tempTracking}
                          onChange={(e) => setTempTracking(e.target.value)}
                          placeholder="Tracking Key..."
                          className="bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-[11px] w-full focus:outline-none text-white font-mono"
                        />
                        <button
                          onClick={() => handleSaveTracking(order.id, order.orderStatus)}
                          className="bg-accent text-foreground p-2 hover:bg-accent/90 transition flex-shrink-0"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] bg-[#0A0A0A] border border-[#1C1C1C] p-2.5 font-mono">
                        <span className="truncate max-w-[150px] font-semibold text-accent">
                          {order.trackingNumber || "No tracking key"}
                        </span>
                        <button
                          onClick={() => {
                            setEditingTrackingId(order.id);
                            setTempTracking(order.trackingNumber || "");
                          }}
                          className="text-zinc-500 hover:text-white transition p-0.5"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[9px] text-zinc-500 font-poppins">
                  Shipment method handled by default courier configuration.
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm print:hidden"
              onClick={() => setInvoiceOrder(null)}
            />
            
            <motion.div
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
                    <p className="text-zinc-500">Order ID: <span className="font-mono">{invoiceOrder.id}</span></p>
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
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Fulfillment details</span>
                    <p>Courier: <span className="font-semibold">{selectedCouriers[invoiceOrder.id] || "Delhivery"}</span></p>
                    <p>Tracking: <span className="font-mono font-semibold">{invoiceOrder.trackingNumber || "PENDING"}</span></p>
                    <p>Status: <span className="font-bold uppercase text-[9px]">{invoiceOrder.orderStatus}</span></p>
                  </div>
                </div>

                {/* Items table */}
                <div className="border border-zinc-200 mt-4">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 text-[9px] text-zinc-500 uppercase tracking-widest font-bold bg-zinc-50">
                        <th className="p-3">Item details</th>
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
                  <div className="w-60 space-y-2 text-[11px] text-zinc-650">
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOMER PROFILE DETAIL PANEL */}
      <AnimatePresence>
        {selectedCustomerOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedCustomerOrder(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="bg-[#121212] border border-[#1C1C1C] max-w-md w-full relative z-10 shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedCustomerOrder(null)}
                className="absolute top-4 right-4 p-1.5 border border-[#1C1C1C] hover:bg-zinc-900 transition text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6 text-xs">
                <div className="flex items-center space-x-3.5 border-b border-[#1C1C1C] pb-5">
                  <div className="w-11 h-11 bg-accent/20 border border-accent/35 text-accent font-bold text-lg font-mono rounded-none flex items-center justify-center">
                    {selectedCustomerOrder.customerName[0]}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-light text-white tracking-wide">{selectedCustomerOrder.customerName}</h3>
                    <span className="text-[10px] text-zinc-500 block font-poppins">{selectedCustomerOrder.customerEmail}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-accent" />
                    <span>Customer Metrics</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4 bg-[#0A0A0A] border border-[#1F1F1F] p-4 text-[11px] text-zinc-300">
                    <div>
                      <span>Total Spent:</span>
                      <span className="font-bold text-accent block mt-0.5">{formatPrice(selectedCustomerOrder.grandTotal * 2)}</span>
                    </div>
                    <div>
                      <span>Total Orders:</span>
                      <span className="font-bold text-white block mt-0.5">2 Orders</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span>Default Shipping Address</span>
                  </h4>
                  <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-4 leading-relaxed font-light text-zinc-300">
                    <p className="font-bold text-white mb-1">{selectedCustomerOrder.shippingAddress.fullName}</p>
                    <p>{selectedCustomerOrder.shippingAddress.addressLine1}, {selectedCustomerOrder.shippingAddress.city}, {selectedCustomerOrder.shippingAddress.state} - {selectedCustomerOrder.shippingAddress.postalCode}</p>
                    <p className="flex items-center space-x-1.5 mt-2 font-mono text-[10px]">
                      <Phone className="w-3 h-3 text-zinc-500" />
                      <span>{selectedCustomerOrder.shippingAddress.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>Customer History Log</span>
                  </h4>
                  <div className="space-y-2 text-zinc-400">
                    <div className="flex justify-between items-center text-[10px] bg-[#0A0A0A] border border-[#1F1F1F]/40 p-2.5">
                      <span>Order {selectedCustomerOrder.id} ({selectedCustomerOrder.orderStatus})</span>
                      <span className="font-bold text-white">{formatPrice(selectedCustomerOrder.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] bg-[#0A0A0A] border border-[#1F1F1F]/40 p-2.5 opacity-60">
                      <span>Order #ORD-1012 (delivered)</span>
                      <span className="font-bold text-white">{formatPrice(selectedCustomerOrder.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
