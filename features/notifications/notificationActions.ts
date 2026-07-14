"use server";

import { revalidatePath } from "next/cache";
import { dbService } from "@/services/dbService";
import { Notification, NotificationLog, NotificationPreferences } from "@/types";

export async function fetchUserNotifications(userId: string): Promise<Notification[]> {
  try {
    return await dbService.getNotificationsByUserId(userId);
  } catch (err) {
    console.error(`Failed to fetch notifications for user ${userId}`, err);
    return [];
  }
}

export async function markUserNotificationRead(id: string, userId: string): Promise<{ success: boolean }> {
  try {
    const success = await dbService.markNotificationAsRead(id);
    revalidatePath("/orders");
    return { success };
  } catch (err) {
    console.error(`Failed to mark notification read: ${id}`, err);
    return { success: false };
  }
}

export async function fetchNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  try {
    const prefs = await dbService.getNotificationPreferences(userId);
    if (prefs) return prefs;
    
    // Default preferences
    return {
      id: "",
      userId,
      orderEmails: true,
      shipmentEmails: true,
      promotionalEmails: true,
      accountEmails: true
    };
  } catch (err) {
    console.error(`Failed to fetch preferences for user ${userId}`, err);
    return {
      id: "",
      userId,
      orderEmails: true,
      shipmentEmails: true,
      promotionalEmails: true,
      accountEmails: true
    };
  }
}

export async function saveNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<{ success: boolean; preferences?: NotificationPreferences; error?: string }> {
  try {
    const data = await dbService.upsertNotificationPreferences(userId, preferences);
    revalidatePath("/orders");
    return { success: true, preferences: data };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save preferences." };
  }
}

export async function fetchNotificationLogs(): Promise<NotificationLog[]> {
  try {
    return await dbService.getNotificationLogs();
  } catch (err) {
    console.error("Failed to fetch notification logs", err);
    return [];
  }
}
