import { NextResponse } from 'next/server'
import { getAuthSupabase, unauthorized } from '@/lib/admin-auth'

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export async function GET(request) {
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()
  const { data, error } = await supabase.from('collections').select('*, artworks(*, artwork_images(*))').order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request) {
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()
  const body = await request.json()

  const collectionId = body.id && body.id !== 'undefined' && body.id !== 'null' ? body.id : uuid()

  const { error } = await supabase.from('collections').upsert({
    id: collectionId,
    title: body.title,
    description: body.description || '',
    cover_image: body.cover_image || '',
    accent_color: body.accent_color || '#3B82F6',
    sort_order: body.sort_order || 0,
    is_published: body.is_published !== undefined ? body.is_published : true,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: collectionId })
}
