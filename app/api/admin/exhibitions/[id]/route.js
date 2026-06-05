import { NextResponse } from 'next/server'
import { getAuthSupabase, unauthorized } from '@/lib/admin-auth'

export async function PUT(request, { params }) {
  const { id } = await params
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()
  const body = await request.json()
  const { error } = await supabase.from('exhibitions').update({
    title: body.title, venue: body.venue || null, location: body.location || null, start_date: body.start_date || null, end_date: body.end_date || null, description: body.description || null, status: body.status || 'past',
  }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request, { params }) {
  const { id } = await params
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()
  const { error } = await supabase.from('exhibitions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
