"use client";

import React, { useEffect, useCallback } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderHeart,
  ArrowLeft,
  LogOut,
  Loader2,
  Menu,
  X,
  Tag,
  Users,
  Warehouse,
  FileSpreadsheet,
  Image as ImageIcon,
  Ticket,
  Star,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  Command,
  Truck,
} from "lucide-react";
import { fetchNotifications, markNotificationAsRead } from "@/features/orders/orderActions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadNotifications();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/login?redirect=/admin");
    }
  }, [user, isLoading, isAdmin, router]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        router.push("/admin/products?action=new");
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setMobileOpen(false);
      }
    },
    [router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center font-poppins space-y-4 bg-[#0A0A0A] text-white">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <span className="text-xs uppercase tracking-widest text-zinc-500">Verifying Credentials...</span>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const sidebarSections = [
    {
      label: "Main",
      links: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Products", href: "/admin/products", icon: ShoppingBag },
        { name: "Categories", href: "/admin/categories", icon: Tag },
        { name: "Orders", href: "/admin/orders", icon: FolderHeart },
        { name: "Shipments", href: "/admin/shipments", icon: Truck },
      ],
    },
    {
      label: "Management",
      links: [
        { name: "Customers", href: "/admin/customers", icon: Users },
        { name: "Inventory", href: "/admin/inventory", icon: Warehouse },
        { name: "Import", href: "/admin/import", icon: FileSpreadsheet },
      ],
    },
    {
      label: "Content",
      links: [
        { name: "Banners", href: "/admin/banners", icon: ImageIcon },
        { name: "Coupons", href: "/admin/coupons", icon: Ticket },
        { name: "Reviews", href: "/admin/reviews", icon: Star },
      ],
    },
    {
      label: "Insights",
      links: [
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { name: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const allLinks = sidebarSections.flatMap((s) => s.links);



  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex font-poppins text-xs selection:bg-accent selection:text-foreground">
      {/* SIDEBAR - DESKTOP */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col bg-[#0C0C0C] text-zinc-400 border-r border-[#1A1A1A] flex-shrink-0 overflow-hidden"
      >
        {/* Header */}
        <div className="h-16 border-b border-[#1A1A1A] flex items-center justify-between px-4 flex-shrink-0">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Link href="/admin" className="font-serif text-[11px] font-bold tracking-[0.25em] text-white whitespace-nowrap">
                  SSS CONCIERGE
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-md bg-[#1A1A1A] hover:bg-[#252525] flex items-center justify-center text-zinc-400 hover:text-white transition-colors flex-shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-5 scrollbar-hide">
          {sidebarSections.map((section) => (
            <div key={section.label}>
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-5 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 block mb-2"
                  >
                    {section.label}
                  </motion.span>
                )}
              </AnimatePresence>
              <div className="space-y-0.5 px-2">
                {section.links.map((link) => {
                  const active = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      title={collapsed ? link.name : undefined}
                      className={`group flex items-center rounded-lg transition-all duration-200 relative ${
                        collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5 space-x-3"
                      } ${
                        active
                          ? "bg-accent/10 text-accent"
                          : "hover:bg-[#151515] hover:text-white"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                        active ? "" : "group-hover:scale-110"
                      }`} />
                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.15 }}
                            className="text-[11px] font-medium whitespace-nowrap overflow-hidden"
                          >
                            {link.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-[#1A1A1A] space-y-0.5 flex-shrink-0">
          <Link
            href="/"
            title={collapsed ? "Store Front" : undefined}
            className={`flex items-center rounded-lg hover:bg-[#151515] hover:text-white transition-all duration-200 ${
              collapsed ? "justify-center py-3" : "px-3 py-2.5 space-x-3"
            }`}
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-[11px] font-medium">Store Front</span>}
          </Link>
          <button
            onClick={() => logout()}
            title={collapsed ? "Logout" : undefined}
            className={`w-full flex items-center text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-all duration-200 rounded-lg ${
              collapsed ? "justify-center py-3" : "px-3 py-2.5 space-x-3"
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-[11px] font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A]">
        {/* TOP HEADER BAR */}
        <header className="h-16 bg-[#0C0C0C] border-b border-[#1A1A1A] flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30">
          {/* Left side */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] flex items-center justify-center text-zinc-400 hover:text-white transition"
              aria-label="Toggle Menu"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center space-x-3 bg-[#141414] border border-[#1F1F1F] rounded-lg px-3.5 py-2 hover:border-zinc-700 transition-colors w-64"
            >
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[11px] text-zinc-500 flex-1 text-left">Search anything...</span>
              <kbd className="hidden lg:flex items-center space-x-0.5 text-[9px] text-zinc-600 bg-[#1A1A1A] border border-[#252525] px-1.5 py-0.5 rounded">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </kbd>
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  loadNotifications();
                }}
                className="relative w-9 h-9 rounded-lg bg-[#141414] border border-[#1F1F1F] hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
                )}
              </button>

              {/* Notifications dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-[#141414] border border-[#1F1F1F] rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-[#1F1F1F] flex justify-between items-center">
                        <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Notifications</h3>
                        <span className="text-[9px] text-zinc-500 font-mono">
                          {notifications.filter((n) => !n.read).length} unread
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-zinc-500 font-light">
                            No notifications at this time.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={async () => {
                                await markNotificationAsRead(n.id);
                                loadNotifications();
                              }}
                              className={`px-4 py-3 hover:bg-[#1A1A1A] transition-colors border-b border-[#1A1A1A] last:border-b-0 cursor-pointer ${
                                !n.read ? "bg-accent/5 border-l-2 border-l-accent" : ""
                              }`}
                            >
                              <p className="text-[11px] text-zinc-200 leading-relaxed font-semibold">{n.title}</p>
                              <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">{n.message}</p>
                              <span className="text-[9px] text-zinc-500 mt-1 block">{new Date(n.createdAt).toLocaleString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="px-4 py-2.5 border-t border-[#1F1F1F] text-center">
                        <span onClick={() => { loadNotifications(); }} className="text-[10px] text-accent font-semibold cursor-pointer hover:underline">
                          Refresh List
                        </span>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Admin avatar */}
            <div className="flex items-center space-x-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg px-3 py-1.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white text-[10px] font-bold">
                {user.fullName?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-semibold text-white leading-none">{user.fullName || "Admin"}</p>
                <p className="text-[9px] text-zinc-500 leading-none mt-0.5 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="relative w-72 h-full bg-[#0C0C0C] text-zinc-400 flex flex-col border-r border-[#1A1A1A]"
              >
                {/* Mobile header */}
                <div className="h-16 border-b border-[#1A1A1A] flex items-center justify-between px-5">
                  <span className="font-serif text-[11px] font-bold tracking-[0.25em] text-white">SSS CONCIERGE</span>
                  <button onClick={() => setMobileOpen(false)} className="text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile links */}
                <nav className="flex-1 overflow-y-auto py-4 space-y-5">
                  {sidebarSections.map((section) => (
                    <div key={section.label}>
                      <span className="px-5 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 block mb-2">
                        {section.label}
                      </span>
                      <div className="space-y-0.5 px-2">
                        {section.links.map((link) => {
                          const Icon = link.icon;
                          const active = pathname === link.href;
                          return (
                            <Link
                              key={link.name}
                              href={link.href}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${
                                active ? "bg-accent/10 text-accent" : "hover:bg-[#151515] hover:text-white"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-[11px] font-medium">{link.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>

                {/* Mobile footer */}
                <div className="p-2 border-t border-[#1A1A1A] space-y-0.5">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-[#151515] hover:text-white transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-[11px] font-medium">Store Front</span>
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-[11px] font-medium">Logout</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* COMMAND PALETTE / SEARCH OVERLAY */}
        <AnimatePresence>
          {searchOpen && (
            <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setSearchOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-lg bg-[#141414] border border-[#1F1F1F] rounded-xl shadow-2xl overflow-hidden z-[61]"
              >
                <div className="flex items-center px-4 border-b border-[#1F1F1F]">
                  <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search products, orders, settings..."
                    className="flex-1 bg-transparent border-none outline-none px-3 py-4 text-sm text-white placeholder:text-zinc-500"
                  />
                  <kbd className="text-[9px] text-zinc-600 bg-[#1A1A1A] border border-[#252525] px-1.5 py-0.5 rounded">ESC</kbd>
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider px-2 mb-2">Quick Navigation</p>
                  {allLinks.slice(0, 6).map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-[#1A1A1A] text-zinc-400 hover:text-white transition"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px] font-medium">{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-5 md:p-8 overflow-y-auto bg-[#0A0A0A]">
          <div className="max-w-[1400px] w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
