"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { fetchOrders } from "@/features/orders/orderActions";
import { Order } from "@/types";
import { formatPrice } from "@/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Package, Truck } from "lucide-react";

export default function OrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/orders");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      try {
        const allOrders = await fetchOrders();
        // Filter orders by email
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

  const getStatusColor = (status: Order["orderStatus"]) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200/50";
      case "confirmed":
        return "bg-sky-50 text-sky-700 border-sky-200/50";
      case "packed":
        return "bg-blue-50 text-blue-700 border-blue-200/50";
      case "shipped":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/50";
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200/50";
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-200/50";
    }
  };

  return (
    <>
      <Header />
      
      <main className="flex-1 min-h-[70vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 font-poppins">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1.5 text-[10px] text-zinc-400 uppercase tracking-widest mb-8">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-600 font-medium">Order History</span>
          </nav>

          <div className="space-y-2 mb-10">
            <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Customer Account</span>
            <h1 className="font-serif text-3xl font-light tracking-wide text-foreground">Your Order History</h1>
            <div className="w-12 h-[1px] bg-accent mt-3" />
          </div>

          {orders.length === 0 ? (
            /* Empty State */
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto border border-zinc-100 bg-secondary p-8">
              <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-zinc-300" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-lg font-medium tracking-wide">No Orders Found</h3>
                <p className="text-zinc-500 text-xs leading-relaxed font-light">
                  You haven't placed any orders with this account yet. Visit our shop to select your first designer pieces.
                </p>
              </div>
              <Link
                href="/shop"
                className="bg-foreground text-background text-xs tracking-widest uppercase px-6 py-2.5 hover:bg-primary transition duration-300 font-semibold"
              >
                Go Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-zinc-200/60 bg-secondary overflow-hidden">
                  
                  {/* Order Header Info */}
                  <div className="bg-zinc-50 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center border-b border-zinc-200/50 gap-4 text-xs">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-widest block">Date Placed</span>
                        <span className="font-medium text-zinc-700">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-widest block">Order ID</span>
                        <span className="font-mono text-zinc-700 font-semibold">{order.id}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-widest block">Total Amount</span>
                        <span className="font-semibold text-zinc-800">{formatPrice(order.grandTotal)}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold border rounded-none self-start sm:self-center ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-4 divide-y divide-zinc-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-4 first:pt-2 last:pb-2 text-xs">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-16 bg-zinc-100 overflow-hidden border border-zinc-200/50 flex-shrink-0">
                            <img src={item.productImage} alt="" className="object-cover w-full h-full" />
                          </div>
                          <div>
                            <h4 className="font-serif text-sm font-medium">{item.productName}</h4>
                            <p className="text-zinc-500 font-light mt-0.5 font-poppins">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer - Tracking info */}
                  {order.trackingNumber && (
                    <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-100 flex items-center space-x-2 text-[11px] text-zinc-500 font-poppins">
                      <Truck className="w-4 h-4 text-accent" />
                      <span>
                        Shipped via UPS: <strong className="text-accent font-semibold">{order.trackingNumber}</strong>
                      </span>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
