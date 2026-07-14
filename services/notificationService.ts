
import { sendEmail } from "@/services/providers/emailProvider";
import { sendWhatsApp, whatsappTemplates } from "@/services/providers/whatsappProvider";
import { dbService } from "@/services/dbService";
import type { Order, Shipment, NotificationType, NotificationChannel } from "@/types";

// ── Deduplication cache (in-memory, resets on server restart) ─────────
const recentNotifications = new Map<string, number>();
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function isDuplicate(key: string): boolean {
  const now = Date.now();
  const last = recentNotifications.get(key);
  if (last && now - last < DEDUP_WINDOW_MS) return true;
  recentNotifications.set(key, now);
  // Cleanup old entries periodically
  if (recentNotifications.size > 500) {
    for (const [k, v] of recentNotifications) {
      if (now - v > DEDUP_WINDOW_MS) recentNotifications.delete(k);
    }
  }
  return false;
}

// ── Retry helper ─────────────────────────────────────────────────────
async function withRetry<T>(
  fn: () => Promise<T & { success: boolean; error?: string }>,
  maxAttempts: number = 3
): Promise<T & { success: boolean; error?: string; attempts: number }> {
  let lastResult: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    lastResult = await fn();
    if (lastResult.success) return { ...lastResult, attempts: attempt };
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1000 * attempt)); // exponential backoff
    }
  }
  return { ...lastResult, attempts: maxAttempts };
}

// ── Log helper ──────────────────────────────────────────────────────
async function logNotification(
  channel: NotificationChannel,
  provider: string,
  eventType: string,
  status: "sent" | "failed" | "retried",
  recipientEmail?: string,
  recipientPhone?: string,
  errorMessage?: string,
  attempts: number = 1,
  notificationId?: string
) {
  try {
    await dbService.createNotificationLog({
      channel,
      provider,
      eventType,
      status,
      recipientEmail,
      recipientPhone,
      errorMessage,
      attempts,
      notificationId,
    });
  } catch (e) {
    console.error("[NotificationService] Failed to log notification:", e);
  }
}

// ── Check user preferences ──────────────────────────────────────────
async function shouldSendEmail(
  userId: string | undefined,
  category: "order" | "shipment" | "promotional" | "account"
): Promise<boolean> {
  if (!userId) return true; // No user context = admin/system, always send
  try {
    const prefs = await dbService.getNotificationPreferences(userId);
    if (!prefs) return true; // No preferences set = default enabled
    switch (category) {
      case "order": return prefs.orderEmails;
      case "shipment": return prefs.shipmentEmails;
      case "promotional": return prefs.promotionalEmails;
      case "account": return prefs.accountEmails;
      default: return true;
    }
  } catch {
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PUBLIC NOTIFICATION SERVICE API
// ═══════════════════════════════════════════════════════════════════════

export const NotificationService = {

  // ── 1. Welcome Email ──────────────────────────────────────────────
  async sendWelcomeEmail(customerName: string, email: string, userId?: string) {
    const dedupKey = `welcome:${email}`;
    if (isDuplicate(dedupKey)) return;

    // Lazy import templates to avoid circular deps
    const { welcomeEmail } = await import("@/services/emailTemplates");
    const html = welcomeEmail(customerName);

    const result = await withRetry(() =>
      sendEmail(email, "Welcome to SSS Boutique ✨", html)
    );

    await logNotification("email", "resend", "welcome", result.success ? "sent" : "failed", email, undefined, result.error, result.attempts);

    // In-app notification
    await dbService.createNotification("welcome", "Welcome to SSS Boutique!", `Hello ${customerName}, welcome to SSS Boutique. Explore our luxury collection.`, userId, undefined, "in_app");
  },

  // ── 2. Password Reset Email ───────────────────────────────────────
  async sendPasswordResetEmail(customerName: string, email: string, resetLink: string) {
    const { passwordResetEmail } = await import("@/services/emailTemplates");
    const html = passwordResetEmail(customerName, resetLink);

    const result = await withRetry(() =>
      sendEmail(email, "Reset Your Password — SSS Boutique", html)
    );

    await logNotification("email", "resend", "password_reset", result.success ? "sent" : "failed", email, undefined, result.error, result.attempts);
  },

  // ── 3. Order Confirmation Email ───────────────────────────────────
  async sendOrderConfirmation(order: Order) {
    const dedupKey = `order_confirm:${order.id}`;
    if (isDuplicate(dedupKey)) return;

    if (!(await shouldSendEmail(undefined, "order"))) return;

    const { orderConfirmationEmail } = await import("@/services/emailTemplates");
    const html = orderConfirmationEmail({
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      items: (order.items || []).map((i) => ({
        name: i.productName || "Product",
        size: i.variantSize || "Standard",
        quantity: i.quantity,
        price: i.price,
        image: i.productImage,
      })),
      shippingAddress: order.shippingAddress,
      subtotal: order.subtotal,
      tax: order.tax,
      grandTotal: order.grandTotal,
    });

    const result = await withRetry(() =>
      sendEmail(order.customerEmail, `Order Confirmed — ${order.orderNumber}`, html)
    );

    await logNotification("email", "resend", "new_order", result.success ? "sent" : "failed", order.customerEmail, undefined, result.error, result.attempts);

    // In-app customer notification
    await dbService.createNotification("new_order", "Order Placed Successfully", `Your order ${order.orderNumber} has been placed. Total: ₹${order.grandTotal.toLocaleString("en-IN")}`, undefined, order.id, "in_app");

    // WhatsApp placeholder
    const waMsg = whatsappTemplates.orderConfirmation(order.customerName, order.orderNumber, `₹${order.grandTotal.toLocaleString("en-IN")}`);
    const waResult = await sendWhatsApp(order.shippingAddress?.phone || "", "order_confirmation", waMsg);
    await logNotification("whatsapp", "whatsapp_cloud", "new_order", waResult.success ? "sent" : "failed", undefined, order.shippingAddress?.phone, waResult.error, 1);
  },

  // ── 4. Order Status Update Email ──────────────────────────────────
  async sendOrderStatusUpdate(order: Order, newStatus: string) {
    const dedupKey = `order_status:${order.id}:${newStatus}`;
    if (isDuplicate(dedupKey)) return;

    if (!(await shouldSendEmail(undefined, "order"))) return;

    const { orderStatusEmail, deliveryConfirmationEmail, orderCancelledEmail } = await import("@/services/emailTemplates");

    let subject: string;
    let html: string;
    let eventType: NotificationType;
    let notifTitle: string;
    let notifMessage: string;

    const statusLower = newStatus.toLowerCase();

    if (statusLower.includes("confirm") || statusLower === "processing") {
      subject = `Order Confirmed — ${order.orderNumber}`;
      html = orderStatusEmail(order.customerName, order.orderNumber, "Order Confirmed", "Your order has been confirmed and is being prepared with care. Our team is getting everything ready for you.");
      eventType = "order_confirmed";
      notifTitle = "Order Confirmed";
      notifMessage = `Your order ${order.orderNumber} has been confirmed and is being processed.`;
    } else if (statusLower.includes("pack") || statusLower.includes("ready")) {
      subject = `Order Packed — ${order.orderNumber}`;
      html = orderStatusEmail(order.customerName, order.orderNumber, "Order Packed", "Your order has been carefully packed and is ready for shipment. You will receive tracking details soon.");
      eventType = "order_packed";
      notifTitle = "Order Packed";
      notifMessage = `Your order ${order.orderNumber} has been packed and is ready for shipment.`;
    } else if (statusLower.includes("ship")) {
      subject = `Order Shipped — ${order.orderNumber}`;
      html = orderStatusEmail(order.customerName, order.orderNumber, "Order Shipped", "Your order is on its way! You can track your shipment using the tracking details provided.");
      eventType = "order_shipped";
      notifTitle = "Order Shipped";
      notifMessage = `Your order ${order.orderNumber} has been shipped.`;
    } else if (statusLower.includes("deliver")) {
      subject = `Order Delivered — ${order.orderNumber}`;
      html = deliveryConfirmationEmail(order.customerName, order.orderNumber);
      eventType = "order_delivered";
      notifTitle = "Order Delivered";
      notifMessage = `Your order ${order.orderNumber} has been delivered. We hope you love it!`;
    } else if (statusLower.includes("cancel")) {
      subject = `Order Cancelled — ${order.orderNumber}`;
      html = orderCancelledEmail(order.customerName, order.orderNumber);
      eventType = "order_cancelled";
      notifTitle = "Order Cancelled";
      notifMessage = `Your order ${order.orderNumber} has been cancelled.`;
    } else if (statusLower.includes("return") || statusLower.includes("refund")) {
      subject = `Order Update — ${order.orderNumber}`;
      html = orderStatusEmail(order.customerName, order.orderNumber, newStatus, "Your order status has been updated. If you have any questions, please contact our support team.");
      eventType = "order_cancelled";
      notifTitle = "Order Updated";
      notifMessage = `Your order ${order.orderNumber} status changed to ${newStatus}.`;
    } else {
      return; // Unknown status, skip
    }

    const result = await withRetry(() => sendEmail(order.customerEmail, subject, html));
    await logNotification("email", "resend", eventType, result.success ? "sent" : "failed", order.customerEmail, undefined, result.error, result.attempts);

    // In-app notification for customer
    await dbService.createNotification(eventType, notifTitle, notifMessage, undefined, order.id, "in_app");
  },

  // ── 5. Shipment Created Email ─────────────────────────────────────
  async sendShipmentCreated(order: Order, shipment: Shipment) {
    const dedupKey = `shipment_created:${shipment.id}`;
    if (isDuplicate(dedupKey)) return;

    if (!(await shouldSendEmail(undefined, "shipment"))) return;

    const { shipmentCreatedEmail } = await import("@/services/emailTemplates");
    const html = shipmentCreatedEmail(
      { customerName: order.customerName, orderNumber: order.orderNumber },
      { courierName: shipment.courierName, trackingNumber: shipment.trackingNumber, estimatedDeliveryDate: shipment.estimatedDeliveryDate }
    );

    const result = await withRetry(() =>
      sendEmail(order.customerEmail, `Shipment Dispatched — ${order.orderNumber}`, html)
    );

    await logNotification("email", "resend", "shipment_created", result.success ? "sent" : "failed", order.customerEmail, undefined, result.error, result.attempts);

    // In-app notification
    await dbService.createNotification("shipment_created", "Shipment Dispatched", `Your order ${order.orderNumber} has been shipped via ${shipment.courierName}. Tracking: ${shipment.trackingNumber}`, undefined, order.id, "in_app");

    // WhatsApp placeholder
    const waMsg = whatsappTemplates.shipmentCreated(order.customerName, order.orderNumber, shipment.courierName, shipment.trackingNumber);
    await sendWhatsApp(order.shippingAddress?.phone || "", "shipment_created", waMsg);
  },

  // ── 6. Shipment Status Update Email ───────────────────────────────
  async sendShipmentUpdate(order: Order, shipment: Shipment) {
    const dedupKey = `shipment_update:${shipment.id}:${shipment.status}`;
    if (isDuplicate(dedupKey)) return;

    if (!(await shouldSendEmail(undefined, "shipment"))) return;

    const statusLower = (shipment.status || "").toLowerCase();

    if (statusLower.includes("deliver") && !statusLower.includes("fail")) {
      // Delivery confirmation
      const { deliveryConfirmationEmail } = await import("@/services/emailTemplates");
      const html = deliveryConfirmationEmail(order.customerName, order.orderNumber);
      const result = await withRetry(() =>
        sendEmail(order.customerEmail, `Order Delivered — ${order.orderNumber}`, html)
      );
      await logNotification("email", "resend", "shipment_delivered", result.success ? "sent" : "failed", order.customerEmail, undefined, result.error, result.attempts);

      await dbService.createNotification("shipment_delivered", "Order Delivered!", `Your order ${order.orderNumber} has been delivered. We hope you love it!`, undefined, order.id, "in_app");

      // WhatsApp placeholder
      const waMsg = whatsappTemplates.delivered(order.customerName, order.orderNumber);
      await sendWhatsApp(order.shippingAddress?.phone || "", "delivered", waMsg);
    } else {
      // Generic shipment status update
      const { shipmentTrackingEmail } = await import("@/services/emailTemplates");
      const html = shipmentTrackingEmail(
        { customerName: order.customerName, orderNumber: order.orderNumber },
        { courierName: shipment.courierName, trackingNumber: shipment.trackingNumber, status: shipment.status, estimatedDeliveryDate: shipment.estimatedDeliveryDate }
      );
      const result = await withRetry(() =>
        sendEmail(order.customerEmail, `Shipment Update — ${order.orderNumber}`, html)
      );
      await logNotification("email", "resend", "shipment_updated", result.success ? "sent" : "failed", order.customerEmail, undefined, result.error, result.attempts);

      await dbService.createNotification("shipment_updated", `Shipment ${shipment.status}`, `Your order ${order.orderNumber} shipment status: ${shipment.status}. Courier: ${shipment.courierName}`, undefined, order.id, "in_app");

      // WhatsApp placeholder
      const waMsg = whatsappTemplates.trackingUpdated(order.customerName, order.orderNumber, shipment.status, shipment.courierName);
      await sendWhatsApp(order.shippingAddress?.phone || "", "tracking_updated", waMsg);
    }
  },
};
