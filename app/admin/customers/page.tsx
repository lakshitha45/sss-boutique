"use client";

import React, { useEffect, useState } from "react";
import { formatPrice } from "@/utils";
import { motion } from "framer-motion";
import { Search, User, MapPin, ShoppingBag, Heart } from "lucide-react";
import { fetchCustomers, fetchOrders } from "@/features/orders/orderActions";

interface CustomerData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  joinedDate: string;
  totalOrders: number;
  totalSpend: number;
  phone: string;
  addresses: string[];
  wishlistCount: number;
  recentOrders: { id: string; date: string; amount: number; status: string }[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [profiles, ordersList] = await Promise.all([fetchCustomers(), fetchOrders()]);
      const mapped = profiles.map((p) => {
        const userOrders = ordersList.filter((o) => o.customerEmail?.toLowerCase() === p.email?.toLowerCase());
        const totalSpend = userOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        const addressesSet = new Set<string>();
        userOrders.forEach((o) => {
          if (o.shippingAddress) {
            const addr = `${o.shippingAddress.addressLine1}${o.shippingAddress.addressLine2 ? `, ${o.shippingAddress.addressLine2}` : ""}, ${o.shippingAddress.city}, ${o.shippingAddress.state} - ${o.shippingAddress.postalCode}`;
            addressesSet.add(addr);
          }
        });

        const recentOrders = userOrders.slice(0, 3).map((o) => ({
          id: o.orderNumber || o.id,
          date: new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          amount: o.grandTotal || 0,
          status: o.orderStatus || "pending",
        }));

        return {
          id: p.id,
          fullName: p.fullName || "Unnamed User",
          email: p.email || "",
          role: p.role || "customer",
          joinedDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A",
          totalOrders: userOrders.length,
          totalSpend,
          phone: p.phone || "No phone provided",
          addresses: Array.from(addressesSet),
          wishlistCount: 0,
          recentOrders,
        };
      });
      setCustomers(mapped);
    } catch (err) {
      console.error("Failed to load customers page data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter customers
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.fullName.toLowerCase().includes(search.toLowerCase()) ||
      cust.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || cust.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalSpendAll = customers.reduce((sum, c) => sum + c.totalSpend, 0);
  const totalOrdersCount = customers.reduce((sum, c) => sum + c.totalOrders, 0);
  const avgOrderValue = totalOrdersCount > 0 ? totalSpendAll / totalOrdersCount : 0;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
      <div className="space-y-1">
        <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">User Management</span>
        <h1 className="font-serif text-3xl font-light tracking-wide text-white">Customers Index</h1>
        <div className="w-12 h-[1px] bg-accent mt-3" />
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Total Buyers</span>
          <span className="text-xl font-bold text-white block mt-1">{customers.length}</span>
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Total Orders</span>
          <span className="text-xl font-bold text-white block mt-1">{totalOrdersCount} orders</span>
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Accumulated Spend</span>
          <span className="text-xl font-bold text-accent block mt-1">{formatPrice(totalSpendAll)}</span>
        </div>
        <div className="bg-[#121212] border border-[#1C1C1C] p-5 shadow-luxury">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">AOV Per Order</span>
          <span className="text-xl font-bold text-white block mt-1">{formatPrice(avgOrderValue)}</span>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none pl-9 pr-3 py-2.5 focus:outline-none focus:border-accent text-xs text-white placeholder:text-zinc-500"
          />
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end text-zinc-400 text-xs">
          <span>Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2 text-xs focus:outline-none focus:border-accent text-white"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers Only</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* CUSTOMERS DATA TABLE */}
      <div className="bg-[#121212] border border-[#1C1C1C] overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs font-light">
            No customers found matching the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1C1C1C] text-[10px] text-zinc-500 uppercase tracking-widest font-bold bg-[#0C0C0C]">
                  <th className="p-4 w-12"></th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Orders</th>
                  <th className="p-4 text-right">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]">
                {filteredCustomers.map((cust) => {
                  const isExpanded = expandedId === cust.id;
                  return (
                    <React.Fragment key={cust.id}>
                      <tr
                        onClick={() => toggleExpand(cust.id)}
                        className="hover:bg-[#1A1A1A] transition cursor-pointer"
                      >
                        <td className="p-4">
                          <div className="w-8 h-8 rounded-full bg-[#1C1C1C] flex items-center justify-center text-accent font-bold font-mono">
                            {cust.fullName[0]}
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <span className="font-semibold text-white block">{cust.fullName}</span>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">{cust.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider rounded-none ${
                            cust.role === "admin"
                              ? "bg-purple-950/20 text-purple-400 border-purple-900/35"
                              : "bg-zinc-850 text-zinc-400 border-zinc-700/35"
                          }`}>
                            {cust.role}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-400">{cust.joinedDate}</td>
                        <td className="p-4 text-right font-semibold text-white">{cust.totalOrders}</td>
                        <td className="p-4 text-right font-semibold text-accent">{formatPrice(cust.totalSpend)}</td>
                      </tr>

                      {/* EXPANDABLE DRAWER ROW */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-[#0C0C0C] p-6 border-t border-[#1C1C1C]">
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs"
                            >
                              {/* Contact & Phone */}
                              <div className="space-y-3">
                                <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center space-x-1.5">
                                  <User className="w-3.5 h-3.5 text-accent" />
                                  <span>Contact Details</span>
                                </h4>
                                <div className="space-y-1 text-zinc-300">
                                  <p>Phone: <span className="text-white font-mono">{cust.phone}</span></p>
                                  <p>Customer ID: <span className="text-white font-mono">{cust.id}</span></p>
                                </div>
                              </div>

                              {/* Saved Addresses */}
                              <div className="space-y-3">
                                <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center space-x-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-accent" />
                                  <span>Shipping Addresses</span>
                                </h4>
                                {cust.addresses.length === 0 ? (
                                  <span className="text-zinc-500 italic">No saved addresses found.</span>
                                ) : (
                                  <ul className="space-y-2 text-zinc-300">
                                    {cust.addresses.map((addr, i) => (
                                      <li key={i} className="bg-[#121212] border border-[#1F1F1F] p-2.5 leading-relaxed font-light text-[11px]">
                                        {addr}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>

                              {/* Wishlist & Recent Orders */}
                              <div className="space-y-3">
                                <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center space-x-1.5">
                                  <ShoppingBag className="w-3.5 h-3.5 text-accent" />
                                  <span>Activity Summary</span>
                                </h4>
                                <div className="space-y-2 text-zinc-300">
                                  <p className="flex items-center space-x-2">
                                    <Heart className="w-3.5 h-3.5 text-rose-450 fill-rose-950/20" />
                                    <span>{cust.wishlistCount} Saved Products in Wishlist</span>
                                  </p>
                                  
                                  <div className="border-t border-[#1F1F1F] pt-2 mt-2 space-y-1.5">
                                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Recent Checkouts</span>
                                    {cust.recentOrders.length === 0 ? (
                                      <span className="text-zinc-500 italic text-[10px]">No orders placed yet.</span>
                                    ) : (
                                      cust.recentOrders.map((ord) => (
                                        <div key={ord.id} className="flex justify-between items-center text-[11px]">
                                          <span className="font-mono text-white">{ord.id} ({ord.date})</span>
                                          <span className="font-bold text-accent">{formatPrice(ord.amount)}</span>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
