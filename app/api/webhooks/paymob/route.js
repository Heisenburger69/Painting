import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import crypto from 'crypto';
import { sendOrderConfirmation } from '@/lib/email/send-order-confirmation';

function generateVerificationCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const supabase = getServiceSupabase();
    if (!supabase) return NextResponse.json({ error: 'Database instance missing' }, { status: 500 });

    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (hmacSecret) {
      const calculatedHmac = crypto.createHmac('sha512', hmacSecret).update(rawBody).digest('hex');
      const receivedHmac = body.hmac;
      if (!receivedHmac || calculatedHmac !== receivedHmac) {
        console.error('HMAC verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const transactionObj = body.obj || body;
    const isSuccess = transactionObj.success === true || transactionObj.success === "true";
    const merchantOrderId = transactionObj.merchant_order_id || transactionObj.order?.merchant_order_id || transactionObj.special_reference;

    if (!merchantOrderId) {
      return NextResponse.json({ received: true, message: 'No merchant order tied' });
    }

    if (!isSuccess) {
      return NextResponse.json({ received: true, message: 'Transaction not successful' });
    }

    const { data: pending, error: pendingErr } = await supabase
      .from('pending_checkouts')
      .select('*')
      .eq('id', merchantOrderId)
      .maybeSingle();

    if (pendingErr) throw pendingErr;
    if (!pending) {
      return NextResponse.json({ received: true, message: 'Pending checkout already processed or not found' });
    }

    const verificationCode = generateVerificationCode();
    const customerInfo = pending.customer_info;

    const orderPayload = {
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
      shipping_cost: pending.shipping_cost,
      subtotal: pending.total_items_cost,
      total_items_cost: pending.total_items_cost,
      total: Number(pending.total_items_cost) + Number(pending.shipping_cost),
      calculated_weight: pending.billable_weight,
      currency: 'EGP',
      status: 'paid',
      verification_code: verificationCode,
      pending_checkout_id: pending.id,
      paymob_order_id: pending.paymob_intention_id,
    };

    let { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderErr && orderErr.message?.includes('column')) {
      delete orderPayload.verification_code;
      delete orderPayload.pending_checkout_id;
      const { data: fb, error: fbErr } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();
      if (fbErr) throw fbErr;
      order = fb;
      await supabase.from('orders').update({ verification_code: verificationCode }).eq('id', order.id);
    } else if (orderErr) {
      throw orderErr;
    }

    await supabase.from('order_items').insert(
      (pending.cart_items || []).map((item) => ({ order_id: order.id, artwork_id: item.id, price: item.price }))
    );

    const artworkIds = (pending.cart_items || []).map(item => item.id).filter(Boolean);
    if (artworkIds.length > 0) {
      await supabase
        .from('artworks')
        .update({ status: 'sold' })
        .in('id', artworkIds);
    }

    await supabase.from('pending_checkouts').delete().eq('id', pending.id);

    console.log(`Order ${order.id} created from webhook, verification code: ${verificationCode}`);

    sendOrderConfirmation({
      orderId: order.id,
      customerInfo,
      cartItems: pending.cart_items || [],
      totals: {
        subtotal: pending.total_items_cost,
        shipping: pending.shipping_cost,
        total: Number(pending.total_items_cost) + Number(pending.shipping_cost),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook payload parsing error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
