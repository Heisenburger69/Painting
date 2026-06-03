import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { uuid, isValidUUID } from '@/lib/artist'

export async function GET() {
  const supabase = getServiceSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const { data, error } = await supabase.from('artist_profile').select('*').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || {})
}

export async function PUT(request) {
  const supabase = getServiceSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const body = await request.json()

  // Reject known invalid ID values
  let profileId = body.id
  if (!profileId || profileId === 'undefined' || profileId === 'null' || !isValidUUID(profileId)) {
    profileId = uuid()
  }

  const { error } = await supabase.from('artist_profile').upsert({ ...body, id: profileId })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: profileId, ...body })
}
