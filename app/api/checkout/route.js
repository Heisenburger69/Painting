import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { calculateFedExShipping } from '@/lib/shipping';

export async function POST(req) {
  try {
    const { cart, customerInfo } = await req.json();
    const supabase = getServiceSupabase();
    if (!supabase) throw new Error("Server service key configuration missing.");

    // 1. Securely recalculate financial and shipping parameters on the server
    const { totalShipping, billableWeight } = calculateFedExShipping(cart, customerInfo.governorate);
    const itemsTotal = cart.reduce((acc, item) => acc + Number(item.price), 0);
    const finalTotalAmount = itemsTotal + totalShipping;
    const totalAmountCents = finalTotalAmount * 100; // Paymob requires amount in cents

    // Create a fallback JSON address block to satisfy the database constraint
    const fullShippingJSON = {
      governorate: customerInfo.governorate,
      city: customerInfo.city,
      street: customerInfo.street,
      building: customerInfo.building,
      apartment: customerInfo.apartment,
      phone: customerInfo.phone
    };

    // 2. Create the pending order record using your exact column names
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        buyer_name: customerInfo.name,
        buyer_email: customerInfo.email,
        shipping_address: fullShippingJSON,     // Bundled object to satisfy NOT-NULL constraint
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

    // 3. Insert individual items linked to this specific order reference
    const orderItemsPayload = cart.map((item) => ({
      order_id: order.id,
      artwork_id: item.id,
      price: item.price
    }));
    await supabase.from('order_items').insert(orderItemsPayload);

    // 4. PAYMOB INTEGRATION & FALLBACK HANDLING
    const PAYMOB_SECRET = process.env.PAYMOB_SECRET_KEY;
    const CARD_INTEGRATION = process.env.NEXT_PUBLIC_PAYMOB_INTEGRATION_ID_CARD;

    if (!PAYMOB_SECRET || PAYMOB_SECRET === "mock_secret_key_for_testing" || !CARD_INTEGRATION) {
      return NextResponse.json({ 
        success: true, 
        redirectUrl: `/checkout/mock-success?orderId=${order.id}` 
      });
    }

    const paymobRes = await fetch('https://api.paymob.com/v1/intention/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${PAYMOB_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: totalAmountCents,
        currency: "EGP",
        payment_methods: [Number(CARD_INTEGRATION)],
        items: cart.map(i => ({ name: i.title, amount: i.price * 100, quantity: 1 })),
        billing_data: {
          first_name: customerInfo.name.split(' ')[0] || "Guest",
          last_name: customerInfo.name.split(' ')[1] || "Customer",
          phone_number: customerInfo.phone,
          email: customerInfo.email,
          country: "EG",
          governorate: customerInfo.governorate,
          city: customerInfo.city,
          street: customerInfo.street
        },
        extras: { internal_order_id: order.id }
      })
    });

    const paymobData = await paymobRes.json();

    if (!paymobData.client_secret) {
      throw new Error(paymobData.message || "Failed to generate Paymob client secret.");
    }

    await supabase.from('orders').update({ paymob_order_id: paymobData.id }).eq('id', order.id);

    const checkoutUrl = `https://checkout.paymob.com/unifiedcheckout/?client_secret=${paymobData.client_secret}`;
    return NextResponse.json({ success: true, redirectUrl: checkoutUrl });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
