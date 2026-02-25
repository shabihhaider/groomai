-- ============================================
-- Migration 001: Profiles
-- Creates the profiles table and auto-create trigger
-- ============================================

-- Auto-update updated_at function (used by multiple tables)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles table — extends auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,

  -- Face & Physical Profile
  face_shape TEXT CHECK (face_shape IN ('oval', 'square', 'round', 'oblong', 'diamond', 'heart', 'triangle')),
  skin_type TEXT CHECK (skin_type IN ('oily', 'dry', 'combination', 'normal', 'sensitive', 'acne_prone')),
  skin_tone TEXT CHECK (skin_tone IN ('fair', 'light', 'medium', 'olive', 'tan', 'deep')),
  hair_type TEXT CHECK (hair_type IN ('straight', 'wavy', 'curly', 'coily')),
  hair_thickness TEXT CHECK (hair_thickness IN ('fine', 'medium', 'thick')),
  hair_concerns TEXT[],
  skin_concerns TEXT[], -- ['acne', 'dark_spots', 'anti_aging', 'dullness', 'redness', 'large_pores']
  has_beard BOOLEAN DEFAULT false,
  beard_style TEXT,

  -- Grooming Preferences
  grooming_goals TEXT[],
  daily_time_available TEXT CHECK (daily_time_available IN ('2min', '5min', '10min', '15min+')),
  budget_range TEXT CHECK (budget_range IN ('budget', 'mid', 'premium')),

  -- Subscription
  subscription_status TEXT CHECK (subscription_status IN ('free', 'trial', 'premium', 'lifetime')) DEFAULT 'trial',
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,
  revenuecat_customer_id TEXT,

  -- Gamification
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_checkin_date DATE,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
-- NOTE: This trigger also creates rows in streaks and notification_settings,
-- so those tables must exist before this trigger can fire.
-- Run migration 003 and 004 before testing signup.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, trial_started_at, trial_ends_at, subscription_status)
  VALUES (
    NEW.id,
    NOW(),
    NOW() + INTERVAL '7 days',
    'trial'
  );
  -- streaks and notification_settings rows created here
  -- (tables created in migrations 003 and 004)
  INSERT INTO streaks (user_id) VALUES (NEW.id);
  INSERT INTO notification_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
