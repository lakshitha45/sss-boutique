
// ── WhatsApp Cloud API Provider (Placeholder) ───────────────────────────
// This provider is a placeholder for future WhatsApp Business API integration.
// It logs messages to console and notification_logs only.
// When ready, replace the send logic with Meta WhatsApp Cloud API calls.

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Pre-built WhatsApp message templates
export const whatsappTemplates = {
  orderConfirmation: (customerName: string, orderNumber: string, total: string) =>
    `🛍️ *SSS Boutique*\n\nHello ${customerName}!\n\nYour order *${orderNumber}* has been placed successfully.\n\n💰 Total: ${total}\n\nThank you for shopping with us! ✨`,

  shipmentCreated: (customerName: string, orderNumber: string, courier: string, tracking: string) =>
    `📦 *SSS Boutique*\n\nHello ${customerName}!\n\nYour order *${orderNumber}* has been shipped!\n\n🚚 Courier: ${courier}\n📋 Tracking: ${tracking}\n\nTrack your order at sssboutique.com/track`,

  trackingUpdated: (customerName: string, orderNumber: string, status: string, courier: string) =>
    `🔄 *SSS Boutique*\n\nHello ${customerName}!\n\nShipment update for order *${orderNumber}*:\n\n📍 Status: *${status}*\n🚚 Courier: ${courier}\n\nTrack at sssboutique.com/track`,

  delivered: (customerName: string, orderNumber: string) =>
    `✅ *SSS Boutique*\n\nHello ${customerName}!\n\nYour order *${orderNumber}* has been delivered! 🎉\n\nWe hope you love your purchase. Please leave us a review! ⭐\n\nThank you for choosing SSS Boutique! ✨`,

  cancelled: (customerName: string, orderNumber: string) =>
    `❌ *SSS Boutique*\n\nHello ${customerName}!\n\nYour order *${orderNumber}* has been cancelled.\n\nIf you have any questions, please contact us at support@sssboutique.com\n\nSSS Boutique Team`,
};

export async function sendWhatsApp(
  phone: string,
  templateName: string,
  message: string
): Promise<WhatsAppSendResult> {
  // ── PLACEHOLDER ──────────────────────────────────────────────
  // When WhatsApp Cloud API is integrated:
  // 1. Set WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env
  // 2. Replace this function body with:
  //    const response = await fetch(
  //      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
  //      { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: ... }
  //    );
  // ─────────────────────────────────────────────────────────────

  console.log(`[WhatsAppProvider] PLACEHOLDER — Would send to ${phone}:`);
  console.log(`[WhatsAppProvider] Template: ${templateName}`);
  console.log(`[WhatsAppProvider] Message: ${message.substring(0, 100)}...`);

  return {
    success: false,
    error: "WhatsApp provider not yet integrated (placeholder only)",
  };
}
