-- ============================================
-- Migration 007: Streak Auto-Update Trigger
-- Automatically maintains the streaks table
-- whenever a habit_log row is completed.
-- ============================================

-- Ensure a streak row exists for every profile (safe to run multiple times)
INSERT INTO streaks (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;

-- Function: called by trigger after each habit_log upsert
CREATE OR REPLACE FUNCTION update_streak_on_checkin()
RETURNS TRIGGER AS $$
DECLARE
  today         DATE := CURRENT_DATE;
  v_last_date   DATE;
  v_current     INTEGER;
  v_longest     INTEGER;
  v_total       INTEGER;
BEGIN
  -- Only process completed logs
  IF NEW.completed IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  -- Fetch existing streak data (row guaranteed by the INSERT above)
  SELECT last_active_date, current_streak, longest_streak, total_days_completed
  INTO v_last_date, v_current, v_longest, v_total
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
  ELSE
    -- Gap detected — reset streak to 1
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

-- Drop existing trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS trg_update_streak ON habit_logs;

-- Create trigger: fires after INSERT or UPDATE on habit_logs
CREATE TRIGGER trg_update_streak
AFTER INSERT OR UPDATE ON habit_logs
FOR EACH ROW
EXECUTE FUNCTION update_streak_on_checkin();

-- RLS: allow service role to update streaks (trigger runs as SECURITY DEFINER)
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own streak" ON streaks;
CREATE POLICY "Users can read own streak"
  ON streaks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own streak" ON streaks;
CREATE POLICY "Users can update own streak"
  ON streaks FOR UPDATE
  USING (auth.uid() = user_id);
