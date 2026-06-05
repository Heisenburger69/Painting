import { NextResponse } from 'next/server'
import { getAuthSupabase, unauthorized } from '@/lib/admin-auth'

export async function GET(request) {
  const supabase = await getAuthSupabase(request)
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured - check env vars' }, { status: 500 })

  const results = {}

  // Test connection
  const { data: tables, error: tablesErr } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
  results.tablesList = tablesErr ? tablesErr.message : (tables || []).map(t => t.table_name)

  // Check artist_profile
  const { data: profile, error: profErr } = await supabase.from('artist_profile').select('*')
  results.profile = profErr ? `ERROR: ${profErr.message}` : profile

  // Check artworks
  const { data: artworks, error: artErr } = await supabase.from('artworks').select('*')
  results.artworks = artErr ? `ERROR: ${artErr.message}` : artworks

  // Try a simple insert + read
  const testId = crypto.randomUUID?.() || 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee'
  const { error: insertErr } = await supabase.from('artist_profile').insert({ id: testId, name: 'test' })
  results.testInsert = insertErr ? `ERROR: ${insertErr.message}` : 'OK'

  if (!insertErr) {
    const { data: check } = await supabase.from('artist_profile').select('id').eq('id', testId).maybeSingle()
    results.testRead = check ? `Found: ${check.id}` : 'NOT FOUND'
    await supabase.from('artist_profile').delete().eq('id', testId)
  }

  results.envCheck = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 15),
    anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10),
    serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10),
  }

  return NextResponse.json(results)
}
