"use server";

import { revalidatePath } from "next/cache";
import { dbService } from "@/services/dbService";
import { NotificationService } from "@/services/notificationService";
import { Order, GstLog } from "@/types";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

async function ensureAuth(token?: string) {
  if (!isSupabaseConfigured() || !supabase) return;
  let activeToken = token;
  if (!activeToken) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      activeToken = session?.access_token;
    } catch (e) {
      console.error("Failed to read server-side session cookies:", e);
    }
  }
  if (activeToken) {
    try {
      await supabase.auth.setSession({
        access_token: activeToken,
        refresh_token: ""
      });
    } catch (e) {
      console.error("Failed to apply token to database client:", e);
    }
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
