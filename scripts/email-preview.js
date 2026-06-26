import { orderConfirmationHtml } from '../lib/email/templates/order-confirmation.js';
import { adminNotificationHtml } from '../lib/email/templates/admin-notification.js';
import { statusUpdateHtml } from '../lib/email/templates/status-update.js';
import fs from 'fs';

const sample = {
  customerName: "Youssef Ahmed",
  customerInfo: {
    name: "Youssef Ahmed",
    email: "youssef@example.com",
    phone: "+20 100 123 4567",
    governorate: "cairo",
    city: "Nasr City",
    street: "Abbas El-Akkad St.",
    building: "15",
    apartment: "302",
  },
  orderId: "67a3c1d9-e2b4-4f8c-b7f6-a1b2c3d4e5f6",
  cartItems: [
    { title: "Sunset Over Cairo — Oil on Canvas", price: 4500, image: "https://picsum.photos/seed/art1/200/200" },
    { title: "Nile Reflections — Watercolor", price: 2200, image: "https://picsum.photos/seed/art2/200/200" },
  ],
  totals: { subtotal: 6700, shipping: 185, total: 6885 },
};

const customer = orderConfirmationHtml(sample);
const admin = adminNotificationHtml(sample);
const status = statusUpdateHtml({ customerName: "Youssef Ahmed", orderId: sample.orderId, newStatus: "sent to shipping", oldStatus: "still packaging" });

fs.writeFileSync("preview-customer.html", customer);
fs.writeFileSync("preview-admin.html", admin);
fs.writeFileSync("preview-status.html", status);
console.log("Previews written: preview-customer.html, preview-admin.html, preview-status.html");
