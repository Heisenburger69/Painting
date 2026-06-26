export function orderConfirmationHtml({
  customerName,
  orderId,
  customerInfo,
  cartItems,
  totals,
}) {
  const itemsHtml = (cartItems || [])
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; color: #3a3a3a;">
            ${escapeHtml(item.title || item.name || "Artwork")}
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; text-align: right; color: #3a3a3a;">
            ${Number(item.price).toLocaleString()} EGP
          </td>
        </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin:0; padding:0; background:#f4f2ee; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background: #1a1a2e; padding: 36px 40px; text-align: center;">
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:600; letter-spacing: 1px;">
                HALA SALAH
              </h1>
              <p style="margin:6px 0 0; color:#a8a8b3; font-size:13px;">
                Original Paintings & Fine Art
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 36px 40px 20px;">
              <h2 style="margin:0 0 4px; font-size:22px; color:#1a1a2e;">
                Thank you, ${escapeHtml(customerName)}!
              </h2>
              <p style="margin:0; color:#666; font-size:15px; line-height:1.5;">
                Your payment has been received successfully. Your order is now
                being processed and will be shipped to your address shortly.
              </p>
            </td>
          </tr>

          <!-- Order ID Box -->
          <tr>
            <td style="padding: 4px 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f3; border-radius:8px; border: 1px solid #e5e0d8;">
                <tr>
                  <td style="padding: 16px 24px; text-align: center;">
                    <p style="margin:0 0 6px; font-size:12px; color:#888; text-transform:uppercase; letter-spacing:1px;">
                      Order ID
                    </p>
                    <p style="margin:0; font-size:24px; font-weight:700; font-family: 'SF Mono', 'Courier New', monospace; letter-spacing:4px; color:#1a1a2e;">
                      ${orderId}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding: 0 40px 16px;">
              <h3 style="margin:0 0 12px; font-size:14px; color:#888; text-transform:uppercase; letter-spacing:1px;">
                Order Summary
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
                <tr>
                  <td style="padding: 8px 0; color:#888; font-size:14px;">Subtotal</td>
                  <td style="padding: 8px 0; text-align: right; color:#3a3a3a; font-size:14px;">
                    ${totals.subtotal.toLocaleString()} EGP
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color:#888; font-size:14px;">Shipping</td>
                  <td style="padding: 8px 0; text-align: right; color:#3a3a3a; font-size:14px;">
                    ${totals.shipping.toLocaleString()} EGP
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-top: 2px solid #1a1a2e; font-weight:700; color:#1a1a2e; font-size:16px;">
                    Total
                  </td>
                  <td style="padding: 12px 0; border-top: 2px solid #1a1a2e; text-align: right; font-weight:700; color:#1a1a2e; font-size:16px;">
                    ${totals.total.toLocaleString()} EGP
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Details -->
          <tr>
            <td style="padding: 16px 40px;">
              <h3 style="margin:0 0 12px; font-size:14px; color:#888; text-transform:uppercase; letter-spacing:1px;">
                Shipping Address
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="120" style="padding: 4px 0; color:#888; font-size:13px; vertical-align:top;">Name</td>
                  <td style="padding: 4px 0; color:#3a3a3a; font-size:13px;">
                    ${escapeHtml(customerInfo.name)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color:#888; font-size:13px; vertical-align:top;">Email</td>
                  <td style="padding: 4px 0; color:#3a3a3a; font-size:13px;">
                    ${escapeHtml(customerInfo.email)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color:#888; font-size:13px; vertical-align:top;">Phone</td>
                  <td style="padding: 4px 0; color:#3a3a3a; font-size:13px;">
                    ${escapeHtml(customerInfo.phone)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color:#888; font-size:13px; vertical-align:top;">Address</td>
                  <td style="padding: 4px 0; color:#3a3a3a; font-size:13px;">
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
          <tr>
            <td style="padding: 8px 40px;">
              <div style="height:1px; background:#e5e0d8;"></div>
            </td>
          </tr>

          <!-- Contact Footer -->
          <tr>
            <td style="padding: 20px 40px 36px; text-align: center;">
              <p style="margin:0 0 4px; font-size:13px; color:#888;">
                For any inquiries, feel free to contact us
              </p>
              <p style="margin:0 0 2px; font-size:14px; color:#1a1a2e;">
                <a href="mailto:halasalah378@gmail.com" style="color:#1a1a2e; text-decoration:none;">
                  halasalah378@gmail.com
                </a>
              </p>
              <p style="margin:0; font-size:14px; color:#1a1a2e;">
                01065390365
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
