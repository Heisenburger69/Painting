import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { calculateFedExShipping } from '@/lib/shipping';

// ─── Paymob Integration Config ───────────────────────────────────────────────
const INTEGRATION_MAP = {
  card: {
    id: Number(process.env.PAYMOB_INTEGRATION_ID_CARD),
    iframeId: process.env.PAYMOB_IFRAME_ID_CARD,
  },
  kiosk: {
    id: Number(process.env.PAYMOB_INTEGRATION_ID_KIOSK),
    iframeId: null,
  },
};

// ─── Billing Data Builders ───────────────────────────────────────────────────
function buildCardBillingData(customerInfo) {
  const nameParts = (customerInfo.name || '').trim().split(' ');
  return {
    first_name: nameParts[0] || 'Guest',
    last_name: nameParts.slice(1).join(' ') || 'Customer',
    phone_number: customerInfo.phone || '+201001234567',
    email: customerInfo.email || 'guest@example.com',
    country: 'EG',
    state: customerInfo.governorate || 'Cairo',
    city: customerInfo.city || 'Cairo',
    street: customerInfo.street || 'NA',
    building: customerInfo.building || '1',
    floor: '1',
    apartment: customerInfo.apartment || '1',
    shipping_method: 'PKG',
    postal_code: 'NA',
  };
}

function buildKioskBillingData(customerInfo) {
  const phone = (customerInfo.phone || '01001234567').replace(/^\+20/, '0');
  const nameParts = (customerInfo.name || '').trim().split(' ');
  return {
    first_name: nameParts[0] || 'Guest',
    last_name: nameParts.slice(1).join(' ') || 'Customer',
    phone_number: phone,
    email: customerInfo.email || 'guest@example.com',
    country: 'EG',
    state: customerInfo.governorate || 'Cairo',
    city: customerInfo.city || 'Cairo',
    street: customerInfo.street || 'NA',
    building: customerInfo.building || '1',
    floor: '1',
    apartment: customerInfo.apartment || '1',
    shipping_method: 'PKG',
    postal_code: 'NA',
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const { cart, customerInfo, paymentType = 'card' } = await req.json();
    const supabase = getServiceSupabase();
    if (!supabase) throw new Error('Server service key configuration missing.');

    // ── Validate integration selection ──
    const integration = INTEGRATION_MAP[paymentType];
    if (!integration || !integration.id || isNaN(integration.id)) {
      throw new Error(`Unsupported or misconfigured payment type: ${paymentType}`);
    }

    // ── Calculate totals ──
    const { totalShipping, billableWeight } = calculateFedExShipping(cart, customerInfo.governorate);
    const itemsTotal = cart.reduce((acc, item) => acc + Number(item.price), 0);
    const finalTotalAmount = itemsTotal + totalShipping;
    const totalAmountCents = Math.round(finalTotalAmount * 100);

    // ── Create Supabase order ──
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        buyer_name: customerInfo.name,
        buyer_email: customerInfo.email,
        shipping_address: {
          governorate: customerInfo.governorate,
          city: customerInfo.city,
          street: customerInfo.street,
          building: customerInfo.building,
          apartment: customerInfo.apartment,
          phone: customerInfo.phone,
        },
        customer_governorate: customerInfo.governorate,
        customer_city: customerInfo.city,
        street_address: customerInfo.street,
        building_number: customerInfo.building,
        apartment_number: customerInfo.apartment,
        shipping_cost: totalShipping,
        subtotal: itemsTotal,
        total_items_cost: itemsTotal,
        total: finalTotalAmount,
        calculated_weight: billableWeight,
        currency: 'EGP',
        status: 'pending',
        payment_method: paymentType,
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    await supabase.from('order_items').insert(
      cart.map((item) => ({ order_id: order.id, artwork_id: item.id, price: item.price }))
    );

    // ── Paymob: Step 1 — Auth ──
    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PAYMOB_SECRET_KEY }),
    });
    if (!authRes.ok) throw new Error('Paymob auth token retrieval failed.');
    const { token: authToken } = await authRes.json();

    // ── Paymob: Step 2 — Create Order ──
    const paymobOrderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: 'false',
        amount_cents: totalAmountCents,
        currency: 'EGP',
        merchant_order_id: order.id,
        items: cart.map((i) => ({
          name: i.title || 'Artwork',
          amount_cents: Math.round(i.price * 100),
          quantity: 1,
        })),
      }),
    });
    if (!paymobOrderRes.ok) throw new Error('Paymob order reference generation failed.');
    const paymobOrderData = await paymobOrderRes.json();

    // ── Paymob: Step 3 — Payment Key ──
    const billingData =
      paymentType === 'kiosk'
        ? buildKioskBillingData(customerInfo)
        : buildCardBillingData(customerInfo);

    const paymentKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: totalAmountCents,
        expiration: 3600,
        order_id: paymobOrderData.id,
        billing_data: billingData,
        currency: 'EGP',
        integration_id: integration.id,
      }),
    });
    if (!paymentKeyRes.ok) throw new Error('Paymob secure key token allocation failed.');
    const paymentKeyData = await paymentKeyRes.json();

    // ── Update Supabase order with Paymob order ID ──
    await supabase
      .from('orders')
      .update({ paymob_order_id: paymobOrderData.id })
      .eq('id', order.id);

    // ── Step 4 — Build response by payment type ──
    if (paymentType === 'kiosk') {
      const billRef = paymentKeyData?.id || paymentKeyData?.bill_reference || null;
      return NextResponse.json({ success: true, paymentType: 'kiosk', billReference: billRef });
    }

    const iframeId = integration.iframeId;
    if (!iframeId) throw new Error('Paymob iFrame ID missing for card integration.');
    const checkoutUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKeyData.token}`;
    return NextResponse.json({ success: true, paymentType: 'card', redirectUrl: checkoutUrl });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
