"use server";

import { revalidatePath } from "next/cache";
import { dbService } from "@/services/dbService";
import { NotificationService } from "@/services/notificationService";
import { Shipment } from "@/types";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function fetchShipments(token?: string): Promise<Shipment[]> {
  try {
    if (token && isSupabaseConfigured() && supabase) {
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: ""
      });
    }
    return await dbService.getShipments();
  } catch (err) {
    console.error("Failed to fetch shipments", err);
    return [];
  }
}

export async function fetchShipmentByOrderId(orderId: string, token?: string): Promise<Shipment | null> {
  try {
    if (token && isSupabaseConfigured() && supabase) {
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: ""
      });
    }
    return await dbService.getShipmentByOrderId(orderId);
  } catch (err) {
    console.error(`Failed to fetch shipment for order ${orderId}`, err);
    return null;
  }
}

export async function createNewShipment(
  shipment: Omit<Shipment, "id" | "createdAt" | "updatedAt" | "timeline">,
  token?: string
): Promise<{ success: boolean; shipment?: Shipment; error?: string }> {
  try {
    if (token && isSupabaseConfigured() && supabase) {
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: ""
      });
    }
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
  updates: Partial<Shipment>,
  token?: string
): Promise<{ success: boolean; shipment?: Shipment; error?: string }> {
  try {
    if (token && isSupabaseConfigured() && supabase) {
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: ""
      });
    }
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

export async function removeShipment(id: string, token?: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (token && isSupabaseConfigured() && supabase) {
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: ""
      });
    }
    const success = await dbService.deleteShipment(id);
    revalidatePath("/admin/shipments");
    revalidatePath("/admin/orders");
    revalidatePath("/orders");
    return { success };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete shipment." };
  }
}
