"use client";

import React, { useEffect, useState } from "react";
import { fetchOrders } from "@/features/orders/orderActions";
import { fetchProducts, fetchCategories } from "@/features/products/productActions";
import { Order, Product, Category } from "@/types";
import { formatPrice } from "@/utils";
import { motion } from "framer-motion";
import { 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  Percent, 
  Heart, 
  ArrowUpRight, 
  Clock, 
  UserCheck,
  RefreshCw 
} from "lucide-react";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "90d" | "all">("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [allOrders, allProducts, allCategories] = await Promise.all([
        fetchOrders(),
        fetchProducts(true),
        fetchCategories()
      ]);
      setOrders(allOrders);
      setProducts(allProducts);
      setCategories(allCategories);
    } catch (err) {
      console.error("Failed to load analytics data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter orders by time range
  const filteredOrders = orders.filter((order) => {
    if (timeRange === "all") return true;
    
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (timeRange === "today") {
      return orderDate.toDateString() === now.toDateString();
    } else if (timeRange === "7d") {
      return diffDays <= 7;
    } else if (timeRange === "30d") {
      return diffDays <= 30;
    } else if (timeRange === "90d") {
      return diffDays <= 90;
    }
    return true;
  });

  // 1. Calculated KPI Metrics
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalOrders = filteredOrders.length;
  
  // Unique buyers
  const uniqueBuyers = new Set(filteredOrders.map(o => o.customerEmail)).size;
  
  // Avg Order Value
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Realistic conversion calculation based on unique buyers / registered pool
  const conversionRate = uniqueBuyers > 0 ? (totalOrders / uniqueBuyers) * 100 : 0;

  // 2. Revenue chart data (Grouped by month or day based on timeRange)
  // For simplicity and premium look, group last 6 months dynamically from actual orders
  const getMonthlyRevenueData = () => {
    const monthlyMap: Record<string, { month: string; revenue: number; orders: number }> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize past 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = monthNames[d.getMonth()];
      monthlyMap[mLabel] = { month: mLabel, revenue: 0, orders: 0 };
    }

    // Populate from actual orders
    orders.forEach((o) => {
      const oDate = new Date(o.createdAt);
      const mLabel = monthNames[oDate.getMonth()];
      if (monthlyMap[mLabel]) {
        monthlyMap[mLabel].revenue += o.grandTotal;
        monthlyMap[mLabel].orders += 1;
      }
    });

    return Object.values(monthlyMap);
  };

  const revenueData = getMonthlyRevenueData();
  const maxRevenue = Math.max(...revenueData.map((r) => r.revenue), 1000);
  const chartHeight = 160;
  const chartWidth = 600;

  // 3. Category Sales Distribution from database
  const getCategoryData = () => {
    const categoryCounts: Record<string, { count: number; totalSales: number }> = {};
    
    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        // Find product category
        const p = products.find(prod => prod.id === item.productId);
        const cat = categories.find(c => c.id === p?.categoryId);
        const catName = cat?.name || "Uncategorized";
        if (!categoryCounts[catName]) {
          categoryCounts[catName] = { count: 0, totalSales: 0 };
        }
        categoryCounts[catName].count += item.quantity;
        categoryCounts[catName].totalSales += item.price * item.quantity;
      });
    });

    const totalItems = Object.values(categoryCounts).reduce((sum, c) => sum + c.count, 0);
    const colors = ["#D45D79", "#C5A880", "#6A89CC", "#82CCDD", "#4A69BD", "#2ECC71", "#9B59B6"];

    return Object.entries(categoryCounts).map(([name, val], idx) => {
      const percentage = totalItems > 0 ? Math.round((val.count / totalItems) * 100) : 0;
      return {
        name,
        percentage,
        color: colors[idx % colors.length],
        raw: val.totalSales
      };
    }).sort((a, b) => b.percentage - a.percentage);
  };

  const categoryData = getCategoryData();
  let accumulatedAngle = 0;

  // 4. Top Selling Products from database
  const getTopProducts = () => {
    const productSalesMap: Record<string, { name: string; sales: number; revenue: number; category: string }> = {};

    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productSalesMap[item.productId]) {
          const p = products.find(prod => prod.id === item.productId);
          const cat = categories.find(c => c.id === p?.categoryId);
          productSalesMap[item.productId] = {
            name: item.productName || "Unknown Silhouette",
            sales: 0,
            revenue: 0,
            category: cat?.name || "Design"
          };
        }
        productSalesMap[item.productId].sales += item.quantity;
        productSalesMap[item.productId].revenue += item.price * item.quantity;
      });
    });

    return Object.values(productSalesMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  };

  const topProducts = getTopProducts();

  // 5. Activity/Fulfillment timeline from actual orders
  const getActivityTimeline = () => {
    return filteredOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((o) => {
        const orderTime = new Date(o.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        });
        return {
          id: o.id,
          action: `Order ${o.orderNumber || "N/A"} placed by ${o.customerName} - payment status: ${o.paymentStatus}`,
          time: orderTime
        };
      });
  };

  const activityTimeline = getActivityTimeline();

  return (
    <div className="space-y-8 font-poppins text-zinc-100 bg-[#0A0A0A] min-h-screen pb-16">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
        <div className="space-y-1">
          <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Business Intelligence</span>
          <h1 className="font-serif text-3xl font-light tracking-wide text-white">Analytics Overview</h1>
          <div className="w-12 h-[1px] bg-accent mt-3" />
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-[#121212] border border-[#1C1C1C] text-zinc-400 hover:text-white transition disabled:opacity-50"
            aria-label="Reload analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* TIME RANGE SELECTOR */}
          <div className="flex bg-[#121212] border border-[#1C1C1C] p-1 font-bold text-[9px] uppercase tracking-wider text-zinc-500">
            {([
              { key: "today", label: "Today" },
              { key: "7d", label: "7 Days" },
              { key: "30d", label: "30 Days" },
              { key: "90d", label: "90 Days" },
              { key: "all", label: "All Time" }
            ] as const).map((r) => (
              <button
                key={r.key}
                onClick={() => setTimeRange(r.key)}
                className={`px-3 py-1.5 transition ${timeRange === r.key ? "bg-accent text-foreground font-black" : "hover:text-zinc-200"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-500">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-accent" />
            <span>Calculating dynamic business intelligence stats...</span>
          </div>
        </div>
      ) : (
        <>
          {/* STATS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Revenue */}
            <div className="bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Accumulated Sales</span>
                  <span className="text-xl font-bold text-white">{formatPrice(totalRevenue)}</span>
                </div>
                <div className="w-8 h-8 rounded-none bg-emerald-950/20 flex items-center justify-center text-emerald-400 border border-emerald-900/35">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[9px] text-zinc-500 font-light">
                Gross sales amount during selected period
              </div>
            </div>

            {/* Orders */}
            <div className="bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Checkout orders</span>
                  <span className="text-xl font-bold text-white">{totalOrders} Orders</span>
                </div>
                <div className="w-8 h-8 rounded-none bg-indigo-950/20 flex items-center justify-center text-indigo-400 border border-indigo-900/35">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[9px] text-zinc-500 font-light">
                Total checkout order quantity
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Conversion Rate</span>
                  <span className="text-xl font-bold text-white">{conversionRate.toFixed(1)} %</span>
                </div>
                <div className="w-8 h-8 rounded-none bg-amber-950/20 flex items-center justify-center text-amber-400 border border-amber-900/35">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[9px] text-zinc-500 font-light">
                Invoices volume relative to active buyers
              </div>
            </div>

            {/* Avg Order Value */}
            <div className="bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Avg Order Value</span>
                  <span className="text-xl font-bold text-white">{formatPrice(avgOrderValue)}</span>
                </div>
                <div className="w-8 h-8 rounded-none bg-zinc-800/40 flex items-center justify-center text-zinc-400 border border-zinc-700/35">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[9px] text-zinc-500 font-light">
                Average transaction spending value
              </div>
            </div>
          </div>

          {/* CHART ROW: REVENUE TREND LINE CHART */}
          <div className="bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
            <div>
              <h3 className="font-serif text-base font-semibold text-white tracking-wide">Revenue & Checkout Trends (Past 6 Months)</h3>
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
                {topProducts.length === 0 ? (
                  <p className="text-zinc-500 py-6 text-center">No catalog sales recorded yet.</p>
                ) : (
                  topProducts.map((p, idx) => {
                    const relativeSalesWidth = topProducts[0]?.sales > 0 ? (p.sales / topProducts[0].sales) * 100 : 0;
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
                  })
                )}
              </div>
            </div>

            {/* Right: Category donut chart */}
            <div className="lg:col-span-5 bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
              <div>
                <h3 className="font-serif text-base font-semibold text-white tracking-wide">Sales By Category</h3>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mt-0.5">Category distribution share</span>
              </div>

              {categoryData.length === 0 ? (
                <p className="text-zinc-500 py-12 text-center">No categories sales recorded yet.</p>
              ) : (
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
                        <span className="text-xs font-bold text-white font-mono">{formatPrice(totalRevenue)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Legends list */}
                  <div className="space-y-2 text-[11px] flex-1">
                    {categoryData.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 flex-shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="text-zinc-300 truncate max-w-[80px]">{cat.name}</span>
                        </div>
                        <span className="font-semibold text-white font-mono">{cat.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TIMELINE GRID & CUSTOMER ACQUISITION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Recent Activity Feed */}
            <div className="bg-[#121212] border border-[#1C1C1C] p-6 shadow-luxury space-y-4">
              <h3 className="font-serif text-base font-semibold text-white tracking-wide">Fulfillment Timeline</h3>
              
              {activityTimeline.length === 0 ? (
                <p className="text-zinc-500 py-6 text-center text-xs">No orders recorded in this range.</p>
              ) : (
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
              )}
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
                    <span>Active Buyers (Selected period)</span>
                    <span className="font-bold text-white">{uniqueBuyers} Buyers</span>
                  </div>
                  <div className="w-full h-2 bg-[#0A0A0A] border border-[#1C1C1C]">
                    <div className="bg-primary h-full w-[100%]" style={{ width: uniqueBuyers > 0 ? "100%" : "0%" }} />
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-zinc-400 leading-relaxed font-light">
                  <p>Customer metrics are calculated dynamically from unique billing emails stored in the order ledger. Real-time conversion records and user trends update as orders are finalized by clients.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
