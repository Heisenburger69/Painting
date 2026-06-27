import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getServiceSupabase()
    if (!supabase) return NextResponse.json({ error: 'No Supabase client' }, { status: 500 })

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error

    if (!orders || orders.length === 0) return NextResponse.json([])

    const ids = orders.map(o => o.id)

    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', ids)
    if (itemsErr) throw itemsErr

    const artworkIds = [...new Set((items || []).map(i => i.artwork_id))]

    let artworkMap = {}
    if (artworkIds.length > 0) {
      const { data: artworks, error: artErr } = await supabase
        .from('artworks')
        .select('*, artwork_images(*)')
        .in('id', artworkIds)
      if (artErr) throw artErr
      for (const a of (artworks || [])) artworkMap[a.id] = a
    }

    const itemMap = {}
    for (const i of (items || [])) {
      if (!itemMap[i.order_id]) itemMap[i.order_id] = []
      itemMap[i.order_id].push({ ...i, artworks: artworkMap[i.artwork_id] || null })
    }

    const result = (orders || []).map(o => ({ ...o, order_items: itemMap[o.id] || [] }))

    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
