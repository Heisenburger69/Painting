import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutId = searchParams.get('checkout_id');

    if (!checkoutId) {
      return NextResponse.json({ found: false, error: 'Missing checkout_id' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

    const { data, error } = await supabase
      .from('orders')
      .select('id, verification_code, status')
      .eq('pending_checkout_id', checkoutId)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return NextResponse.json({ found: true, order: data });
    }

    return NextResponse.json({ found: false });
  } catch (error) {
    console.error('Lookup error:', error.message);
    return NextResponse.json({ found: false, error: error.message }, { status: 500 });
  }
}
