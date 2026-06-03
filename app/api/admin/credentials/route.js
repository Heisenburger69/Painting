import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { resolveArtistId } from '@/lib/artist'

export async function GET() {
  const supabase = getServiceSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const { data, error } = await supabase.from('credentials').select('*').order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request) {
  const supabase = getServiceSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const body = await request.json()

  const artistId = await resolveArtistId(supabase, body)
  if (!artistId) return NextResponse.json({ error: 'Could not resolve artist_id' }, { status: 500 })

  const { error } = await supabase.from('credentials').insert({
    artist_id: artistId, title: body.title, institution: body.institution || null, type: body.type || 'education', start_year: body.start_year || null, end_year: body.end_year || null, description: body.description || null, sort_order: body.sort_order || 0,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
