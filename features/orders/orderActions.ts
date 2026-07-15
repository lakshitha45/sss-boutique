"use server";

import { revalidatePath } from "next/cache";
import { dbService } from "@/services/dbService";
import { NotificationService } from "@/services/notificationService";
import { Order, GstLog } from "@/types";

export async function placeOrder(
  orderData: Omit<Order, "id" | "createdAt" | "orderNumber" | "paymentStatus" | "orderStatus">
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
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

export async function fetchOrders(): Promise<Order[]> {
  try {
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
  executor: string = "admin"
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const order = await dbService.updateOrderStatus(id, status, trackingNumber, executor);
    
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
    return await dbService.getNotifications();
  } catch (err) {
    console.error("Failed to fetch notifications", err);
    return [];
  }
}

export async function markNotificationAsRead(id: string) {
  try {
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
    return await dbService.getUnreadNotificationsCount();
  } catch (err) {
    console.error("Failed to get unread notifications count", err);
    return 0;
  }
}

// --- USER PROFILE & ADDRESSES ---
export async function fetchCustomers(): Promise<any[]> {
  try {
    return await dbService.getProfiles();
  } catch (err) {
    console.error("Failed to fetch customers", err);
    return [];
  }
}

export async function updateProfile(userId: string, fullName: string, phone: string, avatarUrl?: string) {
  try {
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
    return await dbService.getAddresses(userId);
  } catch (err) {
    console.error("Failed to fetch addresses", err);
    return [];
  }
}

export async function createAddress(address: any) {
  try {
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
    return await dbService.getExportData(type);
  } catch (err) {
    console.error("Failed to export data", err);
    return "";
  }
}

export async function fetchGstLogs(): Promise<GstLog[]> {
  try {
    return await dbService.getGstLogs();
  } catch (err) {
    console.error("Failed to fetch GST logs", err);
    return [];
  }
}
