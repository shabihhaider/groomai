-- ============================================
-- Migration 008: Hairstyles & Saved Hairstyles
-- Barber Translator feature tables + RLS
-- ============================================

CREATE TABLE IF NOT EXISTS hairstyles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('short', 'medium', 'long', 'beard', 'combo')) NOT NULL DEFAULT 'short',
  face_shapes TEXT[] DEFAULT '{}',
  hair_types TEXT[] DEFAULT '{}',
  description TEXT,
  barber_script TEXT NOT NULL,
  technical_name TEXT,
  guard_numbers JSONB DEFAULT '{}',
  styling_instructions TEXT,
  maintenance_frequency TEXT,
  thumbnail_url TEXT,
  front_view_url TEXT,
  side_view_url TEXT,
  back_view_url TEXT,
  deepar_effect_id TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_hairstyles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hairstyle_id UUID REFERENCES hairstyles(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hairstyle_id)
);

-- RLS
ALTER TABLE hairstyles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_hairstyles ENABLE ROW LEVEL SECURITY;

-- Hairstyles are public read
DROP POLICY IF EXISTS "Public can read hairstyles" ON hairstyles;
CREATE POLICY "Public can read hairstyles"
  ON hairstyles FOR SELECT
  USING (true);

-- Only service role can insert/update hairstyles (seeded data)
DROP POLICY IF EXISTS "Service role can manage hairstyles" ON hairstyles;
CREATE POLICY "Service role can manage hairstyles"
  ON hairstyles FOR ALL
  USING (auth.role() = 'service_role');

-- Saved hairstyles — users manage their own
DROP POLICY IF EXISTS "Users can read own saved hairstyles" ON saved_hairstyles;
CREATE POLICY "Users can read own saved hairstyles"
  ON saved_hairstyles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save hairstyles" ON saved_hairstyles;
CREATE POLICY "Users can save hairstyles"
  ON saved_hairstyles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave hairstyles" ON saved_hairstyles;
CREATE POLICY "Users can unsave hairstyles"
  ON saved_hairstyles FOR DELETE
  USING (auth.uid() = user_id);

-- Increment view count function (fire-and-forget, no auth required)
CREATE OR REPLACE FUNCTION increment_hairstyle_view(hairstyle_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE hairstyles SET view_count = view_count + 1 WHERE slug = hairstyle_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
