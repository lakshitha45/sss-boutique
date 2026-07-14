"use server";

import { revalidatePath } from "next/cache";
import { dbService } from "@/services/dbService";
import { NotificationService } from "@/services/notificationService";
import { Shipment } from "@/types";

export async function fetchShipments(): Promise<Shipment[]> {
  try {
    return await dbService.getShipments();
  } catch (err) {
    console.error("Failed to fetch shipments", err);
    return [];
  }
}

export async function fetchShipmentByOrderId(orderId: string): Promise<Shipment | null> {
  try {
    return await dbService.getShipmentByOrderId(orderId);
  } catch (err) {
    console.error(`Failed to fetch shipment for order ${orderId}`, err);
    return null;
  }
}

export async function createNewShipment(
  shipment: Omit<Shipment, "id" | "createdAt" | "updatedAt" | "timeline">
): Promise<{ success: boolean; shipment?: Shipment; error?: string }> {
  try {
    const data = await dbService.createShipment(shipment);
    
    // Trigger notification
    try {
      const order = await dbService.getOrderById(shipment.orderId);
      if (order) {
        await NotificationService.sendShipmentCreated(order, data);
      }
    } catch (ne) {
      console.error("Failed to trigger shipment creation email:", ne);
    }

    revalidatePath("/admin/shipments");
    revalidatePath("/admin/orders");
    revalidatePath("/orders");
    return { success: true, shipment: data };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create shipment." };
  }
}

export async function modifyShipment(
  id: string,
  updates: Partial<Shipment>
): Promise<{ success: boolean; shipment?: Shipment; error?: string }> {
  try {
    // Load current shipment state to fetch order info
    const shipments = await dbService.getShipments();
    const current = shipments.find(s => s.id === id);
    
    const data = await dbService.updateShipment(id, updates);
    
    // Trigger notification if status is updated
    if (current && updates.status && updates.status !== current.status) {
      try {
        const order = await dbService.getOrderById(current.orderId);
        if (order) {
          await NotificationService.sendShipmentUpdate(order, data);
        }
      } catch (ne) {
        console.error("Failed to trigger shipment update email:", ne);
      }
    }

    revalidatePath("/admin/shipments");
    revalidatePath("/admin/orders");
    revalidatePath("/orders");
    return { success: true, shipment: data };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update shipment." };
  }
}

export async function removeShipment(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await dbService.deleteShipment(id);
    revalidatePath("/admin/shipments");
    revalidatePath("/admin/orders");
    revalidatePath("/orders");
    return { success };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete shipment." };
  }
}
