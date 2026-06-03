import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function PUT(request, { params }) {
  const supabase = getServiceSupabase()
  const body = await request.json()

  const payload = {
    title: body.title,
    year: body.year,
    medium: body.medium,
    width_cm: body.width_cm,
    height_cm: body.height_cm,
    depth_cm: body.depth_cm,
    description: body.description,
    price: body.price,
    currency: body.currency,
    status: body.status,
    is_featured: body.is_featured,
    is_published: body.is_published,
    sort_order: body.sort_order,
  }
  Object.keys(payload).forEach((k) => { if (payload[k] === undefined) delete payload[k] })

  const { data, error } = await supabase.from('artworks').update(payload).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_request, { params }) {
  const supabase = getServiceSupabase()
  const { error } = await supabase
    .from('artworks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
