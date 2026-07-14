"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchOrders } from "@/features/orders/orderActions";
import { fetchShipmentByOrderId } from "@/features/shipments/shipmentActions";
import { Order, Shipment } from "@/types";
import { formatPrice } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Truck, Calendar, Clock, AlertCircle, Sparkles, ChevronRight } from "lucide-react";

export default function PublicOrderTrackingPage() {
  const [orderQuery, setOrderQuery] = useState("");
  const [contactQuery, setContactQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [foundShipment, setFoundShipment] = useState<Shipment | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery || !contactQuery) {
      setError("Please fill in both order number and contact email/phone.");
      return;
    }

    setLoading(true);
    setError("");
    setFoundOrder(null);
    setFoundShipment(null);

    try {
      const allOrders = await fetchOrders();
      // Search matching order by orderNumber/ID and email/phone
      const match = allOrders.find((o) => {
        const matchesRef = o.orderNumber.toLowerCase() === orderQuery.trim().toLowerCase() ||
                           o.id.toLowerCase() === orderQuery.trim().toLowerCase();
        const matchesContact = o.customerEmail.toLowerCase() === contactQuery.trim().toLowerCase() ||
                               (o.shippingAddress?.phone || "").replace(/\s+/g, "") === contactQuery.trim().replace(/\s+/g, "");
        return matchesRef && matchesContact;
      });

      if (!match) {
        setError("No matching order was found with the credentials provided. Please double-check your Order Reference and Contact details.");
        return;
      }

      setFoundOrder(match);
      const shp = await fetchShipmentByOrderId(match.id);
      setFoundShipment(shp);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("pending")) return "bg-amber-950/40 text-amber-400 border-amber-900/50";
    if (s.includes("received") || s.includes("confirm") || s.includes("paid")) return "bg-sky-950/40 text-sky-400 border-sky-900/50";
    if (s.includes("process") || s.includes("pack")) return "bg-blue-950/40 text-blue-400 border-blue-900/50";
    if (s.includes("ship") || s.includes("ready")) return "bg-indigo-950/40 text-indigo-400 border-indigo-900/50";
    if (s.includes("deliver")) return "bg-emerald-950/40 text-emerald-400 border-emerald-900/50";
    if (s.includes("cancel") || s.includes("refund") || s.includes("return")) return "bg-rose-950/40 text-rose-400 border-rose-900/50";
    return "bg-zinc-900/60 text-zinc-400 border-zinc-800";
  };

  return (
    <>
      <Header />
      <main className="flex-1 min-h-[75vh] bg-[#0A0A0A] text-zinc-100 py-16 font-poppins relative selection:bg-accent selection:text-foreground">
        
        <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-[10px] text-accent font-bold uppercase tracking-[0.25em]">Fulfillment Journey</span>
            <h1 className="font-serif text-3xl font-light tracking-wide text-white">Track Order</h1>
            <div className="w-12 h-[1px] bg-accent mx-auto mt-3" />
            <p className="text-zinc-550 text-[11px] font-light leading-relaxed max-w-sm mx-auto">
              Verify your parcel status using your unique SSS Boutique Order Reference and registered contact credentials.
            </p>
          </div>

          {/* Search Card Form */}
          <form onSubmit={handleTrack} className="bg-[#121212] border border-[#1A1A1A] p-6 space-y-4 shadow-luxury">
            <div className="space-y-1 text-xs">
              <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold block">Order Reference Number</label>
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="e.g. SSS-ORD-XXXXXX-XXXX"
                className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3.5 py-2.5 text-white focus:outline-none focus:border-accent text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold block">Email or Phone Number</label>
              <input
                type="text"
                value={contactQuery}
                onChange={(e) => setContactQuery(e.target.value)}
                placeholder="Registered contact email or phone..."
                className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3.5 py-2.5 text-white focus:outline-none focus:border-accent text-xs"
                required
              />
            </div>

            {error && (
              <div className="bg-rose-950/15 border border-rose-900/30 p-3 flex items-start space-x-2 text-[10px] text-rose-350">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-455 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-zinc-950 hover:bg-white transition py-2.5 uppercase font-bold tracking-widest text-[10px] mt-2 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Locate Journey</span>
                </>
              )}
            </button>
          </form>

          {/* Tracking Result Details */}
          <AnimatePresence>
            {foundOrder && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                {/* Status card */}
                <div className="border border-[#1A1A1A] bg-[#121212] p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#1F1F1F] pb-3.5 text-[11px]">
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Order ID</span>
                      <span className="font-mono text-zinc-300 font-semibold">{foundOrder.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider block text-right">Fulfillment Status</span>
                      <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold border block mt-1 ${
                        foundShipment ? getStatusColor(foundShipment.status) : getStatusColor(foundOrder.orderStatus)
                      }`}>
                        {foundShipment ? foundShipment.status : foundOrder.orderStatus}
                      </span>
                    </div>
                  </div>

                  {foundShipment ? (
                    <div className="grid grid-cols-2 gap-4 text-[11px] leading-relaxed text-zinc-300">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-0.5">Courier Carrier</span>
                        <strong className="text-white">{foundShipment.courierName}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-0.5">Tracking Number</span>
                        <strong className="text-accent font-mono">{foundShipment.trackingNumber}</strong>
                      </div>
                      {foundShipment.estimatedDeliveryDate && (
                        <div className="col-span-2 pt-2 border-t border-[#1C1C1C]/40 flex items-center space-x-1.5 text-zinc-400">
                          <Calendar className="w-3.5 h-3.5 text-accent" />
                          <span>Delivery Estimate: <strong>{new Date(foundShipment.estimatedDeliveryDate).toLocaleDateString()}</strong></span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[#0A0A0A] border border-[#1F1F1F]/45 p-3 text-[10px] text-zinc-500 flex items-center space-x-2">
                      <Truck className="w-3.5 h-3.5 text-accent" />
                      <span>Fulfillment dispatch pending: carrier allocation details will update shortly.</span>
                    </div>
                  )}
                </div>

                {/* Timeline display */}
                <div className="border border-[#1A1A1A] bg-[#121212] p-5 space-y-4">
                  <h3 className="font-serif text-sm font-light text-white tracking-wide">Fulfillment Timeline Journey</h3>
                  <div className="relative border-l border-accent/20 pl-4 ml-2.5 space-y-4 pt-1 pb-1">
                    {foundShipment && foundShipment.timeline && foundShipment.timeline.length > 0 ? (
                      foundShipment.timeline.map((item, index) => (
                        <div key={index} className="relative text-[11px]">
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
                            <p className="text-zinc-400 font-light text-[10px]">{item.action}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Fallback to order status history if no shipment created yet
                      foundOrder.statusHistory && foundOrder.statusHistory.length > 0 ? (
                        foundOrder.statusHistory.map((item, index) => (
                          <div key={index} className="relative text-[11px]">
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
                              <p className="text-zinc-400 font-light text-[10px]">{item.action}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="relative text-[11px]">
                          <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 bg-accent border border-black rounded-full" />
                          <div className="space-y-0.5">
                            <span className="font-semibold text-white uppercase text-[9px] tracking-wide bg-accent/10 border border-accent/25 px-1.5 py-0.5">Placed</span>
                            <span className="text-[9px] text-zinc-500 font-mono">
                              {new Date(foundOrder.createdAt).toLocaleString()}
                            </span>
                            <p className="text-zinc-400 font-light text-[10px]">Your order is successfully received.</p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>
      <Footer />
    </>
  );
}
