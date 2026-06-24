import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

function generateVerificationCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutId = searchParams.get('checkout_id');
    const success = searchParams.get('success');

    if (!checkoutId || success !== 'true') {
      return NextResponse.json({ confirmed: false, error: 'Invalid params' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

    const existing = await supabase
      .from('orders')
      .select('id, verification_code, status')
      .eq('pending_checkout_id', checkoutId)
      .maybeSingle();

    if (existing.data) {
      return NextResponse.json({ confirmed: true, order: existing.data });
    }

    const { data: pending, error: pendingErr } = await supabase
      .from('pending_checkouts')
      .select('*')
      .eq('id', checkoutId)
      .maybeSingle();

    if (pendingErr) throw pendingErr;
    if (!pending) {
      return NextResponse.json({ confirmed: false, error: 'Pending checkout not found' }, { status: 404 });
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

    return NextResponse.json({ confirmed: true, order: { id: order.id, verification_code: verificationCode, status: 'paid' } });

  } catch (error) {
    console.error('Confirm checkout error:', error.message);
    return NextResponse.json({ confirmed: false, error: error.message }, { status: 500 });
  }
}
