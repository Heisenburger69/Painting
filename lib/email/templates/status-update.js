function shortenId(id) {
  return (id || "").slice(0, 8).toUpperCase();
}

export function statusUpdateHtml({ customerName, orderId, newStatus, oldStatus }) {
  const shortId = shortenId(orderId);

  const statusColors = {
    paid: "#10b981",
    "still packaging": "#f59e0b",
    "sent to shipping": "#3b82f6",
    completed: "#10b981",
    cancelled: "#ef4444",
  };
  const color = statusColors[newStatus] || "#888";

  const messages = {
    paid: "Your payment has been confirmed and we're preparing your artwork.",
    "still packaging": "Your artwork is being carefully packed to ensure it arrives safely.",
    "sent to shipping": "Your order has been handed to the shipping carrier and is on its way!",
    completed: "Your order has been delivered. We hope you love your artwork!",
    cancelled: "Your order has been cancelled. If you have any questions, please contact us.",
  };
  const message = messages[newStatus] || "Your order status has been updated.";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Update — ${shortId}</title>
</head>
<body style="margin:0;padding:0;background:#f4f2ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:18px;font-weight:600;letter-spacing:1px;">HALA SALAH</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 0;">
              <h2 style="margin:0 0 4px;font-size:20px;color:#1a1a2e;">
                Hi ${escapeHtml(customerName || "there")},
              </h2>
              <p style="margin:0;color:#666;font-size:15px;line-height:1.6;">
                Your order status has been updated.
              </p>
            </td>
          </tr>

          <!-- Status Badge -->
          <tr>
            <td style="padding:20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:${color}15;border-radius:8px;border:1px solid ${color}30;">
                <tr>
                  <td style="padding:16px 24px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Current Status</p>
                    <p style="margin:0;font-size:22px;font-weight:700;color:${color};">
                      ${newStatus.toUpperCase()}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:0 40px 8px;">
              <p style="margin:0;color:#3a3a3a;font-size:15px;line-height:1.6;text-align:center;">
                ${message}
              </p>
            </td>
          </tr>

          <!-- Order ID -->
          <tr>
            <td style="padding:16px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f3;border-radius:6px;border:1px solid #e5e0d8;">
                <tr>
                  <td style="padding:12px 20px;text-align:center;">
                    <p style="margin:0 0 2px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Order ID</p>
                    <p style="margin:0;font-size:18px;font-weight:700;font-family:'SF Mono','Courier New',monospace;letter-spacing:4px;color:#1a1a2e;">${shortId}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:8px 40px 36px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#888;">
                Questions? Contact us
              </p>
              <p style="margin:0;">
                <a href="mailto:halasalah378@gmail.com?subject=Order%20${shortId}" style="color:#1a1a2e;font-size:13px;">halasalah378@gmail.com</a>
                &nbsp;|&nbsp;
                <a href="https://wa.me/201065390365?text=Order%20${shortId}" target="_blank" style="color:#1a1a2e;font-size:13px;">01065390365</a>
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
