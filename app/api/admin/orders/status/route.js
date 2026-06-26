import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { sendOrderStatusUpdate } from '@/lib/email/send-order-status-update';

export async function POST(req) {
  try {
    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: order } = await supabase
      .from('orders')
      .select('id, buyer_name, buyer_email, status')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = order.status;

    const { error: updateErr } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (updateErr) throw updateErr;

    await sendOrderStatusUpdate({
      orderId,
      customerName: order.buyer_name,
      customerEmail: order.buyer_email,
      newStatus: status,
      oldStatus,
    });

    return NextResponse.json({ success: true, oldStatus });
  } catch (error) {
    console.error('Order status update error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
