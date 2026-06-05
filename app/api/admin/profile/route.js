import { NextResponse } from 'next/server'
import { getAuthSupabase, unauthorized } from '@/lib/admin-auth'
import { uuid, isValidUUID } from '@/lib/artist'

export async function GET(request) {
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()
  const { data, error } = await supabase.from('artist_profile').select('*').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || {})
}

export async function PUT(request) {
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()
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
