function shortenId(id) {
  return (id || "").slice(0, 8).toUpperCase();
}

export function adminNotificationHtml({
  orderId,
  customerInfo,
  cartItems,
  totals,
}) {
  const shortId = shortenId(orderId);

  const itemsTable = (cartItems || [])
    .map(
      (item) => {
        const imgUrl = item.image || (item.images && item.images[0]) || null;
        const imgCell = imgUrl
          ? `<a href="${escapeHtml(imgUrl)}" target="_blank" style="text-decoration:none;">
               <img src="${escapeHtml(imgUrl)}" alt="" width="40" height="40"
                 style="border-radius:4px;object-fit:cover;display:block;border:1px solid #e5e0d8;">
             </a>`
          : "";
        return `
    <tr>
      <td style="padding:4px 0;font-size:13px;color:#3a3a3a;width:48px;">${imgCell}</td>
      <td style="padding:4px 0;font-size:13px;color:#3a3a3a;">${escapeHtml(item.title || item.name || "Artwork")}</td>
      <td style="padding:4px 0;font-size:13px;color:#3a3a3a;text-align:right;">${Number(item.price).toLocaleString()} EGP</td>
    </tr>`;
      }
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Order — ${shortId}</title>
</head>
<body style="margin:0;padding:0;background:#f4f2ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:600;letter-spacing:1px;">
                &#128230; NEW ORDER — ${shortId}
              </h1>
            </td>
          </tr>

          <!-- Customer Details -->
          <tr>
            <td style="padding:28px 40px 0;">
              <h3 style="margin:0 0 12px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Buyer Info</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                <tr><td width="100" style="padding:3px 0;color:#888;">Name</td><td style="padding:3px 0;color:#1a1a2e;font-weight:600;">${escapeHtml(customerInfo.name)}</td></tr>
                <tr><td style="padding:3px 0;color:#888;">Email</td><td style="padding:3px 0;"><a href="mailto:${escapeHtml(customerInfo.email)}" style="color:#1a1a2e;">${escapeHtml(customerInfo.email)}</a></td></tr>
                <tr><td style="padding:3px 0;color:#888;">Phone</td><td style="padding:3px 0;color:#1a1a2e;">${escapeHtml(customerInfo.phone)}</td></tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Details -->
          <tr>
            <td style="padding:16px 40px 0;">
              <h3 style="margin:0 0 12px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Shipping Address</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                <tr><td width="100" style="padding:3px 0;color:#888;">Governorate</td><td style="padding:3px 0;color:#1a1a2e;">${escapeHtml(customerInfo.governorate)}</td></tr>
                <tr><td style="padding:3px 0;color:#888;">City</td><td style="padding:3px 0;color:#1a1a2e;">${escapeHtml(customerInfo.city)}</td></tr>
                <tr><td style="padding:3px 0;color:#888;">Street</td><td style="padding:3px 0;color:#1a1a2e;">${escapeHtml(customerInfo.street)}</td></tr>
                <tr><td style="padding:3px 0;color:#888;">Building</td><td style="padding:3px 0;color:#1a1a2e;">${escapeHtml(customerInfo.building)}</td></tr>
                <tr><td style="padding:3px 0;color:#888;">Apartment</td><td style="padding:3px 0;color:#1a1a2e;">${escapeHtml(customerInfo.apartment)}</td></tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Summary -->
          <tr>
            <td style="padding:16px 40px 0;">
              <h3 style="margin:0 0 12px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Delivery Summary</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                <tr><td width="200" style="padding:3px 0;color:#888;">Order ID</td><td style="padding:3px 0;color:#1a1a2e;font-family:monospace;font-weight:700;">${shortId}</td></tr>
                <tr><td style="padding:3px 0;color:#888;">Items Subtotal</td><td style="padding:3px 0;color:#1a1a2e;">${totals.subtotal.toLocaleString()} EGP</td></tr>
                <tr><td style="padding:3px 0;color:#888;">Shipping Cost</td><td style="padding:3px 0;color:#1a1a2e;">${totals.shipping.toLocaleString()} EGP</td></tr>
                <tr><td style="padding:3px 0;color:#888;font-weight:700;">Total</td><td style="padding:3px 0;color:#1a1a2e;font-weight:700;">${totals.total.toLocaleString()} EGP</td></tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:16px 40px 28px;">
              <h3 style="margin:0 0 12px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Items (${(cartItems || []).length})</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr style="font-size:11px;color:#aaa;text-transform:uppercase;">
                  <td style="padding-bottom:4px;width:48px;"></td>
                  <td style="padding-bottom:4px;">Item</td>
                  <td style="padding-bottom:4px;text-align:right;">Price</td>
                </tr>
                ${itemsTable}
              </table>
            </td>
          </tr>

          <!-- Copyable Text Block -->
          <tr>
            <td style="padding:0 40px 36px;">
              <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Copy-paste summary</p>
              <div style="background:#f8f6f3;border-radius:8px;padding:16px;font-family:'SF Mono','Courier New',monospace;font-size:12px;color:#1a1a2e;line-height:1.7;white-space:pre-wrap;word-break:break-all;">
                ORDER: ${shortId}
                NAME: ${customerInfo.name}
                EMAIL: ${customerInfo.email}
                PHONE: ${customerInfo.phone}
                ADDRESS: ${customerInfo.building}/${customerInfo.apartment}, ${customerInfo.street}, ${customerInfo.city}, ${customerInfo.governorate}, Egypt
                TOTAL: ${totals.total.toLocaleString()} EGP
                ITEMS: ${(cartItems || []).map(i => i.title || i.name).filter(Boolean).join(", ")}
              </div>
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
