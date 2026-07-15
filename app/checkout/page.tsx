"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/features/cart/CartContext";
import { useAuth } from "@/features/auth/AuthContext";
import { placeOrder } from "@/features/orders/orderActions";
import { formatPrice } from "@/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ShoppingBag, ChevronRight, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { Input, Select, Button, PriceTag, EmptyState } from "@/components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\+?[0-9\s\-]{10,15}$/, "Please enter a valid phone number"),
  addressLine1: z.string().min(5, "Street address must be at least 5 characters"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postalCode: z.string().min(6, "PIN Code must be 6 digits").max(6, "PIN Code must be 6 digits").regex(/^[0-9]{6}$/, "PIN Code must be exactly 6 digits"),
  country: z.string().min(1, "Country is required"),
  orderNotes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, isLoading, router]);

  // Success state
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      orderNotes: "",
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setError("");
    setLoading(true);

    try {
      const orderPayload = {
        userId: user?.id || undefined,
        customerName: data.fullName,
        customerEmail: data.email,
        subtotal: cartTotal,
        discount: 0,
        shipping: 0,
        tax: 0,
        grandTotal: cartTotal,
        shippingAddress: {
          fullName: data.fullName,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || undefined,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          phone: data.phone,
        },
        items: cart.map((item) => ({
          productId: item.product?.id || "",
          productName: item.product?.name || "",
          productImage: item.product?.images?.[0]?.imageUrl || "",
          quantity: item.quantity,
          price: item.product?.price || 0,
          variantSize: item.size,
        })),
        trackingNumber: `SSS-DELHIVERY-${Math.floor(100000 + Math.random() * 900000)}`,
        orderNotes: data.orderNotes || undefined,
      };

      const res = await placeOrder(orderPayload);
      if (res.success && res.order) {
        setPlacedOrder(res.order);
        clearCart(); // Clear local shopping cart
      } else {
        console.error("[Checkout Failure]:", res.error);
        setError(res.error || "Failed to place your order. Please try again.");
      }
    } catch (err: any) {
      console.error("[Checkout Exception]:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // If order was successfully placed, show success UI
  if (placedOrder) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-6 py-20 text-center font-poppins space-y-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Transaction Confirmed</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-wide text-foreground">
              Thank You For Your Order
            </h1>
            <div className="w-12 h-[1px] bg-accent mx-auto mt-2" />
          </div>

          <div className="bg-secondary border border-accent/20 p-6 sm:p-8 text-left space-y-6 text-xs max-w-xl mx-auto">
            <div className="flex justify-between border-b border-zinc-100 pb-3">
              <span className="text-zinc-400">Order ID:</span>
              <span className="font-semibold">{placedOrder.id}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-3">
              <span className="text-zinc-400">Estimated Delivery:</span>
              <span className="font-semibold">3-5 Business Days</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-3">
              <span className="text-zinc-400">Tracking Number (Delhivery):</span>
              <span className="font-semibold text-accent">{placedOrder.trackingNumber}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-3">
              <span className="text-zinc-400">Total Charged:</span>
              <span className="font-semibold text-sm">{formatPrice(placedOrder.grandTotal)}</span>
            </div>

            <div>
              <h3 className="font-bold text-accent uppercase tracking-widest mb-2">Shipping Address</h3>
              <p className="text-zinc-600 leading-relaxed font-light">
                {placedOrder.shippingAddress.fullName} <br />
                {placedOrder.shippingAddress.addressLine1} {placedOrder.shippingAddress.addressLine2 && `, ${placedOrder.shippingAddress.addressLine2}`} <br />
                {placedOrder.shippingAddress.city}, {placedOrder.shippingAddress.state} {placedOrder.shippingAddress.postalCode} <br />
                {placedOrder.shippingAddress.country}
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-foreground text-background uppercase tracking-widest text-xs font-semibold hover:bg-primary transition duration-300 w-full sm:w-auto text-center"
            >
              Continue Shopping
            </Link>
            <Link
              href="/orders"
              className="px-8 py-3.5 border border-foreground/30 uppercase tracking-widest text-xs font-semibold hover:bg-foreground hover:text-white transition duration-300 w-full sm:w-auto text-center"
            >
              View Order History
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="flex-1 min-h-[70vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-1.5 text-[10px] text-zinc-400 font-poppins uppercase tracking-widest mb-8">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-primary transition">Shop</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-600 font-medium">Checkout</span>
          </nav>

          {cart.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="w-8 h-8 text-zinc-300" />}
              title="Your Bag is Empty"
              description="You have no pieces in your shopping bag. Head over to our catalog to select your designer silhouettes."
              actionLabel="Go Shop"
              actionHref="/shop"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 font-poppins">
              {/* Form (Left 7 Cols) */}
              <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-7 space-y-8 text-xs">
                {error && (
                  <div className="bg-error/10 text-error p-3 border border-error/20 font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <h2 className="font-serif text-xl font-medium tracking-wide border-b border-zinc-100 pb-3">
                    Shipping Details
                  </h2>

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      error={errors.fullName?.message}
                      required
                      {...register("fullName")}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      error={errors.email?.message}
                      required
                      {...register("email")}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="+91 98765 43210"
                        error={errors.phone?.message}
                        required
                        {...register("phone")}
                      />
                    </div>
                  </div>

                  {/* Address info */}
                  <Input
                    label="Street Address"
                    placeholder="Street name and house number"
                    error={errors.addressLine1?.message}
                    required
                    {...register("addressLine1")}
                  />

                  <Input
                    label="Apartment, suite, etc. (Optional)"
                    placeholder="Apartment, suite, unit, etc."
                    error={errors.addressLine2?.message}
                    {...register("addressLine2")}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      error={errors.city?.message}
                      required
                      {...register("city")}
                    />
                    <Input
                      label="State"
                      error={errors.state?.message}
                      required
                      {...register("state")}
                    />
                    <Input
                      label="PIN Code"
                      error={errors.postalCode?.message}
                      required
                      {...register("postalCode")}
                    />
                  </div>

                  <Select
                    label="Country"
                    required
                    options={[
                      { value: "India", label: "India" },
                      { value: "United States", label: "United States" },
                      { value: "Canada", label: "Canada" },
                      { value: "United Kingdom", label: "United Kingdom" },
                      { value: "Sri Lanka", label: "Sri Lanka" },
                      { value: "Nepal", label: "Nepal" }
                    ]}
                    {...register("country")}
                  />

                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Order Notes (Optional)</label>
                    <textarea
                      placeholder="Special instructions for delivery, boutique preferences..."
                      {...register("orderNotes")}
                      className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2.5 focus:outline-none focus:border-accent text-white min-h-[85px]"
                    />
                  </div>
                </div>

                {/* Mock Payment Details */}
                <div className="space-y-6 pt-4">
                  <h2 className="font-serif text-xl font-medium tracking-wide border-b border-zinc-100 pb-3">
                    Payment Method
                  </h2>

                  <div className="bg-zinc-50 border border-zinc-100 p-5 space-y-4">
                    <div className="flex items-center space-x-3 text-zinc-700 font-semibold text-xs border-b border-zinc-100 pb-3">
                      <CreditCard className="w-4 h-4 text-accent" />
                      <span>Complimentary Luxury Private Card Checkout</span>
                    </div>
                    
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
                      This boutique currently operates in demo mode. Payment authorization is auto-approved instantly. Phase 2 Razorpay integrations will deploy in future versions.
                    </p>
                    
                    <div className="flex items-center space-x-1.5 text-[10px] text-emerald-700 font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>AES-256 SSL Secure Connection Verified</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  size="lg"
                >
                  {loading ? "Authorizing Security Check..." : `Authorize Payment of ${formatPrice(cartTotal)}`}
                </Button>
              </form>

              {/* Summary Panel (Right 5 Cols) */}
              <aside className="lg:col-span-5 bg-zinc-50 border border-zinc-200/40 p-6 sm:p-8 space-y-6 h-fit">
                <h3 className="font-serif text-lg font-medium tracking-wide border-b border-zinc-100 pb-3">
                  Summary
                </h3>

                {/* Items list */}
                <div className="divide-y divide-zinc-100 max-h-[300px] overflow-y-auto pr-2">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex space-x-3 py-3.5 first:pt-0 last:pb-0">
                      <div className="w-12 h-16 bg-zinc-100 overflow-hidden border border-zinc-200/50 flex-shrink-0">
                        <img src={item.product?.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"} alt="" className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 space-y-0.5 text-xs">
                        <h4 className="font-serif font-medium truncate max-w-[180px]">{item.product?.name}</h4>
                        {(item.selectedSize || item.selectedColor) && (
                          <p className="text-[10px] text-zinc-400 font-poppins">
                            {item.selectedSize && `Size: ${item.selectedSize}`} {item.selectedSize && item.selectedColor && "|"} {item.selectedColor && `Color: ${item.selectedColor}`}
                          </p>
                        )}
                        <p className="text-zinc-500 font-light font-poppins">Qty: {item.quantity}</p>
                      </div>
                      <PriceTag
                        price={(item.product?.price || 0) * item.quantity}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>

                {/* Subtotals */}
                <div className="border-t border-zinc-100 pt-4 space-y-2 text-xs font-poppins">
                  <div className="flex justify-between items-center text-zinc-500 font-light">
                    <span>Subtotal</span>
                    <PriceTag price={cartTotal} size="sm" />
                  </div>
                  <div className="flex justify-between items-center text-zinc-500 font-light">
                    <span>Shipping</span>
                    <span className="text-accent uppercase font-semibold">Free Express</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500 font-light">
                    <span>Tax</span>
                    <PriceTag price={0} size="sm" />
                  </div>
                  <div className="flex justify-between items-center text-foreground text-sm font-bold pt-3 border-t border-zinc-100">
                    <span>Total</span>
                    <PriceTag price={cartTotal} size="md" />
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
