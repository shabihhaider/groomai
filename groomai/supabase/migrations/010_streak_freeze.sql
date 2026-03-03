-- ============================================
-- Migration 010: Streak Freeze & Gamification
-- Adds streak freeze mechanic to streaks table
-- ============================================

-- Add streak freeze columns to streaks table
ALTER TABLE streaks 
    ADD COLUMN IF NOT EXISTS streak_freezes_remaining INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS streak_freeze_used_at TIMESTAMPTZ;

-- Recreate the streak trigger function with freeze support
CREATE OR REPLACE FUNCTION update_streak_on_checkin()
RETURNS TRIGGER AS $$
DECLARE
  today         DATE := CURRENT_DATE;
  v_last_date   DATE;
  v_current     INTEGER;
  v_longest     INTEGER;
  v_total       INTEGER;
  v_freezes     INTEGER;
BEGIN
  -- Only process completed logs
  IF NEW.completed IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  -- Fetch existing streak data
  SELECT last_active_date, current_streak, longest_streak, total_days_completed,
         COALESCE(streak_freezes_remaining, 1)
  INTO v_last_date, v_current, v_longest, v_total, v_freezes
  FROM streaks
  WHERE user_id = NEW.user_id;

  -- Skip if we already updated the streak today
  IF v_last_date = today THEN
    RETURN NEW;
  END IF;

  -- Determine new streak value
  IF v_last_date = today - INTERVAL '1 day' THEN
    -- Consecutive day — extend streak
    v_current := v_current + 1;
  ELSIF v_last_date = today - INTERVAL '2 days' AND v_freezes > 0 THEN
    -- Missed exactly 1 day but have a freeze available — use it and extend
    v_current := v_current + 1;
    v_freezes := v_freezes - 1;

    UPDATE streaks
    SET streak_freeze_used_at = NOW(),
        streak_freezes_remaining = v_freezes
    WHERE user_id = NEW.user_id;
  ELSE
    -- Gap detected (>1 day or no freeze) — reset streak to 1
    v_current := 1;
  END IF;

  -- Update longest if needed
  IF v_current > v_longest THEN
    v_longest := v_current;
  END IF;

  -- Increment total days
  v_total := v_total + 1;

  -- Write back
  UPDATE streaks
  SET
    current_streak       = v_current,
    longest_streak       = v_longest,
    total_days_completed = v_total,
    last_active_date     = today,
    updated_at           = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Weekly freeze refill function (call from a scheduled job or app logic)
CREATE OR REPLACE FUNCTION refill_streak_freezes()
RETURNS void AS $$
BEGIN
  UPDATE streaks
  SET streak_freezes_remaining = 1
  WHERE streak_freezes_remaining < 1
    AND (streak_freeze_used_at IS NULL OR streak_freeze_used_at < NOW() - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
