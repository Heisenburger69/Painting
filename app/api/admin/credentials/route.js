import { NextResponse } from 'next/server'
import { getAuthSupabase, unauthorized } from '@/lib/admin-auth'

export async function GET(request) {
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()
  const { data, error } = await supabase.from('credentials').select('*').order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request) {
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()
  const body = await request.json()

  const { error } = await supabase.from('credentials').insert({
    title: body.title, institution: body.institution || null, type: body.type || 'education', start_year: body.start_year || null, end_year: body.end_year || null, description: body.description || null, sort_order: body.sort_order || 0,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
