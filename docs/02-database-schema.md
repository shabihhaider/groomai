# Database Schema — Supabase (PostgreSQL)

## Overview
All tables use UUID primary keys, `created_at` and `updated_at` timestamps.

Row Level Security (RLS) is enabled on all application tables. User-owned tables have per-user policies (users can only access their own rows). Some tables are public-read (e.g., `hairstyles`, `badges`). Some tables are server-owned (written by Edge Functions / service role) and should not have client write policies (e.g., `webhook_events`, `ai_usage_logs`).

---

## Tables

### 1. `profiles`
Extends Supabase auth.users. Created automatically on signup via trigger.

```sql
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
  hair_concerns TEXT[], -- ['thinning', 'dandruff', 'dry', 'oily_scalp']
  has_beard BOOLEAN DEFAULT false,
  beard_style TEXT,

  -- Grooming Preferences
  grooming_goals TEXT[], -- ['clear_skin', 'better_hair', 'beard_growth', 'anti_aging']
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
```

---

### 2. `routines`
Stores each user's grooming routines.

```sql
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Morning Routine', 'Night Routine', 'Custom'
  type TEXT CHECK (type IN ('morning', 'night', 'custom')),
  is_active BOOLEAN DEFAULT true,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3. `routine_steps`
Individual steps within a routine.

```sql
CREATE TABLE routine_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,           -- 'Cleanser', 'Moisturizer', 'Beard Oil'
  description TEXT,
  category TEXT CHECK (category IN ('face', 'hair', 'beard', 'body', 'other')),
  product_name TEXT,
  product_affiliate_url TEXT,
  duration_seconds INTEGER,      -- Estimated time for this step
  is_premium_step BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4. `habit_logs`
Daily check-in records per routine step.

```sql
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  routine_step_id UUID REFERENCES routine_steps(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, routine_step_id, logged_date)
);
```

---

### 5. `streaks`
Separate streak tracking table for precision.

```sql
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
```

---

### 6. `badges`
Master list of all earnable badges.

```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,      -- e.g. 'first-checkin', 'week-warrior', 'skin-guru' — ALWAYS use hyphens, never underscores. Must match slug values in constants/badges.ts and seed SQL exactly.
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  lottie_url TEXT,                -- Lottie animation for unlock
  xp_reward INTEGER DEFAULT 0,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  unlock_condition JSONB,         -- {"type": "streak", "value": 7}
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 7. `user_badges`
Badges earned by users.

```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_seen BOOLEAN DEFAULT false,  -- For showing unlock animation once
  UNIQUE(user_id, badge_id)
);
```

---

### 8. `hairstyles`
The full hairstyle library (seeded data).

```sql
CREATE TABLE hairstyles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,             -- 'Mid Fade + Textured Top'
  slug TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('short', 'medium', 'long', 'beard', 'combo')),
  face_shapes TEXT[],             -- ['oval', 'square'] - which shapes this suits
  hair_types TEXT[],              -- ['straight', 'wavy']
  description TEXT,

  -- Barber Translator Data
  barber_script TEXT NOT NULL,    -- Exact words to say to barber
  technical_name TEXT,            -- Professional barber term
  guard_numbers JSONB,            -- {"sides": "1.5", "top": "scissor cut"}
  styling_instructions TEXT,
  maintenance_frequency TEXT,     -- 'Every 3-4 weeks'

  -- Media
  thumbnail_url TEXT,
  front_view_url TEXT,
  side_view_url TEXT,
  back_view_url TEXT,
  deepar_effect_id TEXT,          -- Links to AR effect file

  -- Meta
  is_premium BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 9. `saved_hairstyles`
User's saved/favorited hairstyles.

```sql
CREATE TABLE saved_hairstyles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hairstyle_id UUID REFERENCES hairstyles(id),
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hairstyle_id)
);
```

---

### 10. `skin_analysis_logs`
History of AI skin analysis results.

```sql
CREATE TABLE skin_analysis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT,                 -- Stored in Supabase Storage
  analysis_result JSONB,          -- Raw AI output
  detected_skin_type TEXT,
  detected_concerns TEXT[],       -- ['acne', 'dark_spots', 'dryness', 'redness']
  confidence_score NUMERIC(4,2),
  recommendations TEXT[],
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 11. `hair_loss_logs`
Monthly progress photos for hair loss tracking.

```sql
CREATE TABLE hair_loss_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,        -- Stored in Supabase Storage
  photo_angle TEXT CHECK (photo_angle IN ('top', 'front', 'back', 'left', 'right')),
  notes TEXT,
  logged_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 12. `product_scans`
History of scanned products.

```sql
CREATE TABLE product_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  barcode TEXT NOT NULL,
  product_name TEXT,
  brand TEXT,
  category TEXT,
  ingredients JSONB,              -- Array of ingredient objects
  safety_score INTEGER,           -- 1-10 (10 = safest)
  flagged_ingredients TEXT[],     -- Ingredients bad for their skin type
  recommendation TEXT CHECK (recommendation IN ('safe', 'caution', 'avoid')),
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 13. `affiliate_clicks`
Track affiliate link clicks for revenue.

```sql
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT,
  affiliate_url TEXT,
  source TEXT,                    -- 'routine_step', 'recommendation', 'scanner'
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 14. `webhook_events`
Stores inbound webhook events so processing can be idempotent (safe to retry). Required for RevenueCat webhooks.

```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,                 -- 'revenuecat'
  event_id TEXT,                          -- Provider event id (if available)
  event_type TEXT,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('received', 'processed', 'ignored', 'error')) DEFAULT 'received',
  error_message TEXT,
  UNIQUE(provider, event_id)
);
```

---

### 15. `notification_settings`
Per-user notification preferences.

```sql
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  morning_routine_enabled BOOLEAN DEFAULT true,
  morning_routine_time TIME DEFAULT '07:00',
  night_routine_enabled BOOLEAN DEFAULT true,
  night_routine_time TIME DEFAULT '21:00',
  streak_reminder_enabled BOOLEAN DEFAULT true,
  weekly_tips_enabled BOOLEAN DEFAULT true,
  badge_notifications_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 16. `ai_usage_logs`
Tracks AI feature usage for rate limiting and cost control. Rows are created by Edge Functions using the service role key.

```sql
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,          -- 'skin_analysis' | 'generate_routine' | ...
  used_date DATE DEFAULT CURRENT_DATE,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Triggers & Functions

### Auto-create profile on signup
```sql
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
  INSERT INTO streaks (user_id) VALUES (NEW.id);
  INSERT INTO notification_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Auto-update `updated_at`
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### XP & Level Calculator
```sql
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level thresholds: 1=0, 2=100, 3=250, 4=500, 5=1000, ...
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
```

---

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_hairstyles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hair_loss_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE hairstyles ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Server-owned tables
-- webhook_events: server-only (do NOT add client CRUD policies). Read/write via Edge Functions using service role.

-- AI usage logs: typically written by Edge Functions; optional user read for transparency/debug.
CREATE POLICY "Users can view own ai usage logs" ON ai_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Profiles: users can only access their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Pattern repeated for all user-owned tables:
-- "Users can CRUD own [table]" WHERE user_id = auth.uid()

-- Hairstyles: public read
CREATE POLICY "Hairstyles are publicly readable" ON hairstyles FOR SELECT USING (true);

-- Badges: public read
CREATE POLICY "Badges are publicly readable" ON badges FOR SELECT USING (true);
```

---

## Supabase Storage Buckets

```
profile-avatars/        (public)
  └── {user_id}/avatar.jpg

skin-analysis/          (private)
  └── {user_id}/{timestamp}.jpg

hair-loss-photos/       (private)
  └── {user_id}/{date}/{angle}.jpg

hairstyle-assets/       (public)
  └── {hairstyle_slug}/front.jpg
  └── {hairstyle_slug}/side.jpg
  └── {hairstyle_slug}/back.jpg
```
