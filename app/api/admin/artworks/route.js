import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export async function GET() {
  const supabase = getServiceSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const { data, error } = await supabase.from('artworks').select('*, artwork_images(*)').is('deleted_at', null).order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request) {
  const supabase = getServiceSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const body = await request.json()

  // Resolve artist_id: use provided, find existing, or create blank profile
  let artistId = body.artist_id
  if (!artistId) {
    const { data: profiles } = await supabase.from('artist_profile').select('id')
    if (profiles && profiles.length > 0) {
      artistId = profiles[0].id
    }
  }
  if (!artistId) {
    const newId = uuid()
    await supabase.from('artist_profile').insert({ id: newId, name: '' })
    artistId = newId
  }

  // The artworks FK references artists(id), not artist_profile(id)
  // Ensure the artist ID exists in the artists table
  const { data: existingArtist } = await supabase.from('artists').select('id').eq('id', artistId).maybeSingle()
  if (!existingArtist) {
    await supabase.from('artists').insert({ id: artistId })
  }

  const artworkId = uuid()
  const { error } = await supabase.from('artworks').insert({
    id: artworkId, artist_id: artistId, title: body.title, year: body.year, medium: body.medium, width_cm: body.width_cm || null, height_cm: body.height_cm || null, depth_cm: body.depth_cm || null, description: body.description, price: body.price || 0, currency: body.currency || 'EGP', status: body.status || 'available', is_featured: body.is_featured || false, is_published: body.is_published !== undefined ? body.is_published : true, sort_order: body.sort_order || 0,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: artworkId })
}
