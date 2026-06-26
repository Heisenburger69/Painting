function shortenId(id) {
  return (id || "").slice(0, 8).toUpperCase();
}

export function orderConfirmationHtml({
  customerName,
  orderId,
  customerInfo,
  cartItems,
  totals,
}) {
  const shortId = shortenId(orderId);

  const itemsHtml = (cartItems || [])
    .map(
      (item) => {
        const imgUrl = item.image || (item.images && item.images[0]) || null;
        const imgCell = imgUrl
          ? `<a href="${escapeHtml(imgUrl)}" target="_blank" style="text-decoration:none;">
               <img src="${escapeHtml(imgUrl)}" alt="" width="48" height="48"
                 style="border-radius:4px; object-fit:cover; display:block; border:1px solid #e5e0d8;">
             </a>`
          : '<span style="color:#ccc;font-size:11px;">—</span>';
        return `
        <tr>
          <td style="padding:8px 0; border-bottom:1px solid #e5e5e5; width:56px; vertical-align:middle;">
            ${imgCell}
          </td>
          <td style="padding:8px 0; border-bottom:1px solid #e5e5e5; color:#3a3a3a; vertical-align:middle;">
            <a href="${escapeHtml(imgUrl || "#")}" target="_blank"
               style="color:#1a1a2e;text-decoration:none;font-weight:500;">
              ${escapeHtml(item.title || item.name || "Artwork")}
            </a>
          </td>
          <td style="padding:8px 0; border-bottom:1px solid #e5e5e5; text-align:right; color:#3a3a3a; vertical-align:middle;">
            ${Number(item.price).toLocaleString()} EGP
          </td>
        </tr>`;
      }
    )
    .join("");

  const waNumber = "201065390365";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f4f2ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:22px;font-weight:600;letter-spacing:1px;">HALA SALAH</h1>
              <p style="margin:6px 0 0;color:#a8a8b3;font-size:13px;">Original Paintings & Fine Art</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 20px;">
              <h2 style="margin:0 0 4px;font-size:22px;color:#1a1a2e;">Thank you, ${escapeHtml(customerName)}!</h2>
              <p style="margin:0;color:#666;font-size:15px;line-height:1.6;">
                Your payment has been received successfully. Your order is now
                being processed and will be shipped to your address shortly.
              </p>
            </td>
          </tr>

          <!-- Order ID Box -->
          <tr>
            <td style="padding:4px 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f3;border-radius:8px;border:1px solid #e5e0d8;">
                <tr>
                  <td style="padding:16px 24px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Order ID</p>
                    <p style="margin:0;font-size:28px;font-weight:700;font-family:'SF Mono','Courier New',monospace;letter-spacing:6px;color:#1a1a2e;">${shortId}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:10px 0 0;font-size:13px;color:#888;text-align:center;line-height:1.5;">
                Please use this Order ID when contacting us via email or WhatsApp —
                it's how we verify your order.
              </p>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding:0 40px 16px;">
              <h3 style="margin:0 0 12px;font-size:14px;color:#888;text-transform:uppercase;letter-spacing:1px;">Order Summary</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">
                  <td style="padding-bottom:6px;width:56px;"></td>
                  <td style="padding-bottom:6px;">Item</td>
                  <td style="padding-bottom:6px;text-align:right;">Price</td>
                </tr>
                ${itemsHtml}
                <tr>
                  <td colspan="2" style="padding:8px 0;color:#888;font-size:14px;">Subtotal</td>
                  <td style="padding:8px 0;text-align:right;color:#3a3a3a;font-size:14px;">${totals.subtotal.toLocaleString()} EGP</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:8px 0;color:#888;font-size:14px;">Shipping</td>
                  <td style="padding:8px 0;text-align:right;color:#3a3a3a;font-size:14px;">${totals.shipping.toLocaleString()} EGP</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:12px 0;border-top:2px solid #1a1a2e;font-weight:700;color:#1a1a2e;font-size:16px;">Total</td>
                  <td style="padding:12px 0;border-top:2px solid #1a1a2e;text-align:right;font-weight:700;color:#1a1a2e;font-size:16px;">${totals.total.toLocaleString()} EGP</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Details -->
          <tr>
            <td style="padding:16px 40px;">
              <h3 style="margin:0 0 12px;font-size:14px;color:#888;text-transform:uppercase;letter-spacing:1px;">Shipping Address</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td width="100" style="padding:4px 0;color:#888;font-size:13px;vertical-align:top;">Name</td><td style="padding:4px 0;color:#3a3a3a;font-size:13px;">${escapeHtml(customerInfo.name)}</td></tr>
                <tr><td style="padding:4px 0;color:#888;font-size:13px;vertical-align:top;">Email</td><td style="padding:4px 0;color:#3a3a3a;font-size:13px;">${escapeHtml(customerInfo.email)}</td></tr>
                <tr><td style="padding:4px 0;color:#888;font-size:13px;vertical-align:top;">Phone</td><td style="padding:4px 0;color:#3a3a3a;font-size:13px;">${escapeHtml(customerInfo.phone)}</td></tr>
                <tr><td style="padding:4px 0;color:#888;font-size:13px;vertical-align:top;">Address</td>
                  <td style="padding:4px 0;color:#3a3a3a;font-size:13px;">
                    ${escapeHtml(customerInfo.building)}, ${escapeHtml(customerInfo.apartment)}<br>
                    ${escapeHtml(customerInfo.street)}<br>
                    ${escapeHtml(customerInfo.city)}, ${escapeHtml(customerInfo.governorate)}<br>
                    Egypt
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:8px 40px;"><div style="height:1px;background:#e5e0d8;"></div></td></tr>

          <!-- Contact Footer -->
          <tr>
            <td style="padding:24px 40px 36px;text-align:center;">
              <p style="margin:0 0 10px;font-size:13px;color:#888;line-height:1.5;">
                Have questions about your order?<br>
                Reach out with your <strong>Order ID (${shortId})</strong> and we'll help.
              </p>
              <p style="margin:0 0 4px;">
                <a href="mailto:halasalah378@gmail.com?subject=Order%20${shortId}"
                   style="display:inline-block;padding:10px 20px;background:#1a1a2e;color:#fff;border-radius:6px;text-decoration:none;font-size:14px;">
                  &#9993; halasalah378@gmail.com
                </a>
              </p>
              <p style="margin:12px 0 0;">
                <a href="https://wa.me/${waNumber}?text=Order%20${shortId}"
                   target="_blank"
                   style="display:inline-block;padding:10px 20px;background:#25D366;color:#fff;border-radius:6px;text-decoration:none;font-size:14px;">
                  &#128222; 01065390365 (WhatsApp)
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
