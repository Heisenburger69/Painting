const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function isValidUUID(v) {
  return typeof v === 'string' && UUID_RE.test(v)
}

export async function resolveArtistId(supabase, body) {
  let artistId = body.artist_id

  // Reject common invalid values
  if (artistId === 'undefined' || artistId === 'null' || artistId === '') {
    artistId = null
  }

  if (!artistId || !isValidUUID(artistId)) {
    const { data: profiles } = await supabase.from('artist_profile').select('id')
    if (profiles && profiles.length > 0 && isValidUUID(profiles[0].id)) {
      artistId = profiles[0].id
    }
  }

  if (!artistId || !isValidUUID(artistId)) {
    const newId = uuid()
    const { error: createErr } = await supabase.from('artist_profile').insert({ id: newId, name: '' })
    if (createErr) return null
    artistId = newId
  }

  return isValidUUID(artistId) ? artistId : null
}
