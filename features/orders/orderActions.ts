"use server";

import { revalidatePath } from "next/cache";
import { dbService } from "@/services/dbService";
import { Order } from "@/types";

export async function placeOrder(
  orderData: Omit<Order, "id" | "createdAt" | "orderNumber" | "paymentStatus" | "orderStatus">
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const order = await dbService.createOrder(orderData);
    
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
  status: Order["orderStatus"],
  trackingNumber?: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const order = await dbService.updateOrderStatus(id, status, trackingNumber);
    revalidatePath("/admin/orders");
    return { success: true, order };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update order status.";
    return { success: false, error: message };
  }
}
