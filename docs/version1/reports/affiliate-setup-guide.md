# Affiliate Programs Setup Guide — GroomAI (Pakistan-Friendly)

> **Last Updated**: 2026-02-28
> **For**: GroomAI V1 Launch
> **Your Location**: Pakistan — all programs below accept Pakistani publishers

---

## Overview

GroomAI uses **20 affiliate products** across **5 display categories** and 3 affiliate networks. The products are shown to users grouped by category and personalized to their skin type, beard status, and preferences.

### Product Categorization (How Users See Them)

| Display Group | Products | Shown To |
|---|---|---|
| **Skincare Essentials** ✨ | 12 (cleansers, moisturizers, serums, SPF, toner, exfoliant, eye cream) | All users, filtered by skin type |
| **Hair & Styling** 💇 | 2 (shampoo, pomade) | All users |
| **Beard Care** 🧔 | 2 (beard oil, beard balm) | Only users with `has_beard: true` |
| **Shaving** 🪒 | 1 (shave cream) | All users |
| **Grooming Tools** ⚡ | 3 (2 trimmers, 1 Manscaped) | All users |

### How Recommendations Work

The app personalizes products using onboarding answers:
- **Skin type** (oily/dry/sensitive/combination/normal) → filters `suitableFor` / `notSuitableFor`
- **Has beard** → shows/hides Beard Care group
- **Budget range** → future filtering (wired, not yet active)
- Products sorted by **rating** within each group, max **3 per group** in home tab
- Routine editor matches products by **keyword** in step titles (e.g., "cleanser" step → CeraVe SA)

### 20 Products is Right for V1

Don't add more products yet. Here's why:
- The recommendation engine filters 20 down to ~8-12 per user based on their profile
- Each group shows max 3 — so users see a curated, not overwhelming selection
- After launch, use PostHog analytics (`affiliate_link_clicked` event) to see which categories convert best, then add 2-3 more in those categories

### Affiliate Links Are Disabled Until Approval

**`AFFILIATES_ENABLED` is set to `false`** in `constants/affiliateProducts.ts`. This means:
- Product cards still display (users see brand, name, price, rating)
- "Shop" button shows as "Coming Soon" — no broken links
- `openAffiliateLink()` silently returns without opening a URL
- You can submit to App Store / Play Store safely

**Once your Amazon Associates account is approved**, change one line:
```typescript
// constants/affiliateProducts.ts, line 10
export const AFFILIATES_ENABLED = true  // ← flip this
```

---

## Quick Start (Two Things To Do)

Once your accounts are approved:

| Step | Find | Replace With | Count |
|---|---|---|---|
| 1 | `YOUR_AMAZON_TAG` | Your Amazon Associates tag (e.g., `groomai-20`) | 19 URLs |
| 2 | `AFFILIATES_ENABLED = false` | `AFFILIATES_ENABLED = true` | 1 line |

The Manscaped URL already uses `groomai` as the ref code. Update it if your Awin code is different.

---

## 1. Amazon Associates (19 of 20 products)

Amazon Associates is the core affiliate program. **Pakistan is eligible** for the Amazon.com Associates program (international).

### Step 1: Sign Up

1. Go to **https://affiliate-program.amazon.com**
2. Click **"Join Now for Free"**
3. Sign in with your existing Amazon.com account (or create one)
4. Fill in your details:
   - **Account Name**: GroomAI
   - **Website/App**: Enter your App Store / Play Store URL (you can use a placeholder URL for now, like your domain)
   - **Preferred Store ID**: `groomai-20` (this becomes your tag)
5. For **"What are your websites or mobile apps about?"**: Select *Health & Beauty*, *Mobile App*
6. **Payment method**: For Pakistan, choose one of:
   - **Amazon Gift Card** (easiest — no bank restrictions)
   - **Check by mail** (takes 4-6 weeks)
   - **Direct deposit** (if you have a US bank account or use Payoneer — see tip below)

### Step 2: Get Your Associate Tag

After approval, your tag is shown in the top-left of the Associates dashboard. It looks like: `groomai-20`

### Step 3: Replace Tags in Code

Open `constants/affiliateProducts.ts` and do a global find-and-replace:

```
Find:    YOUR_AMAZON_TAG
Replace: groomai-20        ← (use YOUR actual tag)
```

This updates all 19 Amazon product URLs at once.

### Step 4: Verify Links Work

1. Open 3-4 URLs in a browser
2. Confirm they go to the correct Amazon product page
3. Confirm your tag appears in the URL (check the `tag=` parameter)
4. Test on both iOS and Android in-app browser

### Pro Tips for Pakistan

- **Payoneer + Amazon**: Sign up for [Payoneer](https://www.payoneer.com) to get a US bank account. Link it in Amazon Associates → Payment Settings. This lets you receive direct deposits in PKR.
- **$10 minimum payout**: Amazon pays when your balance reaches $10 (gift card) or $100 (check/deposit).
- **180-day qualification**: You must generate at least 3 qualifying sales within 180 days of signing up, or your account is closed. Start driving traffic early.
- **Product links are region-specific**: The URLs in the code link to amazon.com (US). If your users are mostly in Pakistan/India, consider also joining **Amazon.in Associates** and using geo-targeting (see Section 5 below).

---

## 2. Manscaped Affiliate Program (1 product)

Manscaped has their own affiliate program through **Awin** (also called Affiliate Window), which accepts international publishers including Pakistan.

### Step 1: Sign Up via Awin

1. Go to **https://www.awin.com/us/publishers**
2. Click **"Join Now"** and create a publisher account
3. During signup:
   - **Website type**: Mobile Application
   - **Category**: Health & Beauty / Men's Grooming
   - **Promotional methods**: Content/editorial, In-app
4. Once your Awin account is approved, search for **"Manscaped"** in the advertiser directory
5. Apply to the Manscaped program
6. After approval, you'll get an **Awin publisher ID** and can generate tracking links

### Step 2: Generate Your Manscaped Link

In the Awin dashboard:
1. Go to **Links & Tools → Link Builder**
2. Enter the destination URL: `https://www.manscaped.com`
3. Generate the tracking link — it will look like:
   ```
   https://www.awin1.com/cread.php?awinmid=XXXXX&awinaffid=YYYYY&ued=https://www.manscaped.com
   ```

### Step 3: Update the Code

In `constants/affiliateProducts.ts`, find the Manscaped product (id: `manscaped-lawn-mower-4`) and replace the `amazonUrl` with your Awin tracking link:

```typescript
// Replace this:
amazonUrl: 'https://manscaped.com/?ref=groomai',
// With your Awin link:
amazonUrl: 'https://www.awin1.com/cread.php?awinmid=XXXXX&awinaffid=YYYYY&ued=https://www.manscaped.com',
```

### Alternative: Impact.com

Manscaped also runs an affiliate program through **Impact.com**:
1. Go to **https://app.impact.com**
2. Sign up as a partner/publisher
3. Search for "Manscaped" and apply
4. Generate tracking links from their dashboard

---

## 3. Optional: Additional Affiliate Networks (More Revenue)

These networks work from Pakistan and carry grooming/beauty brands:

### ShareASale
- **URL**: https://www.shareasale.com
- **Brands**: Tiege Hanley, various grooming brands
- **Pakistan**: Yes, accepts international publishers
- **Signup**: Create publisher account → Search merchants → Apply per-brand
- **Good for**: If you want to add Tiege Hanley products later (the app already has `affiliateProgram: 'tiege'` as a type)

### CJ Affiliate (Commission Junction)
- **URL**: https://www.cj.com
- **Brands**: Many premium grooming/beauty brands
- **Pakistan**: Yes
- **Signup**: Apply as publisher → Browse advertisers → Join programs

### Rakuten Advertising
- **URL**: https://rakutenadvertising.com
- **Brands**: Large beauty retailers (Sephora partner network)
- **Pakistan**: Yes

### LTK (formerly rewardStyle/LIKEtoKNOW.it)
- **URL**: https://company.ltk.com
- **Brands**: Fashion and beauty focus
- **Pakistan**: Application-based, harder to get approved
- **Best for**: When your app has significant user traction

---

## 4. Payment Solutions for Pakistan

Since you're in Pakistan, here are the best ways to receive affiliate payments:

| Method | Works With | Setup |
|---|---|---|
| **Payoneer** | Amazon, Awin, CJ, ShareASale | [payoneer.com](https://www.payoneer.com) — get a US/EUR bank account, receive in PKR |
| **Wise (TransferWise)** | Amazon, Impact, most networks | [wise.com](https://wise.com) — multi-currency account |
| **Amazon Gift Cards** | Amazon Associates only | No setup needed — choose in payment settings |
| **Direct Bank Transfer** | Some networks | JazzCash/Easypaisa don't directly work — use Payoneer |

### Recommended Setup
1. **Create a Payoneer account first** — it takes 2-3 business days to verify
2. Use the Payoneer US bank details in **all** affiliate network payment settings
3. Withdraw from Payoneer to your Pakistani bank account (HBL, Meezan, etc.) in PKR

---

## 5. Geo-Targeting (Optional — Maximize Revenue)

Your users may be worldwide. `amazon.com` links only earn commissions on US purchases. To capture all regions:

### Option A: Amazon OneLink (Free)
1. In your Amazon Associates dashboard, go to **OneLink**
2. Add your Associate tags for other Amazon regions:
   - `amazon.co.uk` (UK) → separate Associates account
   - `amazon.in` (India) → separate Associates account
   - `amazon.de` (Germany), etc.
3. OneLink automatically redirects users to their local Amazon store with the correct tag

### Option B: Geniuslink (Paid — $5/mo)
- **URL**: https://geniuslink.com
- Automatically routes Amazon links to the user's local store
- Includes analytics and A/B testing
- Worth it once you have 1,000+ monthly affiliate clicks

---

## 6. Quick Reference — All 20 Products & Their URLs

After completing setup, verify each link opens correctly:

| # | Product | Program | URL Field |
|---|---|---|---|
| 1 | CeraVe SA Cleanser | Amazon | `amazon.com/dp/B00U1YCRD8?tag=YOUR_TAG` |
| 2 | CeraVe Hydrating Cleanser | Amazon | `amazon.com/dp/B01MSSDEPK?tag=YOUR_TAG` |
| 3 | La Roche-Posay Effaclar | Amazon | `amazon.com/dp/B01N7T7JKJ?tag=YOUR_TAG` |
| 4 | Neutrogena Oil-Free Moisturizer | Amazon | `amazon.com/dp/B003BMJGKE?tag=YOUR_TAG` |
| 5 | Cetaphil Moisturizing Cream | Amazon | `amazon.com/dp/B07GC74LL4?tag=YOUR_TAG` |
| 6 | Vanicream Lite Lotion | Amazon | `amazon.com/dp/B003XWG880?tag=YOUR_TAG` |
| 7 | The Ordinary Niacinamide | Amazon | `amazon.com/dp/B06VSX2B2J?tag=YOUR_TAG` |
| 8 | The Ordinary Hyaluronic Acid | Amazon | `amazon.com/dp/B01MQSOHQH?tag=YOUR_TAG` |
| 9 | EltaMD UV Clear SPF 46 | Amazon | `amazon.com/dp/B002MSN3QQ?tag=YOUR_TAG` |
| 10 | Cetaphil Sun SPF 50 | Amazon | `amazon.com/dp/B09B7MPP8J?tag=YOUR_TAG` |
| 11 | Paula's Choice BHA | Amazon | `amazon.com/dp/B00949CTQQ?tag=YOUR_TAG` |
| 12 | Thayers Witch Hazel | Amazon | `amazon.com/dp/B00016XJ4M?tag=YOUR_TAG` |
| 13 | Honest Amish Beard Balm | Amazon | `amazon.com/dp/B009NNFB0O?tag=YOUR_TAG` |
| 14 | Leven Rose Beard Oil | Amazon | `amazon.com/dp/B00M8SZ53Y?tag=YOUR_TAG` |
| 15 | MANSCAPED Lawn Mower 4.0 | Manscaped/Awin | `manscaped.com/?ref=groomai` |
| 16 | Philips Norelco 7500 | Amazon | `amazon.com/dp/B07YV9Z91P?tag=YOUR_TAG` |
| 17 | Head & Shoulders Clinical | Amazon | `amazon.com/dp/B0037Z7JC2?tag=YOUR_TAG` |
| 18 | American Crew Fiber | Amazon | `amazon.com/dp/B0007CXWC4?tag=YOUR_TAG` |
| 19 | eos Men's Shave Cream | Amazon | `amazon.com/dp/B07H5Q1Q7P?tag=YOUR_TAG` |
| 20 | CeraVe Eye Repair | Amazon | `amazon.com/dp/B01EI4G2QW?tag=YOUR_TAG` |

> **Important**: After replacing `YOUR_AMAZON_TAG`, open at least 5 links on your phone to verify they resolve to the correct product pages. Some ASINs may have changed — if a link 404s, search for the product on Amazon, copy the ASIN from the URL, and update `affiliateProducts.ts`.

---

## Checklist

- [ ] Sign up for Amazon Associates at affiliate-program.amazon.com
- [ ] Set up Payoneer account for payments
- [ ] Get your Amazon Associate tag (e.g., `groomai-20`)
- [ ] Find-and-replace `YOUR_AMAZON_TAG` → your tag in `constants/affiliateProducts.ts`
- [ ] Sign up for Awin / Impact for Manscaped affiliate
- [ ] Replace Manscaped URL with your tracking link (if different from `groomai`)
- [ ] Flip `AFFILIATES_ENABLED = true` in `constants/affiliateProducts.ts`
- [ ] Test 5+ links on iOS and Android
- [ ] Verify products show in categorized groups on home tab
- [ ] (Optional) Set up Amazon OneLink for geo-targeting
- [ ] (Optional) Sign up for ShareASale for Tiege Hanley products
