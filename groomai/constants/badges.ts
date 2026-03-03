// constants/badges.ts
// Full 20-badge definitions matching the DB seed data in 006_seed_badges.sql
// Slugs use hyphens — NEVER underscores.

export interface BadgeDefinition {
    slug: string
    name: string
    description: string
    xp: number
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    condition: {
        type: string
        value?: number | string
        category?: string
    }
}

export const BADGES: BadgeDefinition[] = [
    // Streak Badges
    { slug: 'first-checkin', name: 'Day One', description: 'Completed your first routine check-in', xp: 50, rarity: 'common', condition: { type: 'checkin_count', value: 1 } },
    { slug: 'week-warrior', name: 'Week Warrior', description: '7-day streak achieved', xp: 150, rarity: 'common', condition: { type: 'streak', value: 7 } },
    { slug: 'fortnight', name: 'Fortnight', description: '14-day streak achieved', xp: 250, rarity: 'rare', condition: { type: 'streak', value: 14 } },
    { slug: 'month-master', name: 'Month Master', description: '30-day streak achieved', xp: 500, rarity: 'epic', condition: { type: 'streak', value: 30 } },
    { slug: 'two-months', name: 'Iron Will', description: '60-day streak achieved', xp: 750, rarity: 'epic', condition: { type: 'streak', value: 60 } },
    { slug: 'century', name: 'Century', description: '100-day streak', xp: 1500, rarity: 'legendary', condition: { type: 'streak', value: 100 } },

    // Check-in Count Badges
    { slug: 'ten-checkins', name: 'Getting Started', description: '10 total check-ins completed', xp: 100, rarity: 'common', condition: { type: 'checkin_count', value: 10 } },
    { slug: 'fifty-checkins', name: 'Committed', description: '50 total check-ins completed', xp: 200, rarity: 'rare', condition: { type: 'checkin_count', value: 50 } },
    { slug: 'hundred-checkins', name: 'Centurion', description: '100 total check-ins completed', xp: 400, rarity: 'rare', condition: { type: 'checkin_count', value: 100 } },
    { slug: 'five-hundred-checkins', name: 'Veteran', description: '500 total check-ins', xp: 800, rarity: 'epic', condition: { type: 'checkin_count', value: 500 } },

    // Level Badges
    { slug: 'level-five', name: 'Rising Star', description: 'Reached Level 5', xp: 200, rarity: 'rare', condition: { type: 'level', value: 5 } },
    { slug: 'level-ten', name: 'Grooming Master', description: 'Reached Level 10', xp: 500, rarity: 'legendary', condition: { type: 'level', value: 10 } },

    // Feature Badges
    { slug: 'skin-guru', name: 'Skin Guru', description: 'Go to Skin Analysis and take your first selfie scan', xp: 100, rarity: 'common', condition: { type: 'feature', value: 'skin_analysis' } },
    { slug: 'scanner-pro', name: 'Scanner Pro', description: 'Open Product Scanner and scan any grooming product barcode', xp: 100, rarity: 'common', condition: { type: 'feature', value: 'product_scan' } },
    { slug: 'style-explorer', name: 'Style Explorer', description: 'Browse hairstyles and tap ♥ to save your first one', xp: 75, rarity: 'common', condition: { type: 'feature', value: 'saved_hairstyle' } },
    { slug: 'ar-enthusiast', name: 'AR Enthusiast', description: 'Use the AR camera to try on a hairstyle', xp: 100, rarity: 'rare', condition: { type: 'feature', value: 'ar_tryon' } },
    { slug: 'hair-tracker', name: 'Hair Detective', description: 'Take your first hair progress photo in Hair Loss Tracker', xp: 100, rarity: 'common', condition: { type: 'feature', value: 'hair_tracking' } },

    // Special Badges
    { slug: 'early-adopter', name: 'Early Adopter', description: 'Joined during the launch period', xp: 200, rarity: 'rare', condition: { type: 'special', value: 'early_adopter' } },
    { slug: 'premium-member', name: 'Premium Member', description: 'Subscribed to GroomAI Premium', xp: 300, rarity: 'epic', condition: { type: 'special', value: 'premium' } },
    { slug: 'share-master', name: 'Share Master', description: 'Generate a Barber Card and share it via WhatsApp or Messages', xp: 75, rarity: 'common', condition: { type: 'feature', value: 'barber_card_share' } },
]

export const LEVEL_TITLES: Record<number, string> = {
    1: 'Rookie',
    2: 'Beginner',
    3: 'Getting There',
    4: 'Consistent',
    5: 'Groomed',
    6: 'Sharp',
    7: 'Refined',
    8: 'Distinguished',
    9: 'Elite',
    10: 'The Blueprint',
}

export const LEVEL_THRESHOLDS: Record<number, number> = {
    1: 0,
    2: 100,
    3: 250,
    4: 500,
    5: 1000,
    6: 2000,
    7: 4000,
    8: 7000,
    9: 11000,
    10: 16000,
}

export const RARITY_COLORS: Record<string, string> = {
    common: '#9E9E9E',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#C9A84C',
}
