import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const body = await req.json();
    const supabase = getServiceSupabase();
    if (!supabase) return NextResponse.json({ error: 'Database instance missing' }, { status: 500 });

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
