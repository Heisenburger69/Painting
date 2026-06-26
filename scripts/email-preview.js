import { orderConfirmationHtml } from '../lib/email/templates/order-confirmation.js';
import fs from 'fs';
import path from 'path';

const preview = orderConfirmationHtml({
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
  orderId: "67a3c1d9-e2b4-4f8c-b7f6",
  cartItems: [
    { title: "Sunset Over Cairo — Oil on Canvas", price: "4500" },
    { title: "Nile Reflections — Watercolor", price: "2200" },
  ],
  totals: {
    subtotal: 6700,
    shipping: 185,
    total: 6885,
  },
});

const outPath = path.resolve('email-preview.html');
fs.writeFileSync(outPath, preview);
console.log(`Preview written to ${outPath}`);
