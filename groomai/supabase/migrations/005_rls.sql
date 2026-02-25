-- ============================================
-- Migration 005: Row Level Security
-- Enable RLS on all tables + create access policies
-- ============================================

-- Enable RLS on every table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE hairstyles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_hairstyles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hair_loss_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Profiles: users can only access their own
-- ─────────────────────────────────────────────
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ─────────────────────────────────────────────
-- Routines: users can CRUD their own
-- ─────────────────────────────────────────────
CREATE POLICY "Users can view own routines" ON routines
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own routines" ON routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routines" ON routines
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own routines" ON routines
  FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- Routine Steps: access through routine ownership
-- ─────────────────────────────────────────────
CREATE POLICY "Users can view own routine steps" ON routine_steps
  FOR SELECT USING (
    routine_id IN (SELECT id FROM routines WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create own routine steps" ON routine_steps
  FOR INSERT WITH CHECK (
    routine_id IN (SELECT id FROM routines WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update own routine steps" ON routine_steps
  FOR UPDATE USING (
    routine_id IN (SELECT id FROM routines WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can delete own routine steps" ON routine_steps
  FOR DELETE USING (
    routine_id IN (SELECT id FROM routines WHERE user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- Habit Logs: users can CRUD their own
-- ─────────────────────────────────────────────
CREATE POLICY "Users can view own habit logs" ON habit_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own habit logs" ON habit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habit logs" ON habit_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habit logs" ON habit_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- Streaks: users can view/update their own
-- ─────────────────────────────────────────────
CREATE POLICY "Users can view own streak" ON streaks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- Badges: public read (everyone can see all badges)
-- ─────────────────────────────────────────────
CREATE POLICY "Badges are publicly readable" ON badges
  FOR SELECT USING (true);

-- ─────────────────────────────────────────────
-- User Badges: users can view their own
-- ─────────────────────────────────────────────
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- Hairstyles: public read
-- ─────────────────────────────────────────────
CREATE POLICY "Hairstyles are publicly readable" ON hairstyles
  FOR SELECT USING (true);

-- ─────────────────────────────────────────────
-- Saved Hairstyles: users can CRUD their own
-- ─────────────────────────────────────────────
CREATE POLICY "Users can view saved hairstyles" ON saved_hairstyles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save hairstyles" ON saved_hairstyles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave hairstyles" ON saved_hairstyles
  FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- Skin Analysis Logs: users can view their own
-- ─────────────────────────────────────────────
CREATE POLICY "Users can view own skin analysis" ON skin_analysis_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own skin analysis" ON skin_analysis_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- Hair Loss Logs: users can CRUD their own
-- ─────────────────────────────────────────────
CREATE POLICY "Users can view own hair loss logs" ON hair_loss_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own hair loss logs" ON hair_loss_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own hair loss logs" ON hair_loss_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- Product Scans: users can view their own
-- ─────────────────────────────────────────────
CREATE POLICY "Users can view own product scans" ON product_scans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own product scans" ON product_scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- Affiliate Clicks: users can create their own
-- ─────────────────────────────────────────────
CREATE POLICY "Users can view own affiliate clicks" ON affiliate_clicks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own affiliate clicks" ON affiliate_clicks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- Notification Settings: users can CRUD their own
-- ─────────────────────────────────────────────
CREATE POLICY "Users can view own notification settings" ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notification settings" ON notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- Webhook Events: server-only (no client policies)
-- Written by Edge Functions using service role key
-- ─────────────────────────────────────────────

-- ─────────────────────────────────────────────
-- AI Usage Logs: users can view their own (written by Edge Functions)
-- ─────────────────────────────────────────────
CREATE POLICY "Users can view own ai usage logs" ON ai_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- Storage RLS Policies
-- ─────────────────────────────────────────────

-- profile-avatars: users can upload/update their own
CREATE POLICY "Avatar upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Avatar update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Avatar read" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-avatars');

-- skin-analysis: users can only access their own
CREATE POLICY "Skin analysis upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'skin-analysis' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Skin analysis read" ON storage.objects
  FOR SELECT USING (bucket_id = 'skin-analysis' AND auth.uid()::text = (storage.foldername(name))[1]);

-- hair-loss-photos: users can only access their own
CREATE POLICY "Hair loss upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'hair-loss-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Hair loss read" ON storage.objects
  FOR SELECT USING (bucket_id = 'hair-loss-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- hairstyle-assets: public read
CREATE POLICY "Hairstyle assets read" ON storage.objects
  FOR SELECT USING (bucket_id = 'hairstyle-assets');
