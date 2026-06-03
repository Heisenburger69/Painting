import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(request) {
  const supabase = getServiceSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const formData = await request.formData()
  const file = formData.get('file')
  const artworkId = formData.get('artwork_id')

  if (!file || !artworkId) {
    return NextResponse.json({ error: 'Missing file or artwork_id' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const filePath = `artwork_${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadErr } = await supabase.storage.from('artworks').upload(filePath, buffer, { contentType: file.type, upsert: false })
  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('artworks').getPublicUrl(filePath)

  const { error: insertErr } = await supabase.from('artwork_images').insert({ artwork_id: artworkId, url: publicUrl, is_primary: true })
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  return NextResponse.json({ url: publicUrl })
}
