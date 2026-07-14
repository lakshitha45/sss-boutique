"use client";

import React, { useState } from "react";
import { formatPrice } from "@/utils";
import { motion } from "framer-motion";
import { Calendar, DollarSign, ShoppingCart, Percent, Heart, ArrowUpRight, ArrowDownRight, Clock, UserCheck } from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "90d" | "year">("30d");

  // Mock revenue chart data (Jan-Jun)
  const revenueData = [
    { month: "Jan", revenue: 8400, orders: 42 },
    { month: "Feb", revenue: 11200, orders: 58 },
    { month: "Mar", revenue: 9800, orders: 49 },
    { month: "Apr", revenue: 15400, orders: 74 },
    { month: "May", revenue: 19800, orders: 92 },
    { month: "Jun", revenue: 24500, orders: 118 },
  ];

  // Mock category sales data
  const categoryData = [
    { name: "Sarees", percentage: 45, color: "#D45D79", raw: 11025 },
    { name: "Kurtis", percentage: 25, color: "#C5A880", raw: 6125 },
    { name: "Salwars", percentage: 15, color: "#6A89CC", raw: 3675 },
    { name: "Lehengas", percentage: 10, color: "#82CCDD", raw: 2450 },
    { name: "Accessories", percentage: 5, color: "#4A69BD", raw: 1225 },
  ];

  // Mock top selling products list
  const topProducts = [
    { name: "Kanchipuram Red Bridal Silk Saree", sales: 48, revenue: 19200, category: "Sarees" },
    { name: "Organza Midnight Embroidered Suit", sales: 34, revenue: 11560, category: "Salwars" },
    { name: "Hand-Block Indigo Printed Cotton Kurti", sales: 28, revenue: 2520, category: "Kurtis" },
    { name: "Georgette Floral Casual Shopper Dress", sales: 19, revenue: 1710, category: "Kurtis" },
  ];

  // Mock activity logs
  const activityTimeline = [
    { id: "1", action: "Order #ORD-1042 paid by Aiswarya R.", time: "10 mins ago", type: "payment" },
    { id: "2", action: "Inventory updated for Organza Suit (M: 20 units)", time: "1 hr ago", type: "stock" },
    { id: "3", action: "Bulk Excel catalog spreadsheet imported successfully", time: "3 hrs ago", type: "import" },
    { id: "4", action: "Coupon FLAT500 created by Admin", time: "Yesterday at 3:15 PM", type: "promo" },
  ];

  // SVG Line Chart details
  const maxRevenue = Math.max(...revenueData.map((r) => r.revenue));
  const chartHeight = 160;
  const chartWidth = 600;

  // Donut chart calculations
  let accumulatedAngle = 0;

  return (
    <div className="space-y-8 font-poppins text-zinc-100 bg-[#0A0A0A]">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
        <div className="space-y-1">
          <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Business Intelligence</span>
          <h1 className="font-serif text-3xl font-light tracking-wide text-white">Analytics Overview</h1>
          <div className="w-12 h-[1px] bg-accent mt-3" />
        </div>

        {/* TIME RANGE SELECTOR */}
        <div className="flex bg-[#121212] border border-[#1C1C1C] p-1 font-bold text-[9px] uppercase tracking-wider text-zinc-500 rounded-none">
          {(["today", "7d", "30d", "90d", "year"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 transition ${timeRange === r ? "bg-accent text-foreground font-black" : "hover:text-zinc-200"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Accumulated Sales</span>
              <span className="text-xl font-bold text-white">{formatPrice(24500)}</span>
            </div>
            <div className="w-8 h-8 rounded-none bg-emerald-950/20 flex items-center justify-center text-emerald-400 border border-emerald-900/35">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-semibold text-emerald-450">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>↑ 14% vs last period</span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Checkout orders</span>
              <span className="text-xl font-bold text-white">118 Orders</span>
            </div>
            <div className="w-8 h-8 rounded-none bg-indigo-950/20 flex items-center justify-center text-indigo-400 border border-indigo-900/35">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-semibold text-emerald-450">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>↑ 8.2% vs last period</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Conversion Rate</span>
              <span className="text-xl font-bold text-white">3.42 %</span>
            </div>
            <div className="w-8 h-8 rounded-none bg-amber-950/20 flex items-center justify-center text-amber-400 border border-amber-900/35">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-semibold text-rose-455">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>↓ 0.4% vs last period</span>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Avg Order Value</span>
              <span className="text-xl font-bold text-white">{formatPrice(207)}</span>
            </div>
            <div className="w-8 h-8 rounded-none bg-zinc-800/40 flex items-center justify-center text-zinc-400 border border-zinc-700/35">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-semibold text-emerald-450">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>↑ 4.7% vs last period</span>
          </div>
        </div>
      </div>

      {/* CHART ROW: REVENUE TREND LINE CHART */}
      <div className="bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
        <div>
          <h3 className="font-serif text-base font-semibold text-white tracking-wide">Revenue & Checkout Trends</h3>
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mt-0.5">Sales performance index metrics</span>
        </div>

        <div className="relative pt-6 w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full min-w-[550px] h-auto">
            {/* Grid background lines */}
            <line x1="40" y1="10" x2={chartWidth - 20} y2="10" stroke="#1F1F1F" strokeWidth="1" />
            <line x1="40" y1={chartHeight / 2} x2={chartWidth - 20} y2={chartHeight / 2} stroke="#1F1F1F" strokeWidth="1" />
            <line x1="40" y1={chartHeight} x2={chartWidth - 20} y2={chartHeight} stroke="#2E2E2E" strokeWidth="1" />

            {/* Area Fill */}
            <path
              fill="url(#area-gradient)"
              stroke="none"
              d={`M 50,${chartHeight} ` +
                revenueData.map((d, i) => {
                  const x = 50 + (i * (chartWidth - 80)) / (revenueData.length - 1);
                  const y = chartHeight - (d.revenue / maxRevenue) * (chartHeight - 20);
                  return `L ${x},${y}`;
                }).join(" ") +
                ` L ${50 + (revenueData.length - 1) * (chartWidth - 80) / (revenueData.length - 1)},${chartHeight} Z`}
            />

            {/* Line Path */}
            <polyline
              fill="none"
              stroke="url(#line-gradient)"
              strokeWidth="2.5"
              points={revenueData.map((d, i) => {
                const x = 50 + (i * (chartWidth - 80)) / (revenueData.length - 1);
                const y = chartHeight - (d.revenue / maxRevenue) * (chartHeight - 20);
                return `${x},${y}`;
              }).join(" ")}
            />

            {/* Point circles & labels */}
            {revenueData.map((d, i) => {
              const x = 50 + (i * (chartWidth - 80)) / (revenueData.length - 1);
              const y = chartHeight - (d.revenue / maxRevenue) * (chartHeight - 20);
              
              return (
                <g key={d.month} className="group cursor-pointer">
                  <circle cx={x} cy={y} r="4" fill="#C5A880" stroke="#121212" strokeWidth="1.5" />
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="8"
                    fontWeight="bold"
                    className="opacity-90 font-mono"
                  >
                    {formatPrice(d.revenue)}
                  </text>
                  <text
                    x={x}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {d.month}
                  </text>
                </g>
              );
            })}

            {/* Gradients */}
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D45D79" />
                <stop offset="100%" stopColor="#C5A880" />
              </linearGradient>
              <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#D45D79" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#C5A880" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* SPLIT ROW: TOP PRODUCTS & CATEGORY DONUT CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Top selling products list */}
        <div className="lg:col-span-7 bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
          <div>
            <h3 className="font-serif text-base font-semibold text-white tracking-wide">Top Selling Products</h3>
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mt-0.5">Ranked by unit sales</span>
          </div>

          <div className="space-y-4 pt-2 text-xs">
            {topProducts.map((p, idx) => {
              const relativeSalesWidth = (p.sales / topProducts[0].sales) * 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-white">{p.name} <span className="text-[10px] text-zinc-500 font-mono">({p.category})</span></span>
                    <span className="font-bold text-accent">{p.sales} Sales ({formatPrice(p.revenue)})</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-[#0A0A0A] border border-[#1C1C1C]">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-full"
                      style={{ width: `${relativeSalesWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Category donut chart */}
        <div className="lg:col-span-5 bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
          <div>
            <h3 className="font-serif text-base font-semibold text-white tracking-wide">Sales By Category</h3>
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mt-0.5">Category distribution share</span>
          </div>

          <div className="flex items-center justify-between gap-6 py-2">
            {/* SVG Donut */}
            <div className="w-32 h-32 relative flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {categoryData.map((cat) => {
                  const strokeDash = `${cat.percentage} ${100 - cat.percentage}`;
                  const offset = 100 - accumulatedAngle;
                  accumulatedAngle += cat.percentage;
                  
                  return (
                    <circle
                      key={cat.name}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={cat.color}
                      strokeWidth="10"
                      strokeDasharray={strokeDash}
                      strokeDashoffset={offset}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#121212]">
                {/* Center cutout */}
                <div className="w-20 h-20 bg-[#121212] rounded-full flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest block">Total sales</span>
                  <span className="text-xs font-bold text-white font-mono">{formatPrice(24500)}</span>
                </div>
              </div>
            </div>

            {/* Legends list */}
            <div className="space-y-2 text-[11px] flex-1">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-zinc-300">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-white font-mono">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE GRID & CUSTOMER ACQUISITION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Recent Activity Feed */}
        <div className="bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
          <h3 className="font-serif text-base font-semibold text-white tracking-wide">Fulfillment Timeline</h3>
          
          <div className="relative pl-6 space-y-5 border-l border-[#1C1C1C] text-xs pt-1 ml-2">
            {activityTimeline.map((item) => (
              <div key={item.id} className="relative">
                {/* Timeline node */}
                <span className="absolute -left-[29px] top-0.5 w-2 h-2 rounded-full bg-accent border border-[#121212]" />
                
                <div className="space-y-1">
                  <p className="font-light text-zinc-300">{item.action}</p>
                  <span className="text-[10px] text-zinc-500 font-mono flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.time}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Customer acquisition stats */}
        <div className="bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
          <h3 className="font-serif text-base font-semibold text-white tracking-wide flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-accent" />
            <span>Customer Acquisition</span>
          </h3>

          <div className="space-y-4 pt-2 text-xs text-zinc-300">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span>New Customers</span>
                <span className="font-bold text-white">74 % (87 Buyers)</span>
              </div>
              <div className="w-full h-2 bg-[#0A0A0A] border border-[#1C1C1C]">
                <div className="bg-primary h-full w-[74%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span>Returning Customers</span>
                <span className="font-bold text-white">26 % (31 Buyers)</span>
              </div>
              <div className="w-full h-2 bg-[#0A0A0A] border border-[#1C1C1C]">
                <div className="bg-accent h-full w-[26%]" />
              </div>
            </div>

            <div className="pt-2 text-[11px] text-zinc-400 leading-relaxed font-light">
              <p>Acquisition rate increased by 4.5% compared to the previous quarter. Standard returning buyer loyalty indices score premium averages (high repeat saree checkouts).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
