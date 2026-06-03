import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function PUT(request, { params }) {
  const supabase = getServiceSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const body = await request.json()
  const { error } = await supabase.from('exhibitions').update({
    title: body.title, venue: body.venue || null, location: body.location || null, start_date: body.start_date || null, end_date: body.end_date || null, description: body.description || null, status: body.status || 'past',
  }).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_request, { params }) {
  const supabase = getServiceSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const { error } = await supabase.from('exhibitions').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
