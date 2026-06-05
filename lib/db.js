import { getServiceSupabase } from './supabase'

function getDb() {
  const s = getServiceSupabase()
  if (!s) throw new Error('Supabase not configured')
  return s
}

export async function getArtistProfile() {
  const { data } = await getDb().from('artist_profile').select('*').maybeSingle()
  return data
}

export async function getCredentials() {
  const { data } = await getDb().from('credentials').select('*').order('sort_order', { ascending: true })
  return data || []
}

export async function getPastExhibitions() {
  const { data } = await getDb()
    .from('exhibitions')
    .select('*')
    .or('status.eq.past,end_date.lt.' + new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: false })
  return data || []
}

export async function getUpcomingExhibitions() {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await getDb()
    .from('exhibitions')
    .select('*')
    .or(`and(status.eq.upcoming,start_date.gte.${today}),and(status.eq.current,start_date.gte.${today})`)
    .order('start_date', { ascending: true })
  return data || []
}

export async function getCollections() {
  const { data } = await getDb()
    .from('collections')
    .select('*, artworks(*, artwork_images(*))')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
  return (data || []).map(formatCollection)
}

export async function getCollectionById(id) {
  const { data } = await getDb()
    .from('collections')
    .select('*, artworks(*, artwork_images(*))')
    .eq('id', id)
    .maybeSingle()
  return data ? formatCollection(data) : null
}

function formatCollection(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    cover_image: row.cover_image,
    sort_order: row.sort_order,
    artworks: (row.artworks || [])
      .filter((a) => !a.deleted_at && a.is_published)
      .map(formatArtwork),
  }
}

export async function getArtworks() {
  const { data } = await getDb()
    .from('artworks')
    .select('*, artwork_images(*), collection_id')
    .is('deleted_at', null)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
  return (data || []).map(formatArtwork)
}

export async function getArtworkById(id) {
  const { data } = await getDb()
    .from('artworks')
    .select('*, artwork_images(*), collections(title)')
    .is('deleted_at', null)
    .eq('is_published', true)
    .eq('id', id)
    .maybeSingle()
  return data ? formatArtwork(data) : null
}

export async function getFeaturedArtworks() {
  const { data } = await getDb()
    .from('artworks')
    .select('*, artwork_images(*), collection_id')
    .is('deleted_at', null)
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
  return (data || []).map(formatArtwork)
}

function formatArtwork(row) {
  const primary = (row.artwork_images || []).find((img) => img.is_primary) || (row.artwork_images || [])[0]
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    medium: row.medium,
    width_cm: row.width_cm,
    height_cm: row.height_cm,
    depth_cm: row.depth_cm,
    size: [row.width_cm, row.height_cm].filter(Boolean).join(' × ') + (row.width_cm ? ' cm' : ''),
    description: row.description,
    price: row.price,
    currency: row.currency || 'EGP',
    status: row.status || 'available',
    sold: row.status === 'sold',
    stock: row.stock,
    featured: row.is_featured,
    published: row.is_published,
    collection_id: row.collection_id,
    collection_name: row.collections?.title || null,
    image: primary ? primary.url : null,
    images: (row.artwork_images || []).map((img) => img.url),
    sort_order: row.sort_order,
  }
}
