
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "SSS Boutique <noreply@sssboutique.com>";

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<EmailSendResult> {
  if (!to || !isValidEmail(to)) {
    return { success: false, error: `Invalid email address: ${to}` };
  }

  if (!resend) {
    console.warn("[EmailProvider] RESEND_API_KEY not configured. Email not sent:", { to, subject });
    return { success: false, error: "Email provider not configured (RESEND_API_KEY missing)" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("[EmailProvider] Resend API error:", error);
      return { success: false, error: error.message || "Resend API error" };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error("[EmailProvider] Send failed:", err);
    return { success: false, error: err.message || "Unknown email send error" };
  }
}
