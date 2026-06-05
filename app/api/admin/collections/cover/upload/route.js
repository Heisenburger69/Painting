import { NextResponse } from 'next/server'
import { getAuthSupabase, unauthorized } from '@/lib/admin-auth'

export async function POST(request) {
  const supabase = await getAuthSupabase(request)
  if (!supabase) return unauthorized()

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const filePath = `collections/cover_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadErr } = await supabase.storage.from('artworks').upload(filePath, buffer, { contentType: file.type, upsert: false })
  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('artworks').getPublicUrl(filePath)

  return NextResponse.json({ url: publicUrl })
}
