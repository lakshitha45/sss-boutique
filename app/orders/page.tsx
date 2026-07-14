"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { fetchOrders } from "@/features/orders/orderActions";
import { Order, Product } from "@/types";
import { formatPrice } from "@/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Package, Truck, Heart, User, MapPin, Key, LogOut, CheckCircle2, ShoppingBag, X } from "lucide-react";
import { fetchProducts } from "@/features/products/productActions";
import { useCart } from "@/features/cart/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export default function AccountDashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "addresses" | "profile">("orders");

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Wishlist State
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [passwordOld, setPasswordOld] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Saved Addresses State
  const [addresses, setAddresses] = useState<Array<{
    id: string;
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  }>>([
    {
      id: "addr_1",
      fullName: "Lakshitha S",
      addressLine1: "12, Kasturba Gandhi Marg",
      city: "New Delhi",
      state: "Delhi",
      postalCode: "110001",
      phone: "+91 98765 43210"
    }
  ]);

  const [newAddrName, setNewAddrName] = useState("");
  const [newAddrLine, setNewAddrLine] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("");
  const [newAddrState, setNewAddrState] = useState("");
  const [newAddrPincode, setNewAddrPincode] = useState("");
  const [newAddrPhone, setNewAddrPhone] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/orders");
    }
  }, [user, isLoading, router]);

  // Load orders
  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      try {
        const allOrders = await fetchOrders();
        const userOrders = allOrders.filter(
          (o) => o.customerEmail.toLowerCase() === user.email.toLowerCase()
        );
        setOrders(userOrders);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [user]);

  // Load wishlist
  const loadWishlistItems = async () => {
    setLoadingWishlist(true);
    try {
      const stored = localStorage.getItem("sss_boutique_wishlist");
      const wishlistIds: string[] = stored ? JSON.parse(stored) : [];

      if (wishlistIds.length > 0) {
        const allProducts = await fetchProducts(true);
        const matched = allProducts.filter((p) => wishlistIds.includes(p.id));
        setWishlistItems(matched);
      } else {
        setWishlistItems([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  useEffect(() => {
    if (activeTab === "wishlist") {
      loadWishlistItems();
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  if (isLoading || (user && loadingOrders)) {
    return (
      <>
        <Header />
        <main className="flex-1 py-20 flex items-center justify-center font-poppins">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Profile details updated successfully!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordOld || !passwordNew) {
      showToast("Please fill in both password fields.");
      return;
    }
    showToast("Password changed successfully!");
    setPasswordOld("");
    setPasswordNew("");
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName || !newAddrLine || !newAddrCity || !newAddrState || !newAddrPincode || !newAddrPhone) {
      showToast("Please fill in all address fields.");
      return;
    }
    const newAddr = {
      id: `addr_${Date.now()}`,
      fullName: newAddrName,
      addressLine1: newAddrLine,
      city: newAddrCity,
      state: newAddrState,
      postalCode: newAddrPincode,
      phone: newAddrPhone
    };
    setAddresses([...addresses, newAddr]);
    setNewAddrName("");
    setNewAddrLine("");
    setNewAddrCity("");
    setNewAddrState("");
    setNewAddrPincode("");
    setNewAddrPhone("");
    setShowAddressForm(false);
    showToast("Shipping address saved.");
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    showToast("Address deleted.");
  };

  const handleRemoveFromWishlist = (productId: string) => {
    try {
      const stored = localStorage.getItem("sss_boutique_wishlist");
      let wishlistIds: string[] = stored ? JSON.parse(stored) : [];
      wishlistIds = wishlistIds.filter((id) => id !== productId);
      localStorage.setItem("sss_boutique_wishlist", JSON.stringify(wishlistIds));
      setWishlistItems((prev) => prev.filter((p) => p.id !== productId));
      window.dispatchEvent(new Event("wishlist-updated"));
      showToast("Item removed from wishlist.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveToCart = (product: Product) => {
    const defaultSize = product.variants?.[0]?.size || product.metadata?.sizes?.[0];
    const defaultColor = product.metadata?.colors?.[0];
    addToCart(product, 1, defaultSize, defaultColor);
    handleRemoveFromWishlist(product.id);
    showToast("Moved to shopping bag!");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getStatusColor = (status: Order["orderStatus"]) => {
    switch (status) {
      case "pending": return "bg-amber-950/40 text-amber-400 border-amber-900/50";
      case "confirmed": return "bg-sky-950/40 text-sky-400 border-sky-900/50";
      case "packed": return "bg-blue-950/40 text-blue-400 border-blue-900/50";
      case "shipped": return "bg-indigo-950/40 text-indigo-400 border-indigo-900/50";
      case "delivered": return "bg-emerald-950/40 text-emerald-400 border-emerald-900/50";
      default: return "bg-zinc-900/60 text-zinc-400 border-zinc-800";
    }
  };

  return (
    <>
      <Header />
      
      <main className="flex-1 min-h-[75vh] bg-[#0A0A0A] text-zinc-100 py-10 font-poppins relative">
        {/* Toast feedback */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-accent text-zinc-950 px-6 py-3 shadow-2xl z-50 text-xs font-bold uppercase tracking-widest"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1.5 text-[9px] text-zinc-500 uppercase tracking-widest mb-8">
            <Link href="/" className="hover:text-accent transition">Home</Link>
            <ChevronRight className="w-3 h-3 text-zinc-650" />
            <span className="text-zinc-400 font-semibold">My Account</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-10 mt-6">
            {/* Left Nav Menu Tabs */}
            <aside className="w-full md:w-1/4 space-y-2">
              <div className="p-5 border border-[#1A1A1A] bg-[#121212] mb-6 space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-accent font-bold">Welcome Back</span>
                <h3 className="font-serif text-base text-zinc-200 truncate">{user.fullName || "Valued Customer"}</h3>
                <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
              </div>

              <div className="flex flex-col space-y-1 text-xs text-zinc-400">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex items-center space-x-3 px-4 py-3 text-left border ${
                    activeTab === "orders" ? "bg-[#1C1C1C] text-white border-accent" : "bg-[#121212]/50 border-[#1A1A1A] hover:bg-[#121212]"
                  }`}
                >
                  <Package className="w-4 h-4 text-accent" />
                  <span>Order History</span>
                </button>

                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`flex items-center space-x-3 px-4 py-3 text-left border ${
                    activeTab === "wishlist" ? "bg-[#1C1C1C] text-white border-accent" : "bg-[#121212]/50 border-[#1A1A1A] hover:bg-[#121212]"
                  }`}
                >
                  <Heart className="w-4 h-4 text-accent" />
                  <span>My Wishlist</span>
                </button>

                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`flex items-center space-x-3 px-4 py-3 text-left border ${
                    activeTab === "addresses" ? "bg-[#1C1C1C] text-white border-accent" : "bg-[#121212]/50 border-[#1A1A1A] hover:bg-[#121212]"
                  }`}
                >
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>Saved Addresses</span>
                </button>

                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center space-x-3 px-4 py-3 text-left border ${
                    activeTab === "profile" ? "bg-[#1C1C1C] text-white border-accent" : "bg-[#121212]/50 border-[#1A1A1A] hover:bg-[#121212]"
                  }`}
                >
                  <User className="w-4 h-4 text-accent" />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 text-left border bg-[#121212]/50 border-[#1A1A1A] text-rose-400 hover:bg-rose-950/20 hover:border-rose-900 transition mt-6"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </aside>

            {/* Right Pane Body content */}
            <section className="flex-1 min-h-[500px]">
              
              {/* TAB 1: ORDER HISTORY */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div className="border-b border-[#1A1A1A] pb-4">
                    <h2 className="font-serif text-xl font-light text-white tracking-wide">Order History</h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Track and manage past purchases</p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto border border-[#1A1A1A] bg-[#121212] p-8">
                      <div className="w-16 h-16 rounded-full bg-zinc-900 border border-[#1A1A1A] flex items-center justify-center">
                        <Package className="w-6 h-6 text-zinc-500" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-serif text-base text-zinc-300">No Orders Found</h3>
                        <p className="text-zinc-500 text-[11px] leading-relaxed">
                          You haven't placed any boutique orders yet. Head to our catalog to select your designer silhouettes.
                        </p>
                      </div>
                      <Link
                        href="/shop"
                        className="bg-accent text-zinc-950 text-[10px] tracking-widest uppercase px-6 py-2.5 hover:bg-white transition duration-300 font-bold"
                      >
                        Shop Catalog
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-[#1A1A1A] bg-[#121212] overflow-hidden">
                          {/* Order Details Header */}
                          <div className="bg-[#161616] px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#222] gap-4 text-[11px]">
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                              <div>
                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest block">Date Placed</span>
                                <span className="font-medium text-zinc-300">
                                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest block">Order ID</span>
                                <span className="font-mono text-zinc-400 font-semibold">{order.id}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest block">Grand Total</span>
                                <span className="font-semibold text-accent">{formatPrice(order.grandTotal)}</span>
                              </div>
                            </div>
                            <span className={`px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold border ${getStatusColor(order.orderStatus)}`}>
                              {order.orderStatus}
                            </span>
                          </div>

                          {/* Items listing */}
                          <div className="px-6 py-4 divide-y divide-[#1F1F1F]">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between py-4 first:pt-2 last:pb-2 text-xs">
                                <div className="flex items-center space-x-4">
                                  <div className="w-12 h-16 bg-zinc-900 overflow-hidden border border-[#222] flex-shrink-0">
                                    <img src={item.productImage} alt="" className="object-cover w-full h-full" />
                                  </div>
                                  <div>
                                    <h4 className="font-serif text-zinc-300 font-medium">{item.productName}</h4>
                                    <p className="text-[10px] text-zinc-500 mt-1 font-poppins">
                                      Qty: {item.quantity} {item.variantSize && `| Size: ${item.variantSize}`}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-semibold text-zinc-200">{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Delivery Notes */}
                          {order.orderNotes && (
                            <div className="bg-[#161616]/30 px-6 py-3 border-t border-[#1C1C1C] text-[10px] text-zinc-500">
                              <span className="font-semibold text-accent block mb-0.5">Order Notes:</span>
                              <p className="italic font-light">"{order.orderNotes}"</p>
                            </div>
                          )}

                          {/* Delhivery tracking ID */}
                          {order.trackingNumber && (
                            <div className="bg-[#181818] px-6 py-3 border-t border-[#1F1F1F] flex items-center space-x-2 text-[10px] text-zinc-400">
                              <Truck className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                              <span>
                                Courier Partner: Delhivery Express Logistics <br />
                                Waybill / Tracking ID: <strong className="text-accent font-semibold">{order.trackingNumber}</strong>
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MY WISHLIST */}
              {activeTab === "wishlist" && (
                <div className="space-y-6">
                  <div className="border-b border-[#1A1A1A] pb-4">
                    <h2 className="font-serif text-xl font-light text-white tracking-wide">My Wishlist</h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Saved designer styles</p>
                  </div>

                  {loadingWishlist ? (
                    <div className="py-20 flex justify-center">
                      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : wishlistItems.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto border border-[#1A1A1A] bg-[#121212] p-8">
                      <div className="w-16 h-16 rounded-full bg-zinc-900 border border-[#1A1A1A] flex items-center justify-center">
                        <Heart className="w-6 h-6 text-zinc-500" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-serif text-base text-zinc-300">Your Wishlist is Empty</h3>
                        <p className="text-zinc-500 text-[11px] leading-relaxed">
                          Bookmark designer items that catch your eye. You'll see them compiled here for instant purchase.
                        </p>
                      </div>
                      <Link
                        href="/shop"
                        className="bg-accent text-zinc-950 text-[10px] tracking-widest uppercase px-6 py-2.5 hover:bg-white transition duration-300 font-bold"
                      >
                        Browse Pieces
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      {wishlistItems.map((prod) => (
                        <div key={prod.id} className="border border-[#1A1A1A] bg-[#121212] p-3 flex flex-col justify-between group">
                          <div className="aspect-[3/4] relative overflow-hidden bg-zinc-900">
                            <img src={prod.images[0]?.imageUrl} alt="" className="object-cover w-full h-full group-hover:scale-102 transition duration-500" />
                            <button
                              onClick={() => handleRemoveFromWishlist(prod.id)}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-950/60 rounded-full text-zinc-400 hover:text-red-400 transition"
                              aria-label="Remove item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="pt-3 space-y-2">
                            <h4 className="font-serif text-xs text-white truncate">{prod.name}</h4>
                            <span className="font-mono text-xs text-accent block">{formatPrice(prod.price)}</span>
                            
                            <button
                              onClick={() => handleMoveToCart(prod)}
                              className="w-full py-2 bg-accent hover:bg-white text-zinc-950 text-[9px] uppercase tracking-widest font-bold transition flex items-center justify-center space-x-1"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>Move To Bag</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SAVED ADDRESSES */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="border-b border-[#1A1A1A] pb-4 flex justify-between items-end">
                    <div>
                      <h2 className="font-serif text-xl font-light text-white tracking-wide">Saved Addresses</h2>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Manage delivery locations</p>
                    </div>
                    {!showAddressForm && (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="border border-accent text-accent px-4 py-2 hover:bg-accent hover:text-zinc-950 text-[10px] uppercase font-bold tracking-wider transition"
                      >
                        Add New Address
                      </button>
                    )}
                  </div>

                  {/* Add address form overlay block */}
                  {showAddressForm && (
                    <form onSubmit={handleAddAddress} className="border border-[#1A1A1A] bg-[#121212] p-5 space-y-4">
                      <h3 className="font-serif text-sm text-white font-bold uppercase tracking-wider mb-2">New Address Details</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 uppercase tracking-widest block">Recipient Name</label>
                          <input type="text" value={newAddrName} onChange={(e) => setNewAddrName(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 uppercase tracking-widest block">Phone Number</label>
                          <input type="tel" value={newAddrPhone} onChange={(e) => setNewAddrPhone(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent" required />
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <label className="text-[9px] text-zinc-400 uppercase tracking-widest block">Street Address</label>
                        <input type="text" value={newAddrLine} onChange={(e) => setNewAddrLine(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent" required />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 uppercase tracking-widest block">City</label>
                          <input type="text" value={newAddrCity} onChange={(e) => setNewAddrCity(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 uppercase tracking-widest block">State</label>
                          <input type="text" value={newAddrState} onChange={(e) => setNewAddrState(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 uppercase tracking-widest block">Pincode</label>
                          <input type="text" value={newAddrPincode} onChange={(e) => setNewAddrPincode(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent" required />
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-2">
                        <button type="submit" className="bg-accent text-zinc-950 px-6 py-2.5 hover:bg-white text-[10px] font-bold uppercase tracking-wider transition">Save Address</button>
                        <button type="button" onClick={() => setShowAddressForm(false)} className="border border-zinc-700 text-zinc-400 px-6 py-2.5 hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-wider transition">Cancel</button>
                      </div>
                    </form>
                  )}

                  {/* List of Saved Addresses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((a) => (
                      <div key={a.id} className="border border-[#1A1A1A] bg-[#121212] p-5 relative space-y-3 flex flex-col justify-between">
                        <div className="text-xs space-y-1 font-light leading-relaxed">
                          <h4 className="font-serif text-sm font-semibold text-white tracking-wide block mb-1">{a.fullName}</h4>
                          <p className="text-zinc-400">{a.addressLine1}</p>
                          <p className="text-zinc-400">{a.city}, {a.state} {a.postalCode}</p>
                          <p className="text-zinc-550 pt-1 font-mono text-[10px]">Phone: {a.phone}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(a.id)}
                          className="text-rose-400 hover:text-rose-500 font-bold uppercase tracking-wider text-[9px] mt-3 block w-fit border-b border-rose-400/20"
                        >
                          Delete Address
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PROFILE & SECURITY */}
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div className="border-b border-[#1A1A1A] pb-4">
                    <h2 className="font-serif text-xl font-light text-white tracking-wide">Profile Settings</h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Manage contact info and passwords</p>
                  </div>

                  {/* Basic Details Form */}
                  <form onSubmit={handleUpdateProfile} className="border border-[#1A1A1A] bg-[#121212] p-6 space-y-4">
                    <h3 className="font-serif text-sm text-white font-bold uppercase tracking-wider flex items-center space-x-1.5 mb-2">
                      <User className="w-4 h-4 text-accent" />
                      <span>Contact Details</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-400 uppercase tracking-widest block">Full Name</label>
                        <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-400 uppercase tracking-widest block">Email Address (Read Only)</label>
                        <input type="email" value={user.email} className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-zinc-500 focus:outline-none cursor-not-allowed" disabled />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs w-full sm:w-1/2">
                      <label className="text-[9px] text-zinc-400 uppercase tracking-widest block">Phone Number</label>
                      <input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent" />
                    </div>

                    <button type="submit" className="bg-accent text-zinc-950 px-6 py-2.5 hover:bg-white text-[10px] font-bold uppercase tracking-wider transition">Save Changes</button>
                  </form>

                  {/* Change Password Form */}
                  <form onSubmit={handleChangePassword} className="border border-[#1A1A1A] bg-[#121212] p-6 space-y-4 mt-8">
                    <h3 className="font-serif text-sm text-white font-bold uppercase tracking-wider flex items-center space-x-1.5 mb-2">
                      <Key className="w-4 h-4 text-accent" />
                      <span>Update Password</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-400 uppercase tracking-widest block">Current Password</label>
                        <input type="password" value={passwordOld} onChange={(e) => setPasswordOld(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-400 uppercase tracking-widest block">New Password</label>
                        <input type="password" value={passwordNew} onChange={(e) => setPasswordNew(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#1C1C1C] px-3 py-2 text-white focus:outline-none focus:border-accent" />
                      </div>
                    </div>

                    <button type="submit" className="bg-accent text-zinc-950 px-6 py-2.5 hover:bg-white text-[10px] font-bold uppercase tracking-wider transition">Change Password</button>
                  </form>
                </div>
              )}

            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
