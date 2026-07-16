"use server";

import { revalidatePath } from "next/cache";
import { dbService } from "@/services/dbService";
import { NotificationService } from "@/services/notificationService";
import { Shipment } from "@/types";
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

  console.log("[shipmentActions] ensureAuth activeToken present:", !!activeToken, "refreshToken present:", !!refreshToken);

  if (activeToken) {
    // 1. Manually inject Bearer token into Postgrest headers for immediate database RLS bypass
    if ((supabase as any).rest) {
      try {
        (supabase as any).rest.headers.set("Authorization", `Bearer ${activeToken}`);
        console.log("[shipmentActions] Injected Authorization header successfully");
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
      console.log("[shipmentActions] setSession result - user:", data?.user?.email, "error:", error?.message);
    } catch (e) {
      console.error("Failed to set session on Supabase auth client:", e);
    }
  } else {
    console.warn("[shipmentActions] ensureAuth called but no activeToken was found!");
  }
}

export async function fetchShipments(token?: string): Promise<Shipment[]> {
  try {
    await ensureAuth(token);
    return await dbService.getShipments();
  } catch (err) {
    console.error("Failed to fetch shipments", err);
    return [];
  }
}

export async function fetchShipmentByOrderId(orderId: string, token?: string): Promise<Shipment | null> {
  try {
    await ensureAuth(token);
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
    await ensureAuth(token);
    
    // Check if a shipment already exists for this order
    const existing = await dbService.getShipmentByOrderId(shipment.orderId);
    if (existing) {
      return { success: false, error: "A shipment record already exists for this order. Double shipments are not permitted." };
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
    await ensureAuth(token);
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
    await ensureAuth(token);
    const success = await dbService.deleteShipment(id);
    revalidatePath("/admin/shipments");
    revalidatePath("/admin/orders");
    revalidatePath("/orders");
    return { success };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete shipment." };
  }
}
