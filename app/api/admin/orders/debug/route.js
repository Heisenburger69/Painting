import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('order_id')

  const supabase = getServiceSupabase()
  if (!supabase) return NextResponse.json({ error: 'No Supabase client' }, { status: 500 })

  const result = {}

  const { data: allItems, error: allItemsErr } = await supabase.from('order_items').select('*').limit(20)
  result.order_items_table = { data: allItems, count: allItems?.length || 0, error: allItemsErr?.message }

  const { data: allOrders } = await supabase.from('orders').select('id, status').limit(20)
  result.orders = { count: allOrders?.length || 0, statuses: allOrders?.map(o => o.status) }

  const { data: sampleArtwork } = await supabase.from('artworks').select('id, title').limit(1).maybeSingle()
  result.sample_artwork = sampleArtwork

  if (allOrders?.length > 0 && sampleArtwork) {
    const testOrderId = allOrders[0].id
    const testArtworkId = sampleArtwork.id

    const { data: testInsert, error: testInsertErr } = await supabase
      .from('order_items')
      .insert({ order_id: testOrderId, artwork_id: testArtworkId, price: 1, title: sampleArtwork.title || 'Test' })
      .select()
      .maybeSingle()

    result.test_insert = { data: testInsert, error: testInsertErr?.message, errCode: testInsertErr?.code }

    if (!testInsertErr) {
      await supabase.from('order_items').delete().eq('id', testInsert.id)
      result.test_insert.cleanup = 'deleted'
    }
  } else {
    result.test_insert = 'SKIPPED - no orders or artworks'
  }

  if (allOrders?.length > 0 && orderId) {
    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle()
    result.single_order = order
  }

  return NextResponse.json(result)
}
