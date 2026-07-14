"use client";

import React, { useState } from "react";
import { formatPrice } from "@/utils";
import { motion } from "framer-motion";
import { Search, User, MapPin, ShoppingBag, Heart, ArrowUpRight } from "lucide-react";

// Mock customer data
const MOCK_CUSTOMERS = [
  {
    id: "cust_1",
    fullName: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    role: "customer",
    joinedDate: "May 12, 2026",
    totalOrders: 6,
    totalSpend: 1540,
    phone: "+91 98765 43210",
    addresses: [
      "12, Landmark Enclave, T. Nagar, Chennai, Tamil Nadu - 600017",
      "Plot 45, Sector 4, HSR Layout, Bengaluru, Karnataka - 560102"
    ],
    wishlistCount: 4,
    recentOrders: [
      { id: "ORD-1031", date: "Jul 05, 2026", amount: 420, status: "delivered" },
      { id: "ORD-1012", date: "Jun 18, 2026", amount: 280, status: "delivered" }
    ]
  },
  {
    id: "cust_2",
    fullName: "Ananya Iyer",
    email: "ananya.iyer@outlook.com",
    role: "customer",
    joinedDate: "Jun 02, 2026",
    totalOrders: 3,
    totalSpend: 840,
    phone: "+91 87654 32109",
    addresses: [
      "Flat 302, Shanti Vihar, Mylapore, Chennai, Tamil Nadu - 600004"
    ],
    wishlistCount: 2,
    recentOrders: [
      { id: "ORD-1042", date: "Jul 12, 2026", amount: 320, status: "pending" },
      { id: "ORD-1025", date: "Jun 24, 2026", amount: 520, status: "delivered" }
    ]
  },
  {
    id: "cust_3",
    fullName: "Rohan Verma",
    email: "rohan.verma@yahoo.com",
    role: "admin",
    joinedDate: "Jan 15, 2026",
    totalOrders: 8,
    totalSpend: 2450,
    phone: "+91 76543 21098",
    addresses: [
      "404, Green Meadows, Gachibowli, Hyderabad, Telangana - 500032"
    ],
    wishlistCount: 0,
    recentOrders: [
      { id: "ORD-1002", date: "Jan 20, 2026", amount: 180, status: "delivered" }
    ]
  },
  {
    id: "cust_4",
    fullName: "Meera Nair",
    email: "meera.nair@gmail.com",
    role: "customer",
    joinedDate: "Jun 28, 2026",
    totalOrders: 1,
    totalSpend: 190,
    phone: "+91 95432 10987",
    addresses: [
      "Villa 8, Orchid Gardens, Kakkanad, Kochi, Kerala - 682030"
    ],
    wishlistCount: 7,
    recentOrders: [
      { id: "ORD-1039", date: "Jul 10, 2026", amount: 190, status: "shipped" }
    ]
  },
  {
    id: "cust_5",
    fullName: "Siddharth Rao",
    email: "sid.rao@gmail.com",
    role: "customer",
    joinedDate: "Feb 10, 2026",
    totalOrders: 12,
    totalSpend: 4620,
    phone: "+91 94321 09876",
    addresses: [
      "5th Floor, Palm Heights, Jayanagar, Bengaluru, Karnataka - 560041"
    ],
    wishlistCount: 3,
    recentOrders: [
      { id: "ORD-1028", date: "Jun 30, 2026", amount: 640, status: "delivered" },
      { id: "ORD-1017", date: "May 22, 2026", amount: 390, status: "delivered" }
    ]
  }
];

export default function CustomersPage() {
  const [customers] = useState(MOCK_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter customers
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.fullName.toLowerCase().includes(search.toLowerCase()) ||
      cust.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || cust.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalSpendAll = customers.reduce((sum, c) => sum + c.totalSpend, 0);
  const avgOrderValue = totalSpendAll / customers.reduce((sum, c) => sum + c.totalOrders, 0);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">New This Month</span>
          <span className="text-xl font-bold text-white block mt-1">3 buyers</span>
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
                              <ul className="space-y-2 text-zinc-300">
                                {cust.addresses.map((addr, i) => (
                                  <li key={i} className="bg-[#121212] border border-[#1F1F1F] p-2.5 leading-relaxed font-light text-[11px]">
                                    {addr}
                                  </li>
                                ))}
                              </ul>
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
                                  {cust.recentOrders.map((ord) => (
                                    <div key={ord.id} className="flex justify-between items-center text-[11px]">
                                      <span className="font-mono text-white">{ord.id} ({ord.date})</span>
                                      <span className="font-bold text-accent">{formatPrice(ord.amount)}</span>
                                    </div>
                                  ))}
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
      </div>
    </div>
  );
}
