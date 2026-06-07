import { NextResponse } from 'next/server'
import { getAuthSupabase, unauthorized } from '@/lib/admin-auth'

export async function GET(request, { params }) {
  const { id } = await params
  if (!id || id === 'undefined' || id === 'null') {
    return NextResponse.json({ error: 'Invalid collection ID' }, { status: 400 })
  }
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()
  const { data, error } = await supabase.from('collections').select('*, artworks(*, artwork_images(*))').eq('id', id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request, { params }) {
  const { id } = await params
  if (!id || id === 'undefined' || id === 'null') {
    return NextResponse.json({ error: 'Invalid collection ID' }, { status: 400 })
  }
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()
  const body = await request.json()
  const { error } = await supabase.from('collections').update({
    title: body.title,
    description: body.description,
    cover_image: body.cover_image,
    sort_order: body.sort_order,
    is_published: body.is_published,
  }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request, { params }) {
  const { id } = await params
  if (!id || id === 'undefined' || id === 'null') {
    return NextResponse.json({ error: 'Invalid collection ID' }, { status: 400 })
  }
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()
  const { error } = await supabase.from('collections').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
