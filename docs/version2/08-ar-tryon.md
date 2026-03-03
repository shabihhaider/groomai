# AR Hairstyle & Beard Try-On

> Status: **v2 scope** (not part of v1 release).
>
> This document was authored during the v1 planning phase and is kept as the spec for the v2 implementation.

## Overview
The AR try-on is the **wow feature** — the one users show their friends, post on social media, and remember the app for. It's a premium-only feature. Built on DeepAR SDK which handles all the heavy ML lifting.

---

## How DeepAR Works — Implementation Notes

DeepAR does 3 things under the hood:
1. **Face mesh** — maps 68+ 3D points on the user's face in real-time
2. **Hair segmentation** — detects real hair and can recolor or replace it
3. **Effect anchoring** — attaches 3D beard/hair models to face landmarks so they move naturally with the head

You don't train any ML model. You just:
1. Get a DeepAR license key (free for dev)
2. Download or commission `.deepar` effect files (one per hairstyle/beard style)
3. Load effects in the SDK

---

## Setup

### 1. Install DeepAR SDK
```bash
npm install react-native-deepar
npx pod-install  # iOS
```

### 2. Add License Keys
```typescript
// lib/deepar.ts
import { Platform } from 'react-native'

export const DEEPAR_CONFIG = {
  licenseKeyIOS: process.env.EXPO_PUBLIC_DEEPAR_IOS_KEY!,
  licenseKeyAndroid: process.env.EXPO_PUBLIC_DEEPAR_ANDROID_KEY!,
  // Use Platform.select in the component — see ar-tryon.tsx usage below
}
```

### 3. Store Effect Files
```
assets/
  deepar-effects/
    hairstyles/
      mid-fade-01.deepar
      classic-taper.deepar
      french-crop.deepar
      ...
    beards/
      full-beard.deepar
      stubble.deepar
      goatee.deepar
      ...
```

---

## AR Try-On Screen (`app/ar-tryon.tsx`)

```
Layout:
  Full screen camera view (no chrome)
  
  Floating controls overlay:
  
  [← Back]          [📸 Screenshot]    [↩ Reset]
  
  [Bottom Sheet — slides up from bottom]
  
    Hair    Beard    Color
    [Tabs]
    
    Horizontal scroll of effect thumbnails:
    [Mid Fade] [Classic] [French Crop] [Buzz Cut] ...
    
    Active effect highlighted with gold border
    
    [🗂 Barber Card]  ← shortcut to generate card for active style
```

---

## Full Implementation

```tsx
// app/ar-tryon.tsx
import { useRef, useState, useEffect } from 'react'
import { View, StyleSheet, Pressable, Text, ScrollView, Image } from 'react-native'
import DeepAR from 'react-native-deepar'
import * as MediaLibrary from 'expo-media-library'
import * as Haptics from 'expo-haptics'
import Animated, { SlideInDown } from 'react-native-reanimated'
import { router, useLocalSearchParams } from 'expo-router'
import { DEEPAR_CONFIG } from '@/lib/deepar'
import { HAIRSTYLES } from '@/constants/hairstyles'
import { useUserStore } from '@/stores/user.store'

type ARTab = 'hair' | 'beard' | 'color'

export default function ARTryOnScreen() {
  const deepARRef = useRef<DeepAR>(null)
  const { hairstyleId } = useLocalSearchParams<{ hairstyleId?: string }>()
  const [activeTab, setActiveTab] = useState<ARTab>('hair')
  const [activeEffect, setActiveEffect] = useState<string | null>(null)
  const [isSwitching, setIsSwitching] = useState(false)
  const { profile } = useUserStore()

  // Pre-select hairstyle if navigated from hairstyle detail
  useEffect(() => {
    if (hairstyleId) {
      const style = HAIRSTYLES.find(s => s.id === hairstyleId)
      if (style?.deepArEffectId) switchEffect(style.deepArEffectId)
    }
  }, [hairstyleId])

  async function switchEffect(effectId: string) {
    if (isSwitching) return
    setIsSwitching(true)
    Haptics.selectionAsync()
    
    try {
      await deepARRef.current?.switchEffect({
        slot: 'effect',
        path: `deepar-effects/hairstyles/${effectId}.deepar`
      })
      setActiveEffect(effectId)
    } catch (e) {
      console.error('Effect switch failed:', e)
    } finally {
      setIsSwitching(false)
    }
  }

  async function clearEffect() {
    await deepARRef.current?.clearEffect({ slot: 'effect' })
    setActiveEffect(null)
    Haptics.selectionAsync()
  }

  async function takeScreenshot() {
    const { status } = await MediaLibrary.requestPermissionsAsync()
    if (status !== 'granted') return
    
    deepARRef.current?.takeScreenshot()
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    // DeepAR callback handles saving
  }

  function onScreenshotTaken(path: string) {
    MediaLibrary.saveToLibraryAsync(path)
    // Show toast: "Saved to gallery!"
  }

  return (
    <View style={styles.container}>
      <DeepAR
        ref={deepARRef}
        apiKey={Platform.select({
          ios: DEEPAR_CONFIG.licenseKeyIOS,
          android: DEEPAR_CONFIG.licenseKeyAndroid,
        })!}
        style={StyleSheet.absoluteFill}
        onScreenshotTaken={onScreenshotTaken}
        onError={(e) => console.error('DeepAR error:', e)}
      />

      {/* Top controls */}
      <View style={styles.topControls}>
        <Pressable onPress={() => router.back()} style={styles.topBtn}>
          <Text style={styles.topBtnText}>✕</Text>
        </Pressable>
        <Pressable onPress={takeScreenshot} style={styles.topBtn}>
          <Text style={styles.topBtnText}>📸</Text>
        </Pressable>
        <Pressable onPress={clearEffect} style={styles.topBtn}>
          <Text style={styles.topBtnText}>↩</Text>
        </Pressable>
      </View>

      {/* Bottom sheet */}
      <Animated.View entering={SlideInDown.duration(400)} style={styles.bottomSheet}>
        {/* Tabs */}
        <View style={styles.tabs}>
          {(['hair', 'beard', 'color'] as ARTab[]).map(tab => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Effect thumbnails */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.effectsScroll}>
          {getEffectsForTab(activeTab).map(effect => (
            <Pressable
              key={effect.id}
              onPress={() => switchEffect(effect.deepArEffectId)}
              style={[
                styles.effectThumb,
                activeEffect === effect.deepArEffectId && styles.activeThumb
              ]}
            >
              <Image source={{ uri: effect.thumbnailUrl }} style={styles.thumbImage} />
              <Text style={styles.thumbLabel}>{effect.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Barber card shortcut */}
        {activeEffect && (
          <Pressable
            style={styles.barberCardBtn}
            onPress={() => {
              const style = HAIRSTYLES.find(s => s.deepArEffectId === activeEffect)
              if (style) router.push(`/hairstyle-detail?id=${style.id}&showCard=true`)
            }}
          >
            <Text style={styles.barberCardBtnText}>🗂 Generate Barber Card for This Style</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  )
}

function getEffectsForTab(tab: ARTab) {
  if (tab === 'hair') return HAIRSTYLES.filter(s => s.category !== 'beard')
  if (tab === 'beard') return HAIRSTYLES.filter(s => s.category === 'beard')
  return [] // Color tab — future feature
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topControls: {
    position: 'absolute', top: 60, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20
  },
  topBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center'
  },
  topBtnText: { color: '#fff', fontSize: 18 },
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,10,10,0.92)',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 16, paddingBottom: 40
  },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16 },
  tab: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
    borderRadius: 8, marginHorizontal: 4
  },
  activeTab: { backgroundColor: '#C9A84C' },
  tabText: { color: '#888', fontSize: 14, fontWeight: '600' },
  activeTabText: { color: '#000' },
  effectsScroll: { paddingHorizontal: 16 },
  effectThumb: {
    width: 80, marginRight: 12, alignItems: 'center',
    borderRadius: 12, overflow: 'hidden'
  },
  activeThumb: { borderWidth: 2, borderColor: '#C9A84C' },
  thumbImage: { width: 80, height: 80, borderRadius: 10 },
  thumbLabel: { color: '#fff', fontSize: 11, marginTop: 4, textAlign: 'center' },
  barberCardBtn: {
    marginHorizontal: 20, marginTop: 16,
    backgroundColor: '#1a1a1a', borderRadius: 12,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#C9A84C33'
  },
  barberCardBtnText: { color: '#C9A84C', fontWeight: '600' }
})
```

---

## Getting DeepAR Effect Files

### Option A — Buy from DeepAR Marketplace
DeepAR has a marketplace with ready-made hair and beard effects. Cost: ~$10–50 per effect. For v1, buy 10–15 hair effects + 5 beard effects.

### Option B — Commission Custom Effects
Use platforms like Fiverr or the DeepAR Discord to find effect creators. Expect $50–200 per custom effect.

### Option C — Use DeepAR Studio (Free)
DeepAR provides a free desktop tool to create effects. Requires 3D modeling basics. Good for a final year project or if you have the time.

---

## Performance Notes

- DeepAR is GPU-intensive. Don't run other heavy animations while AR is active.
- Lazy-load effect files — only download an effect when user taps it, not upfront.
- Test on real devices — AR never performs well in simulators.
- For Android, minimum API level 24 required for DeepAR.
- Add a "Camera permission" gate before showing this screen.
