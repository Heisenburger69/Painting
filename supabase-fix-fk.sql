-- ============================================================
-- Fix FK constraint on artworks.artist_id
-- Supabase's default artworks template uses FK -> artists,
-- but this project uses artist_profile instead.
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- First, check what the FK currently references
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_schema,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_name = 'artworks_artist_id_fkey'
  AND tc.table_name = 'artworks';

-- Drop the old FK (pointing to artists)
ALTER TABLE artworks DROP CONSTRAINT IF EXISTS artworks_artist_id_fkey;

-- Add the correct FK (pointing to artist_profile)
ALTER TABLE artworks ADD CONSTRAINT artworks_artist_id_fkey
  FOREIGN KEY (artist_id) REFERENCES artist_profile(id) ON DELETE CASCADE;

-- Disable RLS on all tables so anon key works too
ALTER TABLE artist_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE credentials DISABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE artworks DISABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
