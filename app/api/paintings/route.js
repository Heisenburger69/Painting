import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('artworks')
    .select('*, artwork_images(*)')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request) {
  const supabase = getServiceSupabase()
  const body = await request.json()

  const { data, error } = await supabase
    .from('artworks')
    .insert({
      title: body.title,
      year: body.year,
      medium: body.medium,
      width_cm: body.width_cm,
      height_cm: body.height_cm,
      depth_cm: body.depth_cm,
      description: body.description,
      price: body.price,
      currency: body.currency || 'EGP',
      status: body.status || 'available',
      is_featured: body.is_featured || false,
      is_published: body.is_published !== undefined ? body.is_published : true,
      sort_order: body.sort_order || 0,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
