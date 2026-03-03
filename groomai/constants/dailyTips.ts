// constants/dailyTips.ts
// 30+ rotating daily grooming tips that cover skincare, haircare,
// beard care, lifestyle, and seasonal advice.
// Used in home tab and routines screen for daily engagement.

export const DAILY_TIPS = [
    // Skincare fundamentals
    'Consistency is key — even a 2-minute routine is better than skipping.',
    'Apply products in order: lightest to heaviest consistency.',
    'Your skin repairs itself at night — don\'t skip your evening routine.',
    'Vitamin C serum in the morning, retinol at night. Never mix them.',
    'Stress shows on your skin. Take 60 seconds to breathe deeply today.',
    'Apply moisturizer to slightly damp skin for better absorption.',
    'Sunscreen is the #1 anti-aging product. Wear it every single day.',
    'Your neck and ears need skincare too — extend products past your jawline.',
    'If your skin is irritated, skip actives today. Just cleanse and moisturize.',
    'Touching your face transfers bacteria. Try to break the habit.',

    // Haircare
    'Replace your razor blade every 5-7 shaves to avoid irritation.',
    'Cold rinse after conditioning locks in moisture for shinier hair.',
    'Don\'t shampoo every day — 2-3 times a week is ideal for most hair types.',
    'Apply styling product to towel-dried hair, not soaking wet hair, for better hold.',
    'Sleeping on a silk pillowcase reduces hair breakage and frizz.',
    'If you use heat tools, always apply a heat protectant first.',
    'Get your hair trimmed every 4-6 weeks, even if you\'re growing it out.',

    // Beard care
    'Beard oil isn\'t optional — it hydrates the skin underneath and prevents itching.',
    'Brush your beard downward daily to train the hair direction over time.',
    'Trim your neckline: two fingers above your Adam\'s apple is the sweet spot.',
    'Wash your beard with beard-specific shampoo, not regular shampoo.',

    // Lifestyle & habits
    'Drink at least 8 glasses of water today. Hydration shows in your skin.',
    'Sleep quality matters more than sleep hours. Aim for consistent bed times.',
    'Eating more omega-3 (salmon, walnuts) improves skin texture from within.',
    'Exercising increases blood flow to your skin, giving you a natural glow.',
    'Change your pillowcase every 2-3 days to reduce breakouts.',
    'Smoking and excessive alcohol age your skin dramatically. Cut back.',

    // Product tips
    'Check expiration dates on your products. Expired skincare can cause reactions.',
    'Less is more — you need a pea-sized amount of most serums.',
    'Pat, don\'t rub. Patting products into skin improves absorption.',
    'If a product stings (not tingles), stop using it. Your skin is telling you something.',
    'Niacinamide pairs well with almost everything and reduces pore appearance.',

    // Seasonal
    'In winter, switch from gel cleanser to cream cleanser to prevent dryness.',
    'Humid days? Use lighter products. Your skin produces more oil in heat.',
    'Post-shave: aloe vera gel calms razor burn better than alcohol-based aftershaves.',
    'Before a big event: don\'t try new products. Stick to what your skin already loves.',

    // Motivation
    'Looking good is a form of self-respect. You\'re investing in yourself.',
    'Your routine today is your results tomorrow. Keep going.',
    'The best routine is the one you actually stick to. Simplicity wins.',
    'You\'re already ahead of 90% of guys by having a skincare routine.',
] as const

export type DailyTip = typeof DAILY_TIPS[number]

/**
 * Get today's daily tip based on the day of the year.
 * Rotates through all tips before repeating.
 */
export function getDailyTip(): string {
    const start = new Date(new Date().getFullYear(), 0, 0).getTime()
    const dayOfYear = Math.floor((Date.now() - start) / 86_400_000)
    return DAILY_TIPS[dayOfYear % DAILY_TIPS.length]
}
