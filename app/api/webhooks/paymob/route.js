import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import crypto from 'crypto';

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
    const merchantOrderId = transactionObj.merchant_order_id;

    if (!merchantOrderId) {
      return NextResponse.json({ received: true, message: 'No merchant order tied' });
    }

    if (isSuccess) {
      const { data: updatedOrder, error: orderErr } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', merchantOrderId)
        .select()
        .single();

      if (orderErr) throw orderErr;

      const { data: items, error: itemsErr } = await supabase
        .from('order_items')
        .select('artwork_id')
        .eq('order_id', merchantOrderId);

      if (itemsErr) throw itemsErr;

      if (items && items.length > 0) {
        const artworkIds = items.map(item => item.artwork_id);

        await supabase
          .from('artworks')
          .update({ status: 'sold' })
          .in('id', artworkIds);
      }

      console.log(`Order ${merchantOrderId} finalized and artworks set to sold.`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook payload parsing error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
