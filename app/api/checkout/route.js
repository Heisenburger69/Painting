import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { calculateFedExShipping } from '@/lib/shipping';

export async function POST(req) {
  try {
    const { cart, customerInfo } = await req.json();
    const supabase = getServiceSupabase();
    if (!supabase) throw new Error("Server service key configuration missing.");

    const { totalShipping, billableWeight } = calculateFedExShipping(cart, customerInfo.governorate);
    const itemsTotal = cart.reduce((acc, item) => acc + Number(item.price), 0);
    const finalTotalAmount = itemsTotal + totalShipping;
    const totalAmountCents = Math.round(finalTotalAmount * 100);

    const fullShippingJSON = {
      governorate: customerInfo.governorate,
      city: customerInfo.city,
      street: customerInfo.street,
      building: customerInfo.building,
      apartment: customerInfo.apartment,
      phone: customerInfo.phone
    };

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        buyer_name: customerInfo.name,
        buyer_email: customerInfo.email,
        shipping_address: fullShippingJSON,
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
        status: 'pending'
      })
      .select().single();

    if (orderErr) throw orderErr;

    const orderItemsPayload = cart.map((item) => ({
      order_id: order.id,
      artwork_id: item.id,
      price: item.price
    }));
    await supabase.from('order_items').insert(orderItemsPayload);

    const PAYMOB_SECRET = process.env.PAYMOB_SECRET_KEY;
    const CARD_INTEGRATION = process.env.NEXT_PUBLIC_PAYMOB_INTEGRATION_ID_CARD;

    if (!PAYMOB_SECRET || PAYMOB_SECRET === "mock_secret_key_for_testing" || !CARD_INTEGRATION) {
      return NextResponse.json({ 
        success: true, 
        redirectUrl: `/checkout/mock-success?orderId=${order.id}` 
      });
    }

    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: PAYMOB_SECRET })
    });
    
    if (!authRes.ok) throw new Error("Paymob Auth Token retrieval failed.");
    const { token: authToken } = await authRes.json();

    const paymobOrderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: "false",
        amount_cents: totalAmountCents,
        currency: "EGP",
        merchant_order_id: order.id,
        items: cart.map(i => ({ name: i.title, amount_cents: Math.round(i.price * 100), quantity: 1 }))
      })
    });

    if (!paymobOrderRes.ok) throw new Error("Paymob order reference generation failed.");
    const paymobOrderData = await paymobOrderRes.json();

    const paymentKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: totalAmountCents,
        expiration: 3600,
        order_id: paymobOrderData.id,
        billing_data: {
          first_name: customerInfo.name ? (customerInfo.name.split(' ')[0] || "Guest") : "Guest",
          last_name: customerInfo.name ? (customerInfo.name.split(' ')[1] || "Customer") : "Customer",
          phone_number: customerInfo.phone && customerInfo.phone.trim() !== "" ? customerInfo.phone : "+201001234567",
          email: customerInfo.email && customerInfo.email.trim() !== "" ? customerInfo.email : "test@example.com",
          country: "EG",
          governorate: customerInfo.governorate && customerInfo.governorate.trim() !== "" ? customerInfo.governorate : "Cairo",
          city: customerInfo.city && customerInfo.city.trim() !== "" ? customerInfo.city : "Nasr City",
          street: customerInfo.street && customerInfo.street.trim() !== "" ? customerInfo.street : "Building Street",
          building: customerInfo.building && customerInfo.building.trim() !== "" ? customerInfo.building : "1",
          room: "N/A",
          floor: "N/A",
          postal_code: "12345"
        },
        currency: "EGP",
        integration_id: Number(CARD_INTEGRATION)
      })
    });

    if (!paymentKeyRes.ok) throw new Error("Paymob secure key token allocation failed.");
    const { token: paymentToken } = await paymentKeyRes.json();

    await supabase.from('orders').update({ paymob_order_id: paymobOrderData.id }).eq('id', order.id);

    const checkoutUrl = `https://accept.paymobsolutions.com/api/acceptance/iframes/v1/?payment_token=${paymentToken}`;
    return NextResponse.json({ success: true, redirectUrl: checkoutUrl });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
