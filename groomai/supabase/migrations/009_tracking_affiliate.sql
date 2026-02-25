-- 009_tracking_affiliate.sql
-- Phase 9 — Hair Loss Tracker, Product Scans, Affiliate Clicks, AI Usage Logs
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query → Paste → Run)

-- ── hair_loss_logs ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hair_loss_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url    TEXT NOT NULL,
  photo_angle  TEXT NOT NULL CHECK (photo_angle IN ('top','front','back','left','right')),
  logged_date  DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hair_loss_logs_user_date ON hair_loss_logs(user_id, logged_date DESC);

ALTER TABLE hair_loss_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own hair loss logs" ON hair_loss_logs;
CREATE POLICY "Users can read own hair loss logs"
  ON hair_loss_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own hair loss logs" ON hair_loss_logs;
CREATE POLICY "Users can insert own hair loss logs"
  ON hair_loss_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own hair loss logs" ON hair_loss_logs;
CREATE POLICY "Users can delete own hair loss logs"
  ON hair_loss_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ── product_scans ──────────────────────────────────────────────────────────


-- ── product_scans ──────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'product_scans'
  ) THEN
    CREATE TABLE product_scans (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      barcode         TEXT,
      product_name    TEXT,
      brand           TEXT,
      ingredients_raw TEXT,
      safety_score    INTEGER,
      verdict         TEXT CHECK (verdict IN ('safe','caution','avoid')),
      analysis_result JSONB,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX product_scans_user ON product_scans(user_id, created_at DESC);

    ALTER TABLE product_scans ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can read own product scans"
      ON product_scans FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own product scans"
      ON product_scans FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ── affiliate_clicks ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id    TEXT NOT NULL,
  product_name  TEXT,
  affiliate_url TEXT,
  source        TEXT,
  clicked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS affiliate_clicks_user    ON affiliate_clicks(user_id,    clicked_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_clicks_product ON affiliate_clicks(product_id, clicked_at DESC);

ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert affiliate clicks" ON affiliate_clicks;
CREATE POLICY "Users can insert affiliate clicks"
  ON affiliate_clicks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can read affiliate clicks" ON affiliate_clicks;
CREATE POLICY "Service role can read affiliate clicks"
  ON affiliate_clicks FOR SELECT
  USING (auth.role() = 'service_role');

-- ── ai_usage_logs ─────────────────────────────────────────────────────────
-- Guarded: only creates if the table does not already exist at all.
-- If it already exists from Phase 7, we skip silently.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ai_usage_logs'
  ) THEN
    CREATE TABLE ai_usage_logs (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      feature     TEXT NOT NULL,
      meta        JSONB,
      used_date   DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX ai_usage_logs_user_feature_date
      ON ai_usage_logs(user_id, feature, used_date);

    ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Service role manages ai_usage_logs"
      ON ai_usage_logs FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ── skin_analysis_logs ────────────────────────────────────────────────────
-- Same guard: only create if it does not already exist.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'skin_analysis_logs'
  ) THEN
    CREATE TABLE skin_analysis_logs (
      id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      photo_url           TEXT,
      analysis_result     JSONB NOT NULL,
      detected_skin_type  TEXT,
      detected_concerns   TEXT[],
      confidence_score    NUMERIC(4,2),
      recommendations     TEXT[],
      analyzed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX skin_analysis_logs_user
      ON skin_analysis_logs(user_id, analyzed_at DESC);

    ALTER TABLE skin_analysis_logs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can read own skin analysis logs"
      ON skin_analysis_logs FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Service role manages skin_analysis_logs"
      ON skin_analysis_logs FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ── Add is_ai_generated to routines (if column not yet present) ───────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'routines'
      AND column_name  = 'is_ai_generated'
  ) THEN
    ALTER TABLE routines ADD COLUMN is_ai_generated BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
