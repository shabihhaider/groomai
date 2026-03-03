# Affiliate System

## Overview
The affiliate system is your **passive revenue layer** on top of subscriptions. Every product recommendation in the app (routine steps, skin analysis, product scanner, barber card) can link to an affiliate product. When a user clicks and buys, you earn a commission.

Done right, this feels helpful and personalized — not like advertising.

---

## Revenue Potential

| Product Category | Avg Commission | Realistic Monthly Revenue (10k users) |
|---|---|---|
| Skincare (Amazon) | 4–8% | $500–2,000 |
| Hair products | 4–8% | $300–1,000 |
| Trimmers/Shavers | 3–6% | $500–1,500 |
| Beard oil/grooming | 6–10% | $200–600 |
| **Total estimate** | | **$1,500–5,100/month** |

---

## Affiliate Programs to Join

| Program | Commission | Best For |
|---|---|---|
| Amazon Associates | 3–8% | Everything — widest catalog |
| AWIN / Partnerize | Variable | Premium grooming brands |
| Manscaped | 10–20% | Trimmers, grooming kits |
| Tiege Hanley | 10% | Men's skincare subscription |
| Dollar Shave Club | $10 per signup | Razors, grooming basics |
| CeraVe / L'Oreal (via AWIN) | 5–8% | Skincare |

Start with **Amazon Associates** — it covers everything and is easy to get approved.

---

## How Affiliate Links Work in the App

1. User has `oily` skin + `acne_prone` concern
2. Home tab "Products For You" section shows personalized recommendations
3. User taps a product card → link opens Amazon with your affiliate tag appended
4. User buys (doesn't even have to be the same product) → you earn commission
5. App tracks the click in `affiliate_clicks` table

> **Note (v1 change):** Inline affiliate product cards were **removed from the routine editor** (`routine-editor.tsx`) to keep the step-completion experience clean and distraction-free. The Home tab "Products For You" section is now the primary affiliate placement. The `AffiliateProductCard` component still exists and is used on the Home tab.

**Critical:** Amazon's cookie is 24 hours. Any purchase within 24 hours of clicking your link earns you commission.

---

## Affiliate Product Database (`constants/affiliateProducts.ts`)

```typescript
export interface AffiliateProduct {
  id: string
  name: string
  brand: string
  category: 'cleanser' | 'moisturizer' | 'serum' | 'spf' | 'beard_oil' | 'trimmer' | 'shampoo' | 'styling' | 'toner' | 'exfoliant'
  suitableFor: string[]       // skin types: ['oily', 'combination', 'acne_prone']
  notSuitableFor: string[]    // skin types to exclude
  amazonUrl: string           // With your affiliate tag
  price: string               // Display price
  imageUrl: string
  rating: number
  reviewCount: number
  affiliateProgram: 'amazon' | 'manscaped' | 'tiege'
}

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  // Cleansers
  {
    id: 'cerave-sa-cleanser',
    name: 'CeraVe SA Cleanser',
    brand: 'CeraVe',
    category: 'cleanser',
    suitableFor: ['oily', 'combination', 'acne_prone', 'normal'],
    notSuitableFor: ['sensitive', 'dry'],
    amazonUrl: 'https://amzn.to/YOUR_TAG_cerave-sa',
    price: '$14.99',
    imageUrl: 'https://...',
    rating: 4.7,
    reviewCount: 28400,
    affiliateProgram: 'amazon'
  },
  {
    id: 'cerave-hydrating-cleanser',
    name: 'CeraVe Hydrating Cleanser',
    brand: 'CeraVe',
    category: 'cleanser',
    suitableFor: ['dry', 'sensitive', 'normal'],
    notSuitableFor: ['oily'],
    amazonUrl: 'https://amzn.to/YOUR_TAG_cerave-hyd',
    price: '$12.99',
    imageUrl: 'https://...',
    rating: 4.8,
    reviewCount: 45200,
    affiliateProgram: 'amazon'
  },
  {
    id: 'neutrogena-oil-free',
    name: 'Neutrogena Oil-Free Moisturizer',
    brand: 'Neutrogena',
    category: 'moisturizer',
    suitableFor: ['oily', 'combination'],
    notSuitableFor: ['dry'],
    amazonUrl: 'https://amzn.to/YOUR_TAG_neutrogena-moisturizer',
    price: '$11.99',
    imageUrl: 'https://...',
    rating: 4.5,
    reviewCount: 12300,
    affiliateProgram: 'amazon'
  },
  {
    id: 'manscaped-lawn-mower',
    name: 'MANSCAPED The Lawn Mower 4.0',
    brand: 'MANSCAPED',
    category: 'trimmer',
    suitableFor: ['all'],
    notSuitableFor: [],
    amazonUrl: 'https://manscaped.com/?ref=YOUR_TAG',
    price: '$69.99',
    imageUrl: 'https://...',
    rating: 4.6,
    reviewCount: 89200,
    affiliateProgram: 'manscaped'
  },
  // ... 50+ more products across all categories
]
```

---

## Product Recommendation Engine

```typescript
// services/affiliate.service.ts
import { AFFILIATE_PRODUCTS } from '@/constants/affiliateProducts'

export const affiliateService = {
  getRecommendationsForProfile(profile: {
    skin_type: string
    skin_concerns: string[]
    budget_range: string
    has_beard: boolean
  }): AffiliateProduct[] {
    return AFFILIATE_PRODUCTS.filter(product => {
      // Must be suitable for their skin type
      const suitableForSkin =
        product.suitableFor.includes(profile.skin_type) ||
        product.suitableFor.includes('all')

      // Must not be excluded for their skin type
      const notExcluded = !product.notSuitableFor.includes(profile.skin_type)

      // Beard products only if user has beard
      if (product.category === 'beard_oil' && !profile.has_beard) return false

      return suitableForSkin && notExcluded
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10)  // Top 10 recommendations
  },

  getProductForRoutineStep(
    stepTitle: string,
    skinType: string
  ): AffiliateProduct | undefined {
    const categoryMap: Record<string, string> = {
      'cleanser': 'cleanser',
      'moisturizer': 'moisturizer',
      'serum': 'serum',
      'spf': 'spf',
      'beard oil': 'beard_oil',
      'toner': 'toner',
    }

    const category = Object.entries(categoryMap).find(
      ([key]) => stepTitle.toLowerCase().includes(key)
    )?.[1]

    if (!category) return undefined

    return AFFILIATE_PRODUCTS.find(
      p => p.category === category &&
      (p.suitableFor.includes(skinType) || p.suitableFor.includes('all'))
    )
  },

  async trackClick(userId: string, product: AffiliateProduct, source: string) {
    await supabase.from('affiliate_clicks').insert({
      user_id: userId,
      product_id: product.id,
      product_name: product.name,
      affiliate_url: product.amazonUrl,
      source
    })
  },

  async openAffiliateLink(userId: string, product: AffiliateProduct, source: string) {
    await this.trackClick(userId, product, source)
    Linking.openURL(product.amazonUrl)
  }
}
```

---

## Affiliate Link Component

```tsx
// components/ui/AffiliateProductCard.tsx
import { Pressable, View, Text, Image, StyleSheet } from 'react-native'
import { affiliateService } from '@/services/affiliate.service'
import { useUserStore } from '@/stores/user.store'
import * as Haptics from 'expo-haptics'

interface AffiliateProductCardProps {
  product: AffiliateProduct
  source: string
  compact?: boolean
}

export function AffiliateProductCard({ product, source, compact }: AffiliateProductCardProps) {
  const { user } = useUserStore()

  async function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await affiliateService.openAffiliateLink(user!.id, product, source)
  }

  if (compact) {
    return (
      <Pressable onPress={handlePress} style={styles.compact}>
        <Text style={styles.compactEmoji}>💡</Text>
        <Text style={styles.compactText}>Try: {product.name}</Text>
        <Text style={styles.compactPrice}>{product.price}</Text>
        <Text style={styles.compactArrow}>→</Text>
      </Pressable>
    )
  }

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.meta}>
          <Text style={styles.rating}>★ {product.rating}</Text>
          <Text style={styles.price}>{product.price}</Text>
        </View>
      </View>
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  compact: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: 10,
    padding: 12, marginTop: 8,
    borderWidth: 1, borderColor: '#C9A84C22'
  },
  compactEmoji: { marginRight: 8 },
  compactText: { flex: 1, color: '#A0A0A0', fontSize: 13 },
  compactPrice: { color: '#C9A84C', fontSize: 13, fontWeight: '600', marginRight: 8 },
  compactArrow: { color: '#C9A84C' },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#111111', borderRadius: 12, padding: 12
  },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  brand: { color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { color: '#FFF', fontSize: 14, fontWeight: '600', marginVertical: 2 },
  meta: { flexDirection: 'row', gap: 12 },
  rating: { color: '#C9A84C', fontSize: 12 },
  price: { color: '#A0A0A0', fontSize: 12 },
  arrow: { color: '#555', fontSize: 18 }
})
```

---

## Where Affiliate Links Appear in the App

| Location | Trigger | How It Looks |
|---|---|---|
| Routine steps | Every step that mentions a product | Compact card below step |
| Skin analysis results | After scan, in recommendations | Product card in results |
| Product scanner | After scan shows "better alternative" | Side-by-side comparison card |
| AI routine | GPT-generated steps include product suggestions | Compact card |
| Home screen "For You" | Daily personalized product tip | Card in home feed |
| Profile → "My Kit" | User's saved/recommended products | Full product list |

---

## Analytics Dashboard (Use PostHog)

Track these events to optimize revenue:

```typescript
// Track key affiliate events
posthog.capture('affiliate_link_clicked', {
  product_id: product.id,
  product_name: product.name,
  source,
  skin_type: profile.skin_type,
  subscription_status: profile.subscription_status
})

posthog.capture('routine_step_completed', {
  step_category: step.category,
  has_affiliate: !!step.product_affiliate_url
})
```

Use these metrics to answer:
- Which products get the most clicks?
- Which screen drives most affiliate revenue?
- Do premium users click more affiliate links than free users?
- Which skin type buys most?
