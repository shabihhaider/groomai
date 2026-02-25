-- ============================================
-- Migration 006: Seed Badge Data
-- All badge slugs use hyphens (never underscores)
-- ============================================

INSERT INTO badges (slug, name, description, xp_reward, rarity, unlock_condition) VALUES
  -- Streak badges
  ('first-checkin', 'Day One', 'Completed your first routine check-in', 50, 'common', '{"type": "checkin_count", "value": 1}'),
  ('week-warrior', 'Week Warrior', '7-day streak achieved', 150, 'common', '{"type": "streak", "value": 7}'),
  ('fortnight', 'Fortnight', '14-day streak achieved', 250, 'rare', '{"type": "streak", "value": 14}'),
  ('month-master', 'Month Master', '30-day streak achieved', 500, 'epic', '{"type": "streak", "value": 30}'),
  ('two-months', 'Iron Will', '60-day streak achieved', 750, 'epic', '{"type": "streak", "value": 60}'),
  ('century', 'Century', '100-day streak', 1500, 'legendary', '{"type": "streak", "value": 100}'),

  -- Check-in count badges
  ('ten-checkins', 'Getting Started', '10 total check-ins completed', 100, 'common', '{"type": "checkin_count", "value": 10}'),
  ('fifty-checkins', 'Committed', '50 total check-ins completed', 200, 'rare', '{"type": "checkin_count", "value": 50}'),
  ('hundred-checkins', 'Centurion', '100 total check-ins completed', 400, 'rare', '{"type": "checkin_count", "value": 100}'),
  ('five-hundred-checkins', 'Veteran', '500 total check-ins', 800, 'epic', '{"type": "checkin_count", "value": 500}'),

  -- Level badges
  ('level-five', 'Rising Star', 'Reached Level 5', 200, 'rare', '{"type": "level", "value": 5}'),
  ('level-ten', 'Grooming Master', 'Reached Level 10', 500, 'legendary', '{"type": "level", "value": 10}'),

  -- Feature badges
  ('skin-guru', 'Skin Guru', 'Completed your first AI skin analysis', 100, 'common', '{"type": "feature", "value": "skin_analysis"}'),
  ('scanner-pro', 'Scanner Pro', 'Scanned your first product', 100, 'common', '{"type": "feature", "value": "product_scan"}'),
  ('style-explorer', 'Style Explorer', 'Saved your first hairstyle', 75, 'common', '{"type": "feature", "value": "saved_hairstyle"}'),
  ('ar-enthusiast', 'AR Enthusiast', 'Tried on your first AR hairstyle', 100, 'rare', '{"type": "feature", "value": "ar_tryon"}'),
  ('hair-tracker', 'Hair Detective', 'Completed your first hair tracking session', 100, 'common', '{"type": "feature", "value": "hair_tracking"}'),

  -- Special badges
  ('early-adopter', 'Early Adopter', 'Joined during the launch period', 200, 'rare', '{"type": "special", "value": "early_adopter"}'),
  ('premium-member', 'Premium Member', 'Subscribed to GroomAI Premium', 300, 'epic', '{"type": "special", "value": "premium"}'),
  ('share-master', 'Share Master', 'Shared your barber card with a friend', 75, 'common', '{"type": "feature", "value": "barber_card_share"}')
ON CONFLICT (slug) DO NOTHING;
