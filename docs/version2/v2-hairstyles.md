# GroomAI — Hairstyle Expansion for Version 2
> These are real, in-demand styles — but niche, seasonal, or require more complex app support. Save these for v2 after you have real user data telling you what to prioritize.

---

## 🎯 Why These Are v2, Not v1
- Some require **color data** (highlighted, dyed styles) — needs a new database field
- Some are **highly niche** — real demand but smaller audience
- Some are **culturally specific** — important to add but not first priority
- Some require **more complex barber translator cards** (e.g. Viking braids need multi-step instructions)

---

## ✂️ Short Styles

| # | Style Name | Filename | Why v2 |
|---|-----------|----------|--------|
| 69 | **Textured Undercut + Fade** | `textured-undercut-fade.png` | Undercut is in your list but not the textured-on-top version with fade — trending but niche |
| 70 | **Shaved Head (Clean Bald)** | `shaved-head.png` | Popular especially for men with thinning hair. Simple but needs its own category in app |
| 71 | **Fade + Beard Design** | `fade-beard-design.png` | Razor art in the beard — trending but requires separate beard art database |
| 72 | **Burst Fade Mohawk** | `burst-fade-mohawk.png` | The burst fade is a specific technique — trending in 2026 but niche enough for v2 |
| 73 | **360 Waves + Hard Part** | `360-waves-hard-part.png` | Variation of your existing waves styles — v2 expansion |

---

## 🌊 Medium Styles

| # | Style Name | Filename | Why v2 |
|---|-----------|----------|--------|
| 74 | **Modern Beatles / Mop Top** | `mop-top.png` | Retro revival trend for 2026 — niche but growing, specifically square/rectangular face shapes |
| 75 | **Textured Pompadour** | `textured-pompadour.png` | You have classic pompadour — this is the 2026 softer, airy version. Small audience overlap |
| 76 | **French Crop + Beard Combo** | `french-crop-beard-combo.png` | Combo style — needs combined beard + hair card in barber translator |
| 77 | **Side Swept Fringe** | `side-swept-fringe.png` | Classic but different from curtains — sweep entirely to one side. Popular in professional settings |
| 78 | **Wolf Cut** | `wolf-cut.png` | Shag meets mullet hybrid, very popular mid-2025 — still trending but cooling slightly, perfect v2 |
| 79 | **Hime Cut (Modern)** | `hime-cut-modern.png` | Japanese-inspired straight fringe with long sides — niche but growing in style-conscious users |

---

## 🦁 Long Styles

| # | Style Name | Filename | Why v2 |
|---|-----------|----------|--------|
| 80 | **Viking / Warrior Braids** | `viking-braids.png` | Needs multi-step barber translator card — complex enough to warrant dedicated v2 feature |
| 81 | **Long Hair + Undercut** | `long-undercut.png` | Long hair on top with shaved undercut underneath — dramatic look, niche audience |
| 82 | **Long Curly Side Part** | `long-curly-side-part.png` | Deep side part in long curly hair — specific style, builds on v1 long curly base |
| 83 | **Waist-Length / Very Long Flow** | `very-long-flow.png` | Men with very long hair (past shoulder) — small but passionate audience |
| 84 | **Locs — Freeform** | `freeform-locs.png` | Different from your loc fade (#21) — freeform unlocked locs without fade. Needs separate loc care section in app |
| 85 | **Long Hair with Headband** | `long-hair-headband.png` | Styling guide rather than cut — better suited to v2 "daily styles" section |

---

## 🎨 Color / Highlight Styles (Requires New Database Field)

> These need a `has_color: true` flag and a new filter in the app UI. Add in v2 when you build the color filter feature.

| # | Style Name | Filename | Notes |
|---|-----------|----------|-------|
| 86 | **Bleached Tips / Money Piece** | `bleached-tips.png` | Front fringe bleached — huge trend with Gen Z |
| 87 | **Natural Dye — Red/Auburn** | `auburn-dye.png` | Most popular color direction for men in 2025–2026 |
| 88 | **Silver / Grey Dye (Fashion)** | `silver-grey-dye.png` | Intentional grey — popularized by fashion influencers |
| 89 | **Two-Tone Braids** | `two-tone-braids.png` | Colored braids — needs color + braid combination support |

---

## 🌍 Cultural Expansion Styles

> Your v1 list covers Black hair well. These expand coverage for South Asian, East Asian, and Latin hair communities.

| # | Style Name | Filename | Community |
|---|-----------|----------|-----------|
| 90 | **Pakistani/Indian Classic Side Part** | `south-asian-side-part.png` | South Asian men — most common requested style in South Asia |
| 91 | **Korean Two-Block Cut** | `two-block-cut.png` | East Asian — the #1 men's cut in Korea/Japan, growing globally |
| 92 | **Fluffy Comma Hair** | `comma-hair.png` | K-pop inspired — comma-shaped fringe, huge with Gen Z globally |
| 93 | **Taper + Waves (Latino Fade)** | `latino-fade-waves.png` | The signature Latino barbershop style — slight variation of your existing waves |

---

## 📱 App Features Needed Before These Can Ship

Some v2 styles need these app updates first:

1. **Color Filter** — Add `has_color` boolean to hairstyles table. Add "Show color styles" toggle in Barber Translator filters.
2. **Loc Care Section** — Freeform locs and colored locs need a dedicated care routine separate from regular hair.
3. **Multi-Step Barber Cards** — Viking braids and complex styles need step-by-step barber instructions, not just a single card.
4. **Cultural/Ethnicity Filter** — Let users filter by hair community (East Asian, South Asian, Black, Latino, etc.) — massive trust-builder.
5. **"Growing Out" Journey Mode** — A guided progression from current length to target style. Perfect for curtain fringe, long flow, man bun journeys.

---

## 📊 v2 Totals

| Category | v2 Additions |
|----------|-------------|
| Short | 5 |
| Medium | 6 |
| Long | 6 |
| Color Styles | 4 |
| Cultural Expansion | 4 |
| **Total New in v2** | **25 styles** |
| **App Grand Total** | **~93 styles** |

---

## 💡 Strategic Note
Don't add all 25 in one update. After v1 ships, check your **Supabase analytics** — which styles are being tapped most? Which face shapes are most common in your user base? Build v2 around what real users are actually searching for, not assumptions.
