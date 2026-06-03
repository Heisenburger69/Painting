import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { resolveArtistId } from '@/lib/artist'

export async function GET() {
  const supabase = getServiceSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const { data, error } = await supabase.from('exhibitions').select('*').order('start_date', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request) {
  const supabase = getServiceSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const body = await request.json()

  const artistId = await resolveArtistId(supabase, body)
  if (!artistId) return NextResponse.json({ error: 'Could not resolve artist_id' }, { status: 500 })

  const { error } = await supabase.from('exhibitions').insert({
    artist_id: artistId, title: body.title, venue: body.venue || null, location: body.location || null, start_date: body.start_date || null, end_date: body.end_date || null, description: body.description || null, status: body.status || 'past',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
