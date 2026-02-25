# Supabase Setup

## Overview
Complete setup guide for the Supabase backend. Run everything in order. This covers: project creation, auth, database, storage, RLS, edge functions.

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: `groomai`
3. Database password: save this securely
4. Region: pick closest to your target users (US East or EU West for broad coverage)
5. Copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Settings → API

---

## Step 2: Supabase Client (`lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppState } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Keep session alive when app is in foreground
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})
```

---

## Step 3: Auth Configuration

In Supabase Dashboard → Authentication → Providers:

### Email Auth
- Enable email auth ✓
- Disable "Confirm email" for faster onboarding (or keep for security — your call)
- Enable magic link as alternative

### Google OAuth
1. Go to Google Cloud Console → Create OAuth credentials
2. Add callback URL: `https://[your-project].supabase.co/auth/v1/callback`
3. Add your `groomai://sign-in` as allowed redirect
4. Paste Client ID + Secret into Supabase → Auth → Google

### Apple Sign In
1. Requires Apple Developer account ($99/yr)
2. Enable Sign in with Apple capability in App Identifiers
3. Create Service ID and key in Apple Developer
4. Configure in Supabase → Auth → Apple

### Auth Settings
```
Site URL: groomai://
Redirect URLs:
  groomai://sign-in
  groomai://
```

---

## Step 4: Run Database Migrations

In Supabase Dashboard → SQL Editor, run these files in order:

### `001_profiles.sql`
```sql
-- Create profiles table (see database-schema.md for full schema)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  -- ... (full schema from 02-database-schema.md)
);

-- Auto-create profile on signup
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

### `002_routines.sql`
```sql
CREATE TABLE routines ( ... );
CREATE TABLE routine_steps ( ... );
CREATE TABLE habit_logs ( ... );
-- (from schema file)
```

### `003_gamification.sql`
```sql
CREATE TABLE streaks ( ... );
CREATE TABLE badges ( ... );
CREATE TABLE user_badges ( ... );

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
```

### `004_features.sql`
```sql
CREATE TABLE hairstyles ( ... );
CREATE TABLE saved_hairstyles ( ... );
CREATE TABLE skin_analysis_logs ( ... );
CREATE TABLE hair_loss_logs ( ... );
CREATE TABLE product_scans ( ... );
CREATE TABLE affiliate_clicks ( ... );
CREATE TABLE notification_settings ( ... );
CREATE TABLE webhook_events ( ... );
CREATE TABLE ai_usage_logs ( ... );
```

### `005_rls.sql`
```sql
-- Enable RLS and set policies (see schema file for full policies)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ... all tables
```

### `006_seed_badges.sql`
```sql
INSERT INTO badges (slug, name, description, xp_reward, rarity, unlock_condition) VALUES
('first-checkin', 'Day One', 'Completed your first routine check-in', 50, 'common', '{"type": "checkin_count", "value": 1}'),
('week-warrior', 'Week Warrior', '7-day streak achieved', 150, 'common', '{"type": "streak", "value": 7}'),
('fortnight', 'Fortnight', '14-day streak achieved', 250, 'rare', '{"type": "streak", "value": 14}'),
('month-master', 'Month Master', '30-day streak achieved', 500, 'epic', '{"type": "streak", "value": 30}'),
('century', 'Century', '100-day streak', 1500, 'legendary', '{"type": "streak", "value": 100}'),
-- ... all badges from habit-tracker.md
;
```

### `007_seed_hairstyles.sql`
```sql
INSERT INTO hairstyles (name, slug, category, face_shapes, hair_types, barber_script, guard_numbers, ...) VALUES
('Mid Fade + Textured Top', 'mid-fade-textured-top', 'short', ARRAY['oval','square','oblong'], ...),
-- ... all 50+ hairstyles
;
```

---

## Step 4.5: Generate TypeScript Types (REQUIRED)

After running all migrations, generate the TypeScript type definitions for your database. Every service file in `services/` imports from `@/types/supabase` — this file will not exist until you run this command.

```bash
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_REF \
  --schema public \
  > types/supabase.ts
```

You can find `YOUR_PROJECT_REF` in Supabase Dashboard → Settings → General.

**Re-run this command every time you change the database schema.** Add it to your dev workflow with a script in `package.json`:

```json
{
  "scripts": {
    "gen:types": "supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public > types/supabase.ts"
  }
}
```

---

## Step 5: Storage Buckets

In Supabase Dashboard → Storage:

```
Create buckets:

1. profile-avatars
   - Public: YES
   - Max file size: 5MB
   - Allowed types: image/jpeg, image/png, image/webp

2. skin-analysis
   - Public: NO (private)
   - Max file size: 10MB
   - Allowed types: image/jpeg

3. hair-loss-photos
   - Public: NO (private)
   - Max file size: 10MB
   - Allowed types: image/jpeg

4. hairstyle-assets
   - Public: YES
   - Max file size: 20MB
   - Allowed types: image/jpeg, image/png
```

### Storage RLS Policies:
```sql
-- profile-avatars: users can upload/update their own
CREATE POLICY "Avatar upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar read" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-avatars');

-- skin-analysis: users can only access their own
CREATE POLICY "Skin analysis upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'skin-analysis' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Skin analysis read" ON storage.objects
  FOR SELECT USING (bucket_id = 'skin-analysis' AND auth.uid()::text = (storage.foldername(name))[1]);

-- hair-loss-photos: same pattern as skin-analysis
```

---

## Step 6: Edge Functions

### Deploy all edge functions:
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref

# Deploy each function
supabase functions deploy generate-routine
supabase functions deploy analyze-skin
supabase functions deploy analyze-product
supabase functions deploy analyze-hairstyle
supabase functions deploy revenuecat-webhook

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set REVENUECAT_WEBHOOK_SECRET=...
```

### Function file structure:
```
supabase/
  functions/
    generate-routine/
      index.ts
    analyze-skin/
      index.ts
    analyze-product/
      index.ts
      ingredientDb.ts
    analyze-hairstyle/
      index.ts
    revenuecat-webhook/
      index.ts
```

---

### OpenAI Rate Limiting (REQUIRED — cost control)

Every edge function that calls OpenAI **must** enforce a per-user daily limit. Without this, a single user on a 7-day free trial can trigger hundreds of API calls at $0.01–0.03 each.

Add this guard at the top of every AI edge function (`analyze-skin/index.ts`, `generate-routine/index.ts`):

```typescript
// supabase/functions/_shared/rateLimiter.ts
import { createClient } from '@supabase/supabase-js'

const DAILY_LIMITS = {
  skin_analysis: { free: 0, trial: 1, premium: 3, lifetime: 5 },
  generate_routine: { free: 0, trial: 1, premium: 5, lifetime: 10 },
}

export async function checkRateLimit(
  userId: string,
  feature: keyof typeof DAILY_LIMITS,
  subscriptionStatus: string
): Promise<{ allowed: boolean; remaining: number }> {
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const today = new Date().toISOString().split('T')[0]
  const limit = DAILY_LIMITS[feature][subscriptionStatus as keyof typeof DAILY_LIMITS[typeof feature]] ?? 0

  const { count } = await admin
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', feature)
    .eq('used_date', today)

  const used = count ?? 0
  return { allowed: used < limit, remaining: limit - used }
}
```

Also add an `ai_usage_logs` table to your migrations (`004_features.sql`):

```sql
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,  -- 'skin_analysis' | 'generate_routine' | ...
  used_date DATE DEFAULT CURRENT_DATE,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
```

---

## Step 7: Realtime (Optional for v1)

Enable realtime for streaks — so if user is on home screen and completes a routine on another device, streak updates live:

```sql
-- Enable realtime on streaks table
ALTER PUBLICATION supabase_realtime ADD TABLE streaks;
```

```typescript
// In home screen
const channel = supabase
  .channel('streak-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'streaks',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    updateStreakDisplay(payload.new)
  })
  .subscribe()
```

---

## Environment Setup Checklist

```
✓ EXPO_PUBLIC_SUPABASE_URL          (Dashboard → Settings → API)
✓ EXPO_PUBLIC_SUPABASE_ANON_KEY     (Dashboard → Settings → API)
✓ SUPABASE_SERVICE_ROLE_KEY         (Dashboard → Settings → API — keep secret!)
✓ OPENAI_API_KEY                    (platform.openai.com)
✓ EXPO_PUBLIC_REVENUECAT_IOS_KEY    (app.revenuecat.com)
✓ EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
✓ DEEPAR_LICENSE_KEY                (developer.deepar.ai)
✓ EXPO_PUBLIC_POSTHOG_KEY           (posthog.com)
```
