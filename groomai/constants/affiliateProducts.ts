// constants/affiliateProducts.ts
// Phase 9 — Affiliate Product Database
// Replace amazonUrl values with your actual Amazon Associates affiliate URLs

export type ProductCategory =
    | 'cleanser'
    | 'moisturizer'
    | 'serum'
    | 'spf'
    | 'beard_oil'
    | 'beard_balm'
    | 'trimmer'
    | 'shampoo'
    | 'styling'
    | 'toner'
    | 'exfoliant'
    | 'eye_cream'
    | 'razor'
    | 'shave_cream'

export interface AffiliateProduct {
    id: string
    name: string
    brand: string
    category: ProductCategory
    suitableFor: string[]
    notSuitableFor: string[]
    amazonUrl: string
    price: string
    rating: number
    reviewCount: number
    affiliateProgram: 'amazon' | 'manscaped' | 'tiege'
    routineKeywords?: string[] // words in step titles that match this product
}

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
    // ── Cleansers ──────────────────────────────────────────────────────────────
    {
        id: 'cerave-sa-cleanser',
        name: 'CeraVe SA Cleanser',
        brand: 'CeraVe',
        category: 'cleanser',
        suitableFor: ['oily', 'combination', 'acne_prone', 'normal'],
        notSuitableFor: ['sensitive', 'dry'],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_cerave-sa',
        price: '$14.99',
        rating: 4.7,
        reviewCount: 28400,
        affiliateProgram: 'amazon',
        routineKeywords: ['cleanser', 'cleanse', 'wash face', 'salicylic'],
    },
    {
        id: 'cerave-hydrating-cleanser',
        name: 'CeraVe Hydrating Cleanser',
        brand: 'CeraVe',
        category: 'cleanser',
        suitableFor: ['dry', 'sensitive', 'normal'],
        notSuitableFor: ['oily'],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_cerave-hyd',
        price: '$12.99',
        rating: 4.8,
        reviewCount: 45200,
        affiliateProgram: 'amazon',
        routineKeywords: ['cleanser', 'cleanse', 'wash face', 'cream cleanser'],
    },
    {
        id: 'la-roche-posay-effaclar',
        name: 'La Roche-Posay Effaclar Gel',
        brand: 'La Roche-Posay',
        category: 'cleanser',
        suitableFor: ['oily', 'acne_prone'],
        notSuitableFor: ['dry', 'sensitive'],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_lrp-effaclar',
        price: '$19.99',
        rating: 4.6,
        reviewCount: 18700,
        affiliateProgram: 'amazon',
        routineKeywords: ['cleanser', 'foaming', 'gel cleanser'],
    },
    // ── Moisturizers ───────────────────────────────────────────────────────────
    {
        id: 'neutrogena-oil-free-moisturizer',
        name: 'Neutrogena Oil-Free Moisturizer',
        brand: 'Neutrogena',
        category: 'moisturizer',
        suitableFor: ['oily', 'combination'],
        notSuitableFor: ['dry'],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_neutrogena-moist',
        price: '$11.99',
        rating: 4.5,
        reviewCount: 12300,
        affiliateProgram: 'amazon',
        routineKeywords: ['moisturizer', 'moisture', 'hydrate', 'light moisturizer'],
    },
    {
        id: 'cetaphil-moisturizing-cream',
        name: 'Cetaphil Moisturizing Cream',
        brand: 'Cetaphil',
        category: 'moisturizer',
        suitableFor: ['dry', 'sensitive', 'normal'],
        notSuitableFor: ['oily'],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_cetaphil-cream',
        price: '$13.99',
        rating: 4.7,
        reviewCount: 32100,
        affiliateProgram: 'amazon',
        routineKeywords: ['moisturizer', 'cream', 'heavy cream', 'night cream'],
    },
    {
        id: 'vanicream-lite-lotion',
        name: 'Vanicream Lite Lotion',
        brand: 'Vanicream',
        category: 'moisturizer',
        suitableFor: ['sensitive', 'dry', 'normal', 'combination'],
        notSuitableFor: [],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_vanicream',
        price: '$10.99',
        rating: 4.6,
        reviewCount: 9800,
        affiliateProgram: 'amazon',
        routineKeywords: ['moisturizer', 'lotion', 'sensitive', 'fragrance-free'],
    },
    // ── Serums ─────────────────────────────────────────────────────────────────
    {
        id: 'the-ordinary-niacinamide',
        name: 'The Ordinary Niacinamide 10%',
        brand: 'The Ordinary',
        category: 'serum',
        suitableFor: ['oily', 'combination', 'acne_prone', 'normal'],
        notSuitableFor: [],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_ordinary-niacinamide',
        price: '$7.90',
        rating: 4.5,
        reviewCount: 67400,
        affiliateProgram: 'amazon',
        routineKeywords: ['serum', 'niacinamide', 'toner', 'pore'],
    },
    {
        id: 'the-ordinary-hyaluronic',
        name: 'The Ordinary Hyaluronic Acid 2%',
        brand: 'The Ordinary',
        category: 'serum',
        suitableFor: ['dry', 'normal', 'sensitive', 'combination'],
        notSuitableFor: [],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_ordinary-ha',
        price: '$8.90',
        rating: 4.5,
        reviewCount: 52300,
        affiliateProgram: 'amazon',
        routineKeywords: ['serum', 'hyaluronic acid', 'hydration', 'essence'],
    },
    // ── SPF ────────────────────────────────────────────────────────────────────
    {
        id: 'eltamd-uv-clear-spf46',
        name: 'EltaMD UV Clear SPF 46',
        brand: 'EltaMD',
        category: 'spf',
        suitableFor: ['acne_prone', 'oily', 'combination', 'sensitive'],
        notSuitableFor: [],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_eltamd-uvclr',
        price: '$39.00',
        rating: 4.7,
        reviewCount: 28900,
        affiliateProgram: 'amazon',
        routineKeywords: ['spf', 'sunscreen', 'sun protection', 'spf 30', 'spf 50'],
    },
    {
        id: 'cetaphil-sun-spf50',
        name: 'Cetaphil Sun SPF 50',
        brand: 'Cetaphil',
        category: 'spf',
        suitableFor: ['sensitive', 'dry', 'normal'],
        notSuitableFor: [],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_cetaphil-spf',
        price: '$17.99',
        rating: 4.4,
        reviewCount: 7200,
        affiliateProgram: 'amazon',
        routineKeywords: ['spf', 'sunscreen', 'sun protection'],
    },
    // ── Exfoliants ─────────────────────────────────────────────────────────────
    {
        id: 'paula-choice-bha',
        name: "Paula's Choice BHA Exfoliant",
        brand: "Paula's Choice",
        category: 'exfoliant',
        suitableFor: ['oily', 'combination', 'acne_prone'],
        notSuitableFor: ['sensitive', 'dry'],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_paulaschoice-bha',
        price: '$32.00',
        rating: 4.6,
        reviewCount: 41200,
        affiliateProgram: 'amazon',
        routineKeywords: ['exfoliant', 'bha', 'salicylic acid', 'pore', 'exfoliate'],
    },
    // ── Toner ──────────────────────────────────────────────────────────────────
    {
        id: 'thayers-witch-hazel',
        name: 'Thayers Alcohol-Free Witch Hazel Toner',
        brand: 'Thayers',
        category: 'toner',
        suitableFor: ['oily', 'combination', 'normal'],
        notSuitableFor: ['sensitive', 'dry'],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_thayers-toner',
        price: '$10.99',
        rating: 4.6,
        reviewCount: 43700,
        affiliateProgram: 'amazon',
        routineKeywords: ['toner', 'witch hazel', 'balance skin'],
    },
    // ── Beard ──────────────────────────────────────────────────────────────────
    {
        id: 'honest-amish-beard-balm',
        name: 'Honest Amish Classic Beard Balm',
        brand: 'Honest Amish',
        category: 'beard_balm',
        suitableFor: ['all'],
        notSuitableFor: [],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_honestamish-balm',
        price: '$12.95',
        rating: 4.5,
        reviewCount: 34500,
        affiliateProgram: 'amazon',
        routineKeywords: ['beard balm', 'beard', 'beard moisturizer', 'beard care'],
    },
    {
        id: 'leven-rose-beard-oil',
        name: 'Leven Rose Pure Beard Oil',
        brand: 'Leven Rose',
        category: 'beard_oil',
        suitableFor: ['all'],
        notSuitableFor: [],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_levenrose-oil',
        price: '$14.95',
        rating: 4.6,
        reviewCount: 21800,
        affiliateProgram: 'amazon',
        routineKeywords: ['beard oil', 'beard serum', 'beard', 'condition beard'],
    },
    // ── Trimmers ───────────────────────────────────────────────────────────────
    {
        id: 'manscaped-lawn-mower-4',
        name: 'MANSCAPED The Lawn Mower 4.0',
        brand: 'MANSCAPED',
        category: 'trimmer',
        suitableFor: ['all'],
        notSuitableFor: [],
        amazonUrl: 'https://manscaped.com/?ref=REPLACE_TAG',
        price: '$69.99',
        rating: 4.6,
        reviewCount: 89200,
        affiliateProgram: 'manscaped',
        routineKeywords: ['trim', 'trimmer', 'groom', 'body'],
    },
    {
        id: 'philips-beard-trimmer',
        name: 'Philips Norelco Beard Trimmer 7500',
        brand: 'Philips',
        category: 'trimmer',
        suitableFor: ['all'],
        notSuitableFor: [],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_philips-trimmer',
        price: '$59.99',
        rating: 4.5,
        reviewCount: 52300,
        affiliateProgram: 'amazon',
        routineKeywords: ['trimmer', 'beard trim', 'shave', 'electric'],
    },
    // ── Hair ───────────────────────────────────────────────────────────────────
    {
        id: 'head-shoulders-clinical',
        name: 'Head & Shoulders Clinical Strength',
        brand: 'Head & Shoulders',
        category: 'shampoo',
        suitableFor: ['all'],
        notSuitableFor: [],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_head-shoulders',
        price: '$16.99',
        rating: 4.5,
        reviewCount: 31200,
        affiliateProgram: 'amazon',
        routineKeywords: ['shampoo', 'wash hair', 'scalp', 'dandruff'],
    },
    {
        id: 'american-crew-fiber',
        name: 'American Crew Fiber Pomade',
        brand: 'American Crew',
        category: 'styling',
        suitableFor: ['all'],
        notSuitableFor: [],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_amcrew-fiber',
        price: '$18.00',
        rating: 4.6,
        reviewCount: 28400,
        affiliateProgram: 'amazon',
        routineKeywords: ['styling', 'pomade', 'clay', 'style hair', 'fiber'],
    },
    // ── Shaving ────────────────────────────────────────────────────────────────
    {
        id: 'eos-shave-cream',
        name: "Eos Men's Shave Cream",
        brand: 'eos',
        category: 'shave_cream',
        suitableFor: ['all'],
        notSuitableFor: [],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_eos-shave',
        price: '$9.99',
        rating: 4.4,
        reviewCount: 8700,
        affiliateProgram: 'amazon',
        routineKeywords: ['shave cream', 'shaving', 'razor', 'wet shave'],
    },
    // ── Eye cream ──────────────────────────────────────────────────────────────
    {
        id: 'cerave-eye-repair',
        name: 'CeraVe Eye Repair Cream',
        brand: 'CeraVe',
        category: 'eye_cream',
        suitableFor: ['all'],
        notSuitableFor: [],
        amazonUrl: 'https://amzn.to/REPLACE_TAG_cerave-eye',
        price: '$14.99',
        rating: 4.4,
        reviewCount: 12300,
        affiliateProgram: 'amazon',
        routineKeywords: ['eye cream', 'dark circles', 'under eye'],
    },
]
