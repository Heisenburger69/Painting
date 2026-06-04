import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { uuid, isValidUUID, resolveArtistId } from '@/lib/artist'

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

  const debug = { step: 'start', bodyArtistId: body.artist_id, bodyArtistIdType: typeof body.artist_id }

  const artistId = await resolveArtistId(supabase, body)
  debug.finalArtistId = artistId

  if (!artistId) return NextResponse.json({ error: 'Could not resolve artist_id', debug }, { status: 500 })

  // The artworks FK references artists(id), not artist_profile(id)
  const { data: existingArtist } = await supabase.from('artists').select('id').eq('id', artistId).maybeSingle()
  if (!existingArtist) {
    const { error: syncErr } = await supabase.from('artists').insert({ id: artistId })
    if (syncErr) return NextResponse.json({ error: 'Sync to artists table failed', debug: { ...debug, syncErr: syncErr.message } }, { status: 500 })
  }

  const artworkId = uuid()
  const { error } = await supabase.from('artworks').insert({
    id: artworkId, artist_id: artistId, title: body.title, year: body.year, medium: body.medium, width_cm: body.width_cm || null, height_cm: body.height_cm || null, depth_cm: body.depth_cm || null, description: body.description, price: body.price || 0, currency: body.currency || 'EGP', status: body.status || 'available', is_featured: body.is_featured || false, is_published: body.is_published !== undefined ? body.is_published : true, sort_order: body.sort_order || 0,
  })
  if (error) return NextResponse.json({ error: error.message, debug }, { status: 500 })
  return NextResponse.json({ id: artworkId })
}
