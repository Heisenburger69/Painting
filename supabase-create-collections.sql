-- ============================================================
-- Collections table + collection_id on artworks
-- Run this in your Supabase project's SQL Editor
-- ============================================================

-- 1. Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artist_profile(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add collection_id to artworks
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;

-- 3. Add stock column to artworks (null = single piece available, 0 = out of stock)
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT NULL;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_collections_artist_id ON collections(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_collection_id ON artworks(collection_id);

-- 4. Disable RLS
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
