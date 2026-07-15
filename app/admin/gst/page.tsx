"use client";

import React, { useEffect, useState } from "react";
import { fetchGstLogs } from "@/features/orders/orderActions";
import { GstLog } from "@/types";
import { formatPrice } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Receipt, 
  Download, 
  Calendar, 
  Search, 
  TrendingUp, 
  User, 
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function GstDashboardPage() {
  const [logs, setLogs] = useState<GstLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Load logs
  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchGstLogs();
      setLogs(data);
    } catch (e) {
      console.error("Failed to load GST logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Quick filters helper
  const setQuickRange = (range: "this_month" | "last_month" | "past_6_months" | "all_time") => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (range === "this_month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === "last_month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (range === "past_6_months") {
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    } else if (range === "all_time") {
      setStartDate("");
      setEndDate("");
      return;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.createdAt);
    
    // Date ranges
    if (startDate) {
      const sDate = new Date(startDate);
      sDate.setHours(0, 0, 0, 0);
      if (logDate < sDate) return false;
    }
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      if (logDate > eDate) return false;
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchEmail = log.customerEmail?.toLowerCase().includes(query);
      const matchName = log.customerName?.toLowerCase().includes(query);
      const matchOrder = log.orderNumber?.toLowerCase().includes(query);
      return matchEmail || matchName || matchOrder;
    }

    return true;
  });

  // Calculate Metrics
  const totalOrders = filteredLogs.length;
  const totalBase = filteredLogs.reduce((sum, log) => sum + log.baseAmount, 0);
  const totalGst = filteredLogs.reduce((sum, log) => sum + log.gstAmount, 0);
  const totalGross = filteredLogs.reduce((sum, log) => sum + log.grandTotal, 0);

  // CSV Exporter
  const exportToCsv = () => {
    const headers = [
      "Date & Time",
      "Order Number",
      "Customer Name",
      "Customer Email",
      "Base Taxable Amount (INR)",
      "GST Collected (18% INR)",
      "Total Amount Collected (INR)"
    ];

    const rows = filteredLogs.map((log) => [
      new Date(log.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }).replace(/,/g, ""),
      log.orderNumber || "N/A",
      log.customerName,
      log.customerEmail,
      log.baseAmount.toFixed(2),
      log.gstAmount.toFixed(2),
      log.grandTotal.toFixed(2)
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const rangeName = startDate && endDate 
      ? `from_${startDate}_to_${endDate}` 
      : "all_time";
    link.setAttribute("download", `SSS_Boutique_GST_Report_${rangeName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-poppins min-h-screen text-zinc-100 pb-16">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent">Financial Reporting</span>
          <h1 className="font-serif text-3xl font-light text-white tracking-wide mt-1">GST & Tax Log Console</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="p-3 bg-[#121212] border border-[#1F1F1F] text-zinc-400 hover:text-white transition disabled:opacity-50"
            aria-label="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={exportToCsv}
            disabled={filteredLogs.length === 0}
            className="flex items-center space-x-2 bg-accent text-black font-semibold text-xs px-4 py-3 rounded-none tracking-widest uppercase hover:bg-accent-hover transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date Filters & Search Row */}
      <div className="bg-[#121212] border border-[#1A1A1A] p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by customer name, email, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#1F1F1F] pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent font-light"
            />
          </div>

          {/* Start Date */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Calendar className="w-4 h-4" />
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#1F1F1F] pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent font-light"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Calendar className="w-4 h-4" />
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#1F1F1F] pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent font-light"
            />
          </div>
        </div>

        {/* Quick Range Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1C1C1C]">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mr-2">Quick Ranges:</span>
          {["this_month", "last_month", "past_6_months", "all_time"].map((range) => (
            <button
              key={range}
              onClick={() => setQuickRange(range as any)}
              className="text-[10px] font-semibold tracking-wider uppercase border border-[#1F1F1F] bg-[#0A0A0A] text-zinc-400 hover:text-white px-3 py-1.5 hover:border-accent transition"
            >
              {range.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Collected (Gross) */}
        <div className="bg-[#121212] border border-[#1A1A1A] p-6 space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Gross Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-serif text-2xl font-light text-white">{formatPrice(totalGross)}</p>
          <span className="text-[9px] text-zinc-500 font-light block">Calculated taxable gross sum</span>
        </div>

        {/* Total Taxable Base */}
        <div className="bg-[#121212] border border-[#1A1A1A] p-6 space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Taxable Base</span>
            <Receipt className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="font-serif text-2xl font-light text-zinc-300">{formatPrice(totalBase)}</p>
          <span className="text-[9px] text-zinc-500 font-light block">Amount excluding GST</span>
        </div>

        {/* GST Collected */}
        <div className="bg-[#121212] border border-[#1A1A1A] p-6 space-y-2 ring-1 ring-accent/10">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">18% GST Collected</span>
            <Receipt className="w-4 h-4 text-accent animate-pulse" />
          </div>
          <p className="font-serif text-2xl font-light text-accent">{formatPrice(totalGst)}</p>
          <span className="text-[9px] text-zinc-500 font-light block">GST 18% liability sum</span>
        </div>

        {/* Total Orders */}
        <div className="bg-[#121212] border border-[#1A1A1A] p-6 space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Taxable Orders</span>
            <User className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="font-serif text-2xl font-light text-zinc-300">{totalOrders}</p>
          <span className="text-[9px] text-zinc-500 font-light block">Volume of invoices</span>
        </div>
      </div>

      {/* Main GST Invoices Table */}
      <div className="bg-[#121212] border border-[#1A1A1A] overflow-hidden">
        <div className="p-6 border-b border-[#1A1A1A] flex justify-between items-center">
          <h2 className="font-serif text-lg text-white font-light tracking-wide">GST Registry Entries</h2>
          <span className="text-[10px] text-zinc-500 font-bold uppercase">{filteredLogs.length} Records Found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1C1C1C] text-zinc-400 font-bold uppercase text-[9px] tracking-wider bg-[#0A0A0A]">
                <th className="py-4 px-6">Timestamp (IST)</th>
                <th className="py-4 px-6">Order Number</th>
                <th className="py-4 px-6">Customer Profile</th>
                <th className="py-4 px-6 text-right">Taxable Base (₹)</th>
                <th className="py-4 px-6 text-right text-accent">GST Collected (₹)</th>
                <th className="py-4 px-6 text-right">Grand Total (₹)</th>
                <th className="py-4 px-6 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C] font-light">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                      <span>Retrieving GST Registry Logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No GST collection records found in this range.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const logTime = new Date(log.createdAt).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-[#161616] transition cursor-pointer" onClick={() => setExpandedLogId(isExpanded ? null : log.id)}>
                        <td className="py-4 px-6 font-mono text-zinc-400 text-[10px]">{logTime}</td>
                        <td className="py-4 px-6 font-semibold font-mono text-zinc-200">{log.orderNumber || "N/A"}</td>
                        <td className="py-4 px-6 space-y-0.5">
                          <div className="font-semibold text-zinc-300">{log.customerName}</div>
                          <div className="text-[10px] text-zinc-500">{log.customerEmail}</div>
                        </td>
                        <td className="py-4 px-6 text-right font-mono">{formatPrice(log.baseAmount)}</td>
                        <td className="py-4 px-6 text-right font-mono font-semibold text-accent">{formatPrice(log.gstAmount)}</td>
                        <td className="py-4 px-6 text-right font-mono font-semibold">{formatPrice(log.grandTotal)}</td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedLogId(isExpanded ? null : log.id);
                            }}
                            className="text-zinc-500 hover:text-accent focus:outline-none"
                            aria-label="Toggle Details"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="bg-[#0D0D0D] p-0 border-t border-[#1C1C1C]">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 space-y-4 text-xs">
                                  <div className="flex justify-between items-center border-b border-[#1C1C1C] pb-2">
                                    <span className="font-bold text-accent uppercase tracking-widest text-[9px]">Invoice Breakdown details</span>
                                    <span className="text-[10px] font-mono text-zinc-500">Log ID: {log.id}</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-zinc-400">
                                    <div>
                                      <span className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Payer Info</span>
                                      <p className="mt-1 font-semibold text-zinc-300">{log.customerName}</p>
                                      <p>{log.customerEmail}</p>
                                    </div>
                                    <div>
                                      <span className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Collected At</span>
                                      <p className="mt-1 font-semibold text-zinc-300">{logTime} (IST)</p>
                                    </div>
                                    <div className="bg-[#121212] border border-[#1C1C1C] p-4 space-y-1.5 text-right font-mono">
                                      <div className="flex justify-between text-[10px]">
                                        <span>Base Taxable:</span>
                                        <span>{formatPrice(log.baseAmount)}</span>
                                      </div>
                                      <div className="flex justify-between text-[10px] text-accent">
                                        <span>18% GST collected:</span>
                                        <span>{formatPrice(log.gstAmount)}</span>
                                      </div>
                                      <div className="flex justify-between text-xs font-bold text-white pt-1.5 border-t border-[#1C1C1C]">
                                        <span>Grand Total:</span>
                                        <span>{formatPrice(log.grandTotal)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
