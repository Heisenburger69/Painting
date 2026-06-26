import { sendEmail } from './send.js';
import { statusUpdateHtml } from './templates/status-update.js';

export async function sendOrderStatusUpdate({ orderId, customerName, customerEmail, newStatus, oldStatus }) {
  if (!customerEmail) {
    console.warn("[email] no customer email — skipping status update");
    return;
  }

  const shortId = (orderId || "").slice(0, 8).toUpperCase();

  const html = statusUpdateHtml({
    customerName: customerName || "Valued Customer",
    orderId,
    newStatus,
    oldStatus,
  });

  try {
    const result = await sendEmail({
      to: customerEmail,
      subject: `Order ${shortId} — ${newStatus}`,
      html,
    });
    if (result?.id) {
      console.log(`[email] status update sent to ${customerEmail} (${shortId} → ${newStatus})`);
    }
    return result;
  } catch (err) {
    console.error(`[email] failed to send status update for ${shortId}:`, err.message);
  }
}
