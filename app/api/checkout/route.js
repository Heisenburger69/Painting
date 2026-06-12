import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { calculateFedExShipping } from '@/lib/shipping';

export async function POST(req) {
  try {
    const { cart, customerInfo } = await req.json();
    const supabase = getServiceSupabase();
    if (!supabase) throw new Error('Server service key configuration missing.');

    // ── Env vars ──
    const PAYMOB_SECRET = process.env.PAYMOB_SECRET_KEY;
    const PAYMOB_PUBLIC_KEY = process.env.PAYMOB_PUBLIC_KEY;
    if (!PAYMOB_SECRET || !PAYMOB_PUBLIC_KEY) {
      throw new Error('Paymob credentials missing from environment.');
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
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    await supabase.from('order_items').insert(
      cart.map((item) => ({ order_id: order.id, artwork_id: item.id, price: item.price }))
    );

    // ── Build billing data ──
    const nameParts = (customerInfo.name || '').trim().split(' ');
    const billingData = {
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
      postal_code: 'NA',
    };

    // ── Paymob: Create Intention (Unified Checkout) ──
    const intentionRes = await fetch('https://accept.paymob.com/api/v1/intention', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${PAYMOB_SECRET}`,
      },
      body: JSON.stringify({
        amount: totalAmountCents,
        currency: 'EGP',
        payment_methods: [5723390],
        items: cart.map((i) => ({
          name: i.title || 'Artwork',
          amount: Math.round(i.price * 100),
          quantity: 1,
        })),
        billing_data: billingData,
        customer: {
          first_name: billingData.first_name,
          last_name: billingData.last_name,
          email: billingData.email,
          phone_number: billingData.phone_number,
        },
        merchant_order_id: order.id,
      }),
    });

    if (!intentionRes.ok) {
      const errorData = await intentionRes.json();
      throw new Error(`Paymob intention creation failed: ${errorData.message || 'Unknown error'}`);
    }

    const intentionData = await intentionRes.json();
    const { id: intentionId, client_secret: clientSecret } = intentionData;

    // ── Store intention data in Supabase ──
    await supabase
      .from('orders')
      .update({ paymob_order_id: intentionId, paymob_client_secret: clientSecret })
      .eq('id', order.id);

    // ── Build Unified Checkout URL ──
    const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${PAYMOB_PUBLIC_KEY}&clientSecret=${clientSecret}`;

    return NextResponse.json({ success: true, redirectUrl: checkoutUrl });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
