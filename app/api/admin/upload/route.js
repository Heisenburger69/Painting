import { NextResponse } from 'next/server'
import { getAuthSupabase, unauthorized } from '@/lib/admin-auth'

export async function POST(request) {
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()

  const formData = await request.formData()
  const file = formData.get('file')
  const artworkId = formData.get('artwork_id')

  if (!file || !artworkId) {
    return NextResponse.json({ error: 'Missing file or artwork_id' }, { status: 400 })
  }

  const { count, error: countErr } = await supabase.from('artwork_images').select('*', { count: 'exact', head: true }).eq('artwork_id', artworkId)
  if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 })

  const ext = file.name.split('.').pop()
  const filePath = `artwork_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadErr } = await supabase.storage.from('artworks').upload(filePath, buffer, { contentType: file.type, upsert: false })
  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('artworks').getPublicUrl(filePath)

  const isPrimary = count === 0
  const { error: insertErr } = await supabase.from('artwork_images').insert({
    artwork_id: artworkId,
    url: publicUrl,
    is_primary: isPrimary,
    sort_order: count,
  })
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  return NextResponse.json({ url: publicUrl, is_primary: isPrimary })
}

export async function DELETE(request) {
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()

  const { imageId } = await request.json()
  if (!imageId) return NextResponse.json({ error: 'Missing imageId' }, { status: 400 })

  const { error } = await supabase.from('artwork_images').delete().eq('id', imageId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PUT(request) {
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()

  const { imageId, artworkId } = await request.json()
  if (!imageId || !artworkId) return NextResponse.json({ error: 'Missing imageId or artworkId' }, { status: 400 })

  const { error: clearErr } = await supabase.from('artwork_images').update({ is_primary: false }).eq('artwork_id', artworkId)
  if (clearErr) return NextResponse.json({ error: clearErr.message }, { status: 500 })

  const { error } = await supabase.from('artwork_images').update({ is_primary: true }).eq('id', imageId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
