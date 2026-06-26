import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { calculateFedExShipping } from '@/lib/shipping';

export async function POST(req) {
  try {
    const { cart, customerInfo } = await req.json();

    if (!cart || cart.length === 0) {
      throw new Error('Cart is empty.');
    }

    const supabase = getServiceSupabase();
    if (!supabase) throw new Error('Server service key configuration missing.');

    const PAYMOB_SECRET = process.env.PAYMOB_SECRET_KEY;
    const PAYMOB_PUBLIC_KEY = process.env.PAYMOB_PUBLIC_KEY;

    if (!PAYMOB_SECRET || !PAYMOB_PUBLIC_KEY) {
      throw new Error('Paymob credentials missing from environment variables.');
    }

    const { totalShipping, billableWeight } = calculateFedExShipping(cart, customerInfo.governorate);
    const itemsTotal = cart.reduce((acc, item) => acc + Number(item.price), 0);

    const { data: pending, error: pendingErr } = await supabase
      .from('pending_checkouts')
      .insert({
        cart_items: cart,
        customer_info: customerInfo,
        total_items_cost: itemsTotal,
        shipping_cost: totalShipping,
        billable_weight: billableWeight,
      })
      .select()
      .single();

    if (pendingErr) throw pendingErr;

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

    const finalTotalAmount = itemsTotal + totalShipping;
    const totalAmountCents = Math.round(finalTotalAmount * 100);

    const intentionRes = await fetch('https://accept.paymob.com/v1/intention/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${PAYMOB_SECRET}`,
      },
      body: JSON.stringify({
        amount: totalAmountCents,
        currency: 'EGP',
        payment_methods: [5723260, 5723390],
        items: [
          ...cart.map((i) => {
            const name = String(i.title || '').trim() || 'Artwork';
            const details = [i.medium, i.size_full || i.size].filter(Boolean).join(' — ');
            return {
              name,
              description: details || undefined,
              amount: Math.round(Number(i.price) * 100),
              quantity: 1,
            };
          }),
          ...(totalShipping > 0 ? [{
            name: 'Shipping Fee',
            description: `FedEx delivery to ${customerInfo.governorate}`,
            amount: Math.round(totalShipping * 100),
            quantity: 1,
          }] : [])
        ],
        billing_data: billingData,
        customer: {
          first_name: billingData.first_name,
          last_name: billingData.last_name,
          email: billingData.email,
          phone_number: billingData.phone_number,
        },
        special_reference: String(pending.id),
        merchant_order_id: String(pending.id),
        redirection_url: `${req.nextUrl.origin}/checkout/success?checkout_id=${pending.id}`,
        notification_url: `${req.nextUrl.origin}/api/webhooks/paymob`
      }),
    });

    if (!intentionRes.ok) {
      const errorText = await intentionRes.text();
      throw new Error(`Paymob Intention Error (${intentionRes.status}): ${errorText}`);
    }

    const intentionData = await intentionRes.json();
    const { id: intentionId, client_secret: clientSecret } = intentionData;

    await supabase
      .from('pending_checkouts')
      .update({ paymob_intention_id: intentionId })
      .eq('id', pending.id);

    const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${PAYMOB_PUBLIC_KEY}&clientSecret=${clientSecret}`;
    return NextResponse.json({ success: true, redirectUrl: checkoutUrl });

  } catch (error) {
    console.error('Checkout error detail:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
