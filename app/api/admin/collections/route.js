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

  let artistId = body.artist_id
  if (artistId === 'undefined' || artistId === 'null' || artistId === '') artistId = null
  if (!artistId) {
    const { data: profiles } = await supabase.from('artist_profile').select('id')
    if (profiles && profiles.length > 0) artistId = profiles[0].id
  }
  if (!artistId) return NextResponse.json({ error: 'Could not resolve artist' }, { status: 500 })

  const collectionId = body.id && body.id !== 'undefined' && body.id !== 'null' ? body.id : uuid()

  const { error } = await supabase.from('collections').upsert({
    id: collectionId,
    artist_id: artistId,
    title: body.title,
    description: body.description || '',
    cover_image: body.cover_image || '',
    sort_order: body.sort_order || 0,
    is_published: body.is_published !== undefined ? body.is_published : true,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: collectionId })
}
