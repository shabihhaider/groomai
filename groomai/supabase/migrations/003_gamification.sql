-- ============================================
-- Migration 003: Gamification
-- Creates streaks, badges, user_badges tables + XP/level functions
-- ============================================

-- Streaks table
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  streak_started_at DATE,
  total_days_completed INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges master list
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  lottie_url TEXT,
  xp_reward INTEGER DEFAULT 0,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  unlock_condition JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User earned badges
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_seen BOOLEAN DEFAULT false,
  UNIQUE(user_id, badge_id)
);

-- Level calculator function
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN xp < 100 THEN 1
    WHEN xp < 250 THEN 2
    WHEN xp < 500 THEN 3
    WHEN xp < 1000 THEN 4
    WHEN xp < 2000 THEN 5
    WHEN xp < 4000 THEN 6
    WHEN xp < 7000 THEN 7
    WHEN xp < 11000 THEN 8
    WHEN xp < 16000 THEN 9
    ELSE 10
  END;
END;
$$ LANGUAGE plpgsql;

-- XP increment function (atomic, avoids race conditions)
-- Uses GREATEST to prevent total_xp from going negative when uncompleting steps
CREATE OR REPLACE FUNCTION increment_xp(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET
    total_xp = GREATEST(0, total_xp + amount),
    level = calculate_level(GREATEST(0, total_xp + amount))
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
