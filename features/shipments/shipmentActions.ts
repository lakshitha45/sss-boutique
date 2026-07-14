"use server";

import { revalidatePath } from "next/cache";
import { dbService } from "@/services/dbService";
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
    const data = await dbService.updateShipment(id, updates);
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
