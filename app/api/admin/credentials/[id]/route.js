import { NextResponse } from 'next/server'
import { getAuthSupabase, unauthorized } from '@/lib/admin-auth'

export async function PUT(request, { params }) {
  const { id } = await params
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()
  const body = await request.json()
  const { error } = await supabase.from('credentials').update({
    title: body.title, institution: body.institution || null, type: body.type || 'education', start_year: body.start_year || null, end_year: body.end_year || null, description: body.description || null, sort_order: body.sort_order || 0,
  }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_request, { params }) {
  const { id } = await params
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()
  const { error } = await supabase.from('credentials').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
