"use server";

import { revalidatePath } from "next/cache";
import { dbService } from "@/services/dbService";
import { NotificationService } from "@/services/notificationService";
import { Order, GstLog } from "@/types";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

import { cookies } from "next/headers";

async function ensureAuth(token?: string) {
  if (!isSupabaseConfigured() || !supabase) return;
  
  let activeToken = token;
  let refreshToken: string | undefined = undefined;
  
  try {
    const cookieStore = await cookies();
    if (!activeToken) {
      activeToken = cookieStore.get("sss_boutique_access_token")?.value;
    }
    refreshToken = cookieStore.get("sss_boutique_refresh_token")?.value;
  } catch (e) {
    console.error("Failed to read server-side session cookies:", e);
  }

  console.log("[orderActions] ensureAuth activeToken present:", !!activeToken, "refreshToken present:", !!refreshToken);

  if (activeToken) {
    // 1. Manually inject Bearer token into Postgrest headers for immediate database RLS bypass
    if ((supabase as any).rest) {
      try {
        (supabase as any).rest.headers.set("Authorization", `Bearer ${activeToken}`);
        console.log("[orderActions] Injected Authorization header successfully");
      } catch (e) {
        console.error("Failed to inject Bearer token header:", e);
      }
    }
    
    // 2. Set session on GoTrue client using access & refresh tokens
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: activeToken,
        refresh_token: refreshToken || activeToken
      });
      console.log("[orderActions] setSession result - user:", data?.user?.email, "error:", error?.message);
    } catch (e) {
      console.error("Failed to set session on Supabase auth client:", e);
    }
  } else {
    console.warn("[orderActions] ensureAuth called but no activeToken was found!");
  }
}

export async function placeOrder(
  orderData: Omit<Order, "id" | "createdAt" | "orderNumber" | "paymentStatus" | "orderStatus">
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    await ensureAuth();
    const order = await dbService.createOrder(orderData);
    
    try {
      await NotificationService.sendOrderConfirmation(order);
    } catch (e) {
      console.error("Failed to send order confirmation email:", e);
    }
    
    revalidatePath("/admin/orders");
    return { success: true, order };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to place order.";
    return { success: false, error: message };
  }
}

export async function fetchOrders(token?: string): Promise<Order[]> {
  try {
    await ensureAuth(token);
    return await dbService.getOrders();
  } catch (err) {
    console.error("Failed to fetch orders", err);
    return [];
  }
}

export async function changeOrderStatus(
  id: string,
  status: string,
  trackingNumber?: string,
  executor: string = "admin",
  token?: string,
  courierName?: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    await ensureAuth(token);
    const order = await dbService.updateOrderStatus(id, status, trackingNumber, executor, courierName);
    
    try {
      await NotificationService.sendOrderStatusUpdate(order, status);
    } catch (e) {
      console.error("Failed to send order status update email:", e);
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin/shipments");
    revalidatePath("/orders");
    return { success: true, order };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update order status.";
    return { success: false, error: message };
  }
}

// --- NOTIFICATIONS ---
export async function fetchNotifications() {
  try {
    await ensureAuth();
    return await dbService.getNotifications();
  } catch (err) {
    console.error("Failed to fetch notifications", err);
    return [];
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await ensureAuth();
    const success = await dbService.markNotificationAsRead(id);
    revalidatePath("/admin");
    return { success };
  } catch (err) {
    console.error("Failed to mark notification as read", err);
    return { success: false };
  }
}

export async function getUnreadNotificationsCount() {
  try {
    await ensureAuth();
    return await dbService.getUnreadNotificationsCount();
  } catch (err) {
    console.error("Failed to get unread notifications count", err);
    return 0;
  }
}

// --- USER PROFILE & ADDRESSES ---
export async function fetchCustomers(): Promise<any[]> {
  try {
    await ensureAuth();
    return await dbService.getProfiles();
  } catch (err) {
    console.error("Failed to fetch customers", err);
    return [];
  }
}

export async function updateProfile(userId: string, fullName: string, phone: string, avatarUrl?: string) {
  try {
    await ensureAuth();
    const profile = await dbService.updateProfile(userId, fullName, phone, avatarUrl);
    revalidatePath("/orders");
    return { success: true, profile };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update profile.";
    return { success: false, error: message };
  }
}

export async function fetchAddresses(userId: string) {
  try {
    await ensureAuth();
    return await dbService.getAddresses(userId);
  } catch (err) {
    console.error("Failed to fetch addresses", err);
    return [];
  }
}

export async function createAddress(address: any) {
  try {
    await ensureAuth();
    const newAddr = await dbService.createAddress(address);
    revalidatePath("/orders");
    return { success: true, address: newAddr };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create address.";
    return { success: false, error: message };
  }
}

export async function updateAddress(id: string, address: any) {
  try {
    await ensureAuth();
    const updatedAddr = await dbService.updateAddress(id, address);
    revalidatePath("/orders");
    return { success: true, address: updatedAddr };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update address.";
    return { success: false, error: message };
  }
}

export async function deleteAddress(id: string, userId: string) {
  try {
    await ensureAuth();
    const success = await dbService.deleteAddress(id, userId);
    revalidatePath("/orders");
    return { success };
  } catch (err) {
    console.error("Failed to delete address", err);
    return { success: false };
  }
}

export async function setDefaultAddress(id: string, userId: string) {
  try {
    await ensureAuth();
    const success = await dbService.setDefaultAddress(id, userId);
    revalidatePath("/orders");
    return { success };
  } catch (err) {
    console.error("Failed to set default address", err);
    return { success: false };
  }
}

// --- EXPORT DATA ---
export async function getExportCsv(type: "orders" | "customers" | "products") {
  try {
    await ensureAuth();
    return await dbService.getExportData(type);
  } catch (err) {
    console.error("Failed to export data", err);
    return "";
  }
}

export async function fetchGstLogs(): Promise<GstLog[]> {
  try {
    await ensureAuth();
    return await dbService.getGstLogs();
  } catch (err) {
    console.error("Failed to fetch GST logs", err);
    return [];
  }
}
