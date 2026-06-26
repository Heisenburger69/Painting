import { sendEmail } from './send.js';
import { orderConfirmationHtml } from './templates/order-confirmation.js';
import { adminNotificationHtml } from './templates/admin-notification.js';

const ADMIN_EMAIL = "youssefasabry@outlook.com";

export async function sendOrderConfirmation({
  orderId,
  customerInfo,
  cartItems,
  totals,
}) {
  if (!customerInfo?.email) {
    console.warn("[email] no buyer email — skipping order confirmation");
    return;
  }

  const shortId = (orderId || "").slice(0, 8).toUpperCase();

  const html = orderConfirmationHtml({
    customerName: customerInfo.name || "Valued Customer",
    orderId,
    customerInfo,
    cartItems: cartItems || [],
    totals: {
      subtotal: Number(totals.subtotal) || 0,
      shipping: Number(totals.shipping) || 0,
      total: Number(totals.total) || 0,
    },
  });

  try {
    const result = await sendEmail({
      to: customerInfo.email,
      subject: `Order Confirmed — ${shortId}`,
      html,
    });
    if (result?.id) {
      console.log(`[email] confirmation sent to ${customerInfo.email} (${shortId})`);
    }
  } catch (err) {
    console.error(`[email] failed to send confirmation for ${shortId}:`, err.message);
  }

  try {
    const adminHtml = adminNotificationHtml({
      orderId,
      customerInfo,
      cartItems: cartItems || [],
      totals: {
        subtotal: Number(totals.subtotal) || 0,
        shipping: Number(totals.shipping) || 0,
        total: Number(totals.total) || 0,
      },
    });

    const adminResult = await sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Order — ${shortId}`,
      html: adminHtml,
    });
    if (adminResult?.id) {
      console.log(`[email] admin notified for ${shortId}`);
    }
  } catch (err) {
    console.error(`[email] failed to notify admin for ${shortId}:`, err.message);
  }
}
