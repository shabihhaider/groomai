-- ============================================
-- Migration 004: Features
-- Creates all feature-specific tables
-- ============================================

-- Hairstyle library (seeded data)
CREATE TABLE hairstyles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('short', 'medium', 'long', 'beard', 'combo')),
  face_shapes TEXT[],
  hair_types TEXT[],
  description TEXT,
  barber_script TEXT NOT NULL,
  technical_name TEXT,
  guard_numbers JSONB,
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

-- Saved/favorited hairstyles
CREATE TABLE saved_hairstyles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hairstyle_id UUID REFERENCES hairstyles(id),
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hairstyle_id)
);

-- Skin analysis history
CREATE TABLE skin_analysis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT,
  analysis_result JSONB,
  detected_skin_type TEXT,
  detected_concerns TEXT[],
  confidence_score NUMERIC(4,2),
  recommendations TEXT[],
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hair loss tracking photos
CREATE TABLE hair_loss_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_angle TEXT CHECK (photo_angle IN ('top', 'front', 'back', 'left', 'right')),
  notes TEXT,
  logged_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product scans
CREATE TABLE product_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  barcode TEXT NOT NULL,
  product_name TEXT,
  brand TEXT,
  category TEXT,
  ingredients JSONB,
  safety_score INTEGER,
  flagged_ingredients TEXT[],
  recommendation TEXT CHECK (recommendation IN ('safe', 'caution', 'avoid')),
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate click tracking
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT,
  affiliate_url TEXT,
  source TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification settings per user
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

-- Webhook events (idempotent processing)
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_id TEXT,
  event_type TEXT,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('received', 'processed', 'ignored', 'error')) DEFAULT 'received',
  error_message TEXT,
  UNIQUE(provider, event_id)
);

-- AI usage logs (rate limiting + cost control)
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  used_date DATE DEFAULT CURRENT_DATE,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
