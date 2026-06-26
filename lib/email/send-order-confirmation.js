import { sendEmail } from './send.js';
import { orderConfirmationHtml } from './templates/order-confirmation.js';

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
      subject: `Order Confirmed — ${orderId.slice(0, 8).toUpperCase()}`,
      html,
    });
    if (result?.id) {
      console.log(`[email] order confirmation sent to ${customerInfo.email} (order ${orderId})`);
    }
    return result;
  } catch (err) {
    console.error(`[email] failed to send confirmation for order ${orderId}:`, err.message);
  }
}
