import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const body = await req.json();
    const supabase = getServiceSupabase();

    const isSuccess = body.obj?.success === true;
    const internalOrderId = body.obj?.intention?.extras?.internal_order_id;

    if (isSuccess && internalOrderId) {
      await supabase
        .from('orders')
        .update({ status: 'paid', payment_method: body.obj?.payment_key_data?.payment_method || 'unknown' })
        .eq('id', internalOrderId);

      const { data: items } = await supabase
        .from('order_items')
        .select('artwork_id')
        .eq('order_id', internalOrderId);

      if (items && items.length > 0) {
        const artworkIds = items.map(i => i.artwork_id);

        await supabase
          .from('artworks')
          .update({ status: 'sold' })
          .in('id', artworkIds);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
