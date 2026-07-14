// Luxury HTML Email Templates for SSS Boutique

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function baseLayout(content: string, previewText: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SSS Boutique</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0A0A0A;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      color: #E4E4E7;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    .wrapper {
      width: 100%;
      background-color: #0A0A0A;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #121212;
      border: 1px solid #1F1F1F;
    }
    .header {
      padding: 40px 20px;
      text-align: center;
      border-bottom: 1px solid #1F1F1F;
    }
    .brand-title {
      font-family: Georgia, serif;
      font-size: 28px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #D4A574;
      margin: 0;
      font-weight: 300;
    }
    .brand-subtitle {
      font-size: 10px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: #71717A;
      margin: 8px 0 0 0;
    }
    .content {
      padding: 40px 30px;
      line-height: 1.6;
      font-size: 14px;
      color: #D4D4D8;
    }
    .footer {
      padding: 40px 20px;
      text-align: center;
      border-top: 1px solid #1F1F1F;
      background-color: #0E0E0E;
    }
    .footer-text {
      font-size: 11px;
      color: #52525B;
      letter-spacing: 0.05em;
      line-height: 1.8;
    }
    .btn {
      display: inline-block;
      background-color: #D4A574;
      color: #0A0A0A !important;
      text-decoration: none;
      padding: 12px 30px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-top: 20px;
      transition: background-color 0.2s ease;
    }
  </style>
</head>
<body>
  <!--[if !mso]><!-->
  <span style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0;">${previewText}</span>
  <!--<![endif]-->
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand-title">SSS Boutique</h1>
        <p class="brand-subtitle">Indian Luxury Haute Couture</p>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p class="footer-text" style="color: #D4A574; font-size: 12px; margin-bottom: 10px;">SSS BOUTIQUE</p>
        <p class="footer-text">
          12, Khader Nawaz Khan Road, Nungambakkam, Chennai - 600006<br>
          support@sssboutique.com | +91 44 4567 8901
        </p>
        <p class="footer-text" style="margin-top: 20px; font-size: 10px;">
          © ${new Date().getFullYear()} SSS Boutique. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function welcomeEmail(customerName: string): string {
  const content = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 300; color: #FFFFFF; margin-bottom: 20px; text-align: center;">Welcome to the House of SSS Boutique</h2>
    <p>Dear ${customerName},</p>
    <p>Thank you for creating an account with SSS Boutique. We are thrilled to welcome you to our digital home, where luxury meets Indian heritage couture.</p>
    <p>Your account allows you to seamlessly explore our custom collections, manage your personal size profiles, save items to your wishlist, and track your orders in real-time.</p>
    <p style="text-align: center; margin-top: 30px;">
      <a href="https://sssboutique.com/login" class="btn">Explore Collections</a>
    </p>
    <p style="margin-top: 40px; border-t: 1px solid #1F1F1F; padding-top: 20px; font-size: 12px; color: #71717A;">
      If you did not register for an account, please ignore this email or contact support.
    </p>
  `;
  return baseLayout(content, "Welcome to SSS Boutique — where luxury meets Indian heritage couture.");
}

export function passwordResetEmail(customerName: string, resetLink: string): string {
  const content = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 300; color: #FFFFFF; margin-bottom: 20px; text-align: center;">Password Reset Request</h2>
    <p>Dear ${customerName},</p>
    <p>We received a request to reset the password associated with your account. Click the button below to secure your account and set a new password:</p>
    <p style="text-align: center; margin-top: 30px;">
      <a href="${resetLink}" class="btn">Reset Password</a>
    </p>
    <p style="margin-top: 30px; font-size: 12px; color: #A1A1AA;">
      ⚠️ <strong>Security Notice:</strong> This link is for one-time use only and will expire in <strong>1 hour</strong>. If you did not make this request, please ignore this email; your credentials remain secure.
    </p>
  `;
  return baseLayout(content, "Reset your SSS Boutique account password securely.");
}

export function orderConfirmationEmail(order: {
  customerName: string;
  orderNumber: string;
  createdAt: string;
  items: Array<{ name: string; size?: string; quantity: number; price: number; image?: string }>;
  shippingAddress: { fullName: string; addressLine1: string; city: string; state: string; postalCode: string; phone: string };
  subtotal: number;
  tax: number;
  grandTotal: number;
}): string {
  let itemsHtml = "";
  for (const item of order.items) {
    itemsHtml += `
      <tr style="border-bottom: 1px solid #1F1F1F;">
        <td style="padding: 15px 0;">
          <div style="font-weight: bold; color: #FFFFFF;">${item.name}</div>
          <div style="font-size: 11px; color: #71717A; margin-top: 2px;">Size: ${item.size || "Standard"}</div>
        </td>
        <td style="padding: 15px 0; text-align: center; color: #A1A1AA;">${item.quantity}</td>
        <td style="padding: 15px 0; text-align: right; color: #FFFFFF; font-mono">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `;
  }

  const content = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 300; color: #FFFFFF; margin-bottom: 5px;">Thank you for your order.</h2>
    <p style="color: #D4A574; font-size: 12px; margin-top: 0; margin-bottom: 25px; font-mono">Order Number: ${order.orderNumber}</p>
    
    <p>Dear ${order.customerName},</p>
    <p>We are delighted to confirm that your order has been received and is currently being processed. Below is a summary of your premium selections:</p>
    
    <table style="width: 100%; margin-top: 30px; margin-bottom: 30px; text-align: left;">
      <thead>
        <tr style="border-bottom: 1px solid #27272A; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; color: #71717A;">
          <th style="padding-bottom: 10px;">Item Description</th>
          <th style="padding-bottom: 10px; text-align: center; width: 60px;">Qty</th>
          <th style="padding-bottom: 10px; text-align: right; width: 100px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <table style="width: 100%; margin-top: 20px; border-top: 1px solid #1F1F1F; padding-top: 20px; font-size: 13px;">
      <tr>
        <td style="color: #71717A; padding: 4px 0;">Subtotal</td>
        <td style="text-align: right; color: #FFFFFF; padding: 4px 0;">${formatCurrency(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="color: #71717A; padding: 4px 0;">GST / Luxury Tax</td>
        <td style="text-align: right; color: #FFFFFF; padding: 4px 0;">${formatCurrency(order.tax)}</td>
      </tr>
      <tr style="font-size: 16px; font-weight: bold; border-top: 1px solid #27272A;">
        <td style="color: #D4A574; padding-top: 15px;">Grand Total</td>
        <td style="text-align: right; color: #D4A574; padding-top: 15px;">${formatCurrency(order.grandTotal)}</td>
      </tr>
    </table>

    <div style="background-color: #0E0E0E; border: 1px solid #1F1F1F; padding: 20px; margin-top: 35px;">
      <h3 style="font-family: Georgia, serif; font-size: 14px; font-weight: 300; color: #FFFFFF; margin-top: 0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em;">Shipping Details</h3>
      <p style="margin: 0; line-height: 1.6; color: #A1A1AA; font-size: 13px;">
        <strong>${order.shippingAddress.fullName}</strong><br>
        ${order.shippingAddress.addressLine1}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br>
        Phone: ${order.shippingAddress.phone}
      </p>
    </div>
  `;
  return baseLayout(content, `Order confirmation for reference: ${order.orderNumber}`);
}

export function orderStatusEmail(customerName: string, orderNumber: string, status: string, message: string): string {
  const content = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 300; color: #FFFFFF; margin-bottom: 5px;">Order Status Update</h2>
    <p style="color: #D4A574; font-size: 12px; margin-top: 0; margin-bottom: 25px; font-mono">Order Number: ${orderNumber}</p>
    
    <p>Dear ${customerName},</p>
    <p>${message}</p>
    
    <div style="text-align: center; margin: 35px 0;">
      <span style="display: inline-block; background-color: #1F1F1F; border: 1px solid #D4A574; padding: 12px 35px; color: #D4A574; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: bold;">
        Status: ${status}
      </span>
    </div>
    
    <p style="font-size: 13px; color: #71717A;">If you have any questions or require custom fitting changes, reply directly to this email or speak with our luxury care desk.</p>
  `;
  return baseLayout(content, `Your order ${orderNumber} is now: ${status}`);
}

export function shipmentCreatedEmail(
  order: { customerName: string; orderNumber: string },
  shipment: { courierName: string; trackingNumber: string; estimatedDeliveryDate?: string }
): string {
  const estDateHtml = shipment.estimatedDeliveryDate
    ? `<p style="margin: 5px 0 0 0;">Estimated Delivery: <strong>${new Date(shipment.estimatedDeliveryDate).toLocaleDateString()}</strong></p>`
    : "";

  const content = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 300; color: #FFFFFF; margin-bottom: 5px;">Your Order has Shipped</h2>
    <p style="color: #D4A574; font-size: 12px; margin-top: 0; margin-bottom: 25px; font-mono">Order Number: ${order.orderNumber}</p>
    
    <p>Dear ${order.customerName},</p>
    <p>We are pleased to inform you that your designer items have been dispatched and handed over to our courier partner. You can now follow its progress:</p>
    
    <div style="background-color: #0E0E0E; border: 1px solid #1F1F1F; padding: 20px; margin: 30px 0;">
      <table style="width: 100%; font-size: 13px; color: #A1A1AA;">
        <tr>
          <td style="padding: 4px 0; color: #71717A; width: 120px;">Courier</td>
          <td style="padding: 4px 0; color: #FFFFFF; font-weight: bold;">${shipment.courierName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #71717A;">Waybill Number</td>
          <td style="padding: 4px 0; color: #D4A574; font-mono; font-weight: bold;">${shipment.trackingNumber}</td>
        </tr>
      </table>
      ${estDateHtml}
    </div>
    
    <p style="text-align: center; margin-top: 30px;">
      <a href="https://sssboutique.com/track?order=${order.orderNumber}&phone=tracking" class="btn">Track Shipment</a>
    </p>
  `;
  return baseLayout(content, `Shipment dispatched for order ${order.orderNumber}`);
}

export function shipmentTrackingEmail(
  order: { customerName: string; orderNumber: string },
  shipment: { courierName: string; trackingNumber: string; status: string; estimatedDeliveryDate?: string }
): string {
  const estDateHtml = shipment.estimatedDeliveryDate
    ? `<p style="margin: 5px 0 0 0;">Estimated Delivery: <strong>${new Date(shipment.estimatedDeliveryDate).toLocaleDateString()}</strong></p>`
    : "";

  const content = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 300; color: #FFFFFF; margin-bottom: 5px;">Shipment Tracking Update</h2>
    <p style="color: #D4A574; font-size: 12px; margin-top: 0; margin-bottom: 25px; font-mono">Order Number: ${order.orderNumber}</p>
    
    <p>Dear ${order.customerName},</p>
    <p>There is a status update on your shipment:</p>
    
    <div style="text-align: center; margin: 25px 0;">
      <span style="display: inline-block; background-color: #1F1F1F; border: 1px solid #D4A574; padding: 10px 25px; color: #D4A574; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;">
        Current Status: ${shipment.status}
      </span>
    </div>
    
    <div style="background-color: #0E0E0E; border: 1px solid #1F1F1F; padding: 20px; margin: 30px 0;">
      <table style="width: 100%; font-size: 13px; color: #A1A1AA;">
        <tr>
          <td style="padding: 4px 0; color: #71717A; width: 120px;">Courier</td>
          <td style="padding: 4px 0; color: #FFFFFF;">${shipment.courierName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #71717A;">Waybill Number</td>
          <td style="padding: 4px 0; color: #FFFFFF; font-mono;">${shipment.trackingNumber}</td>
        </tr>
      </table>
      ${estDateHtml}
    </div>
    
    <p style="text-align: center; margin-top: 30px;">
      <a href="https://sssboutique.com/track" class="btn">Track Order Details</a>
    </p>
  `;
  return baseLayout(content, `Tracking status change for order ${order.orderNumber}: ${shipment.status}`);
}

export function deliveryConfirmationEmail(customerName: string, orderNumber: string): string {
  const content = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 300; color: #FFFFFF; margin-bottom: 5px;">Your Order has Been Delivered</h2>
    <p style="color: #D4A574; font-size: 12px; margin-top: 0; margin-bottom: 25px; font-mono">Order Number: ${orderNumber}</p>
    
    <p>Dear ${customerName},</p>
    <p>We hope this email finds you well. Our records show that your SSS Boutique order has been delivered.</p>
    <p>It was our honor to craft these selections for you. As we constantly refine our custom tailoring, we would be extremely grateful to hear your thoughts on the fabrics, fit, and craftsmanship.</p>
    
    <p style="text-align: center; margin-top: 35px;">
      <a href="https://sssboutique.com/orders" class="btn">Share Your Review</a>
    </p>
    
    <p style="margin-top: 35px; font-light text-align: center; font-size: 13px;">Thank you for choosing SSS Boutique.</p>
  `;
  return baseLayout(content, `Delivered: order ${orderNumber}. Please share your thoughts with us.`);
}

export function orderCancelledEmail(customerName: string, orderNumber: string, reason?: string): string {
  const reasonHtml = reason
    ? `<div style="background-color: #1A1A1A; border-left: 2px solid #D4A574; padding: 12px 20px; margin: 25px 0; font-style: italic; font-size: 13px;">Reason: "${reason}"</div>`
    : "";

  const content = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 300; color: #FFFFFF; margin-bottom: 5px;">Order Cancelled</h2>
    <p style="color: #D4A574; font-size: 12px; margin-top: 0; margin-bottom: 25px; font-mono">Order Number: ${orderNumber}</p>
    
    <p>Dear ${customerName},</p>
    <p>This email confirms that your order has been cancelled.</p>
    ${reasonHtml}
    <p>If payment was successfully processed, a full refund has been initiated and will credit to your account shortly. If you did not request this cancellation or have questions, please reach out directly to our support desk.</p>
  `;
  return baseLayout(content, `Cancellation confirmation for order ${orderNumber}`);
}
