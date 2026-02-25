# Hair Loss Tracker

## Overview
Premium feature. One of the most requested but underserved features in men's grooming apps. Users take monthly photos from consistent angles to track hair density progress — whether they're treating hair loss, monitoring a new supplement, or just tracking over time. **This feature creates long-term retention** because users return monthly, building a photo history they can't get elsewhere.

---

## Why This Feature Is Powerful
- Hair loss affects ~50% of men by age 50
- Most men don't track it until it's severe
- This gives them an early warning + progress tool
- Monthly photo ritual = built-in monthly active user
- Before/after comparison is extremely shareable (drives organic growth)

---

## Screen Flow

```
[Profile Tab → Hair Loss Tracker]
       ↓
[Tracker Home]
  - Streak of months logged
  - Last entry date
  - Latest photos preview
  - [Log This Month] CTA
       ↓
[Photo Session — 5 angles]
  Top → Front → Back → Left → Right
       ↓
[Review & Save]
       ↓
[Timeline view with comparison]
```

---

## Tracker Home Screen

```
Hair Loss Tracker

"Track your progress monthly. Early detection is key."

📅 Last logged: January 2026  (1 month ago)
📸 Photos in history: 6 months

[Latest Photos]
  [Top]  [Front]  [Back]  [Left]  [Right]
  Jan 2026

[Log This Month's Photos →]  ← big CTA

[View Full Timeline ↓]
  Feb 2025  Mar 2025  Apr 2025 ... Jan 2026
  (Scrollable months, tap to compare)
```

---

## Photo Capture Session (`app/hair-loss-tracker.tsx`)

```tsx
import { CameraView } from 'expo-camera'
import { useState, useRef } from 'react'
import * as Haptics from 'expo-haptics'

const ANGLES = [
  { key: 'top', label: 'Top of Head', instruction: 'Point camera straight down at top of head', icon: '⬆️' },
  { key: 'front', label: 'Front Hairline', instruction: 'Face camera straight on, look forward', icon: '🧍' },
  { key: 'back', label: 'Back/Crown', instruction: 'Point camera at the crown/back of head', icon: '⬇️' },
  { key: 'left', label: 'Left Temple', instruction: 'Show your left side profile', icon: '◀️' },
  { key: 'right', label: 'Right Temple', instruction: 'Show your right side profile', icon: '▶️' },
] as const

type AngleKey = typeof ANGLES[number]['key']

export default function HairLossTrackerScreen() {
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0)
  const [capturedPhotos, setCapturedPhotos] = useState<Record<AngleKey, string | null>>({
    top: null, front: null, back: null, left: null, right: null
  })
  const [sessionComplete, setSessionComplete] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  const currentAngle = ANGLES[currentAngleIndex]
  const allCaptured = Object.values(capturedPhotos).every(Boolean)

  async function capturePhoto() {
    const photo = await cameraRef.current?.takePictureAsync({
      quality: 0.85,
      base64: false,
      exif: false
    })
    if (!photo) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    setCapturedPhotos(prev => ({
      ...prev,
      [currentAngle.key]: photo.uri
    }))

    // Auto-advance to next angle
    if (currentAngleIndex < ANGLES.length - 1) {
      setTimeout(() => setCurrentAngleIndex(prev => prev + 1), 500)
    } else {
      setSessionComplete(true)
    }
  }

  if (sessionComplete) {
    return <HairLossReviewScreen photos={capturedPhotos} />
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} facing="back" style={StyleSheet.absoluteFill} />

      {/* Progress indicator */}
      <View style={styles.header}>
        <Text style={styles.step}>{currentAngleIndex + 1} of {ANGLES.length}</Text>
        <View style={styles.progressDots}>
          {ANGLES.map((angle, i) => (
            <View
              key={angle.key}
              style={[
                styles.dot,
                i < currentAngleIndex && styles.dotComplete,
                i === currentAngleIndex && styles.dotActive
              ]}
            />
          ))}
        </View>
      </View>

      {/* Angle instruction */}
      <View style={styles.instruction}>
        <Text style={styles.angleIcon}>{currentAngle.icon}</Text>
        <Text style={styles.angleLabel}>{currentAngle.label}</Text>
        <Text style={styles.angleInstruction}>{currentAngle.instruction}</Text>
      </View>

      {/* Reference overlay for top angle */}
      {currentAngle.key === 'top' && (
        <View style={styles.circleGuide}>
          <Svg><Circle cx="50%" cy="50%" r="35%" stroke="#C9A84C" strokeDasharray="8,4" fill="transparent" /></Svg>
        </View>
      )}

      {/* Capture button */}
      <View style={styles.captureArea}>
        <Pressable style={styles.captureBtn} onPress={capturePhoto}>
          <View style={styles.captureBtnInner} />
        </Pressable>
      </View>
    </View>
  )
}
```

---

## Review & Save Screen

```tsx
// components/hairloss/HairLossReviewScreen.tsx
export function HairLossReviewScreen({ photos, onSave }: {
  photos: Record<AngleKey, string | null>
  onSave: () => void
}) {
  const [saving, setSaving] = useState(false)

  async function saveSession() {
    setSaving(true)
    await uploadHairLossPhotos(photos)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    onSave()
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Review Your Photos</Text>
      <Text style={styles.subtitle}>Make sure each angle is clear before saving</Text>

      {ANGLES.map(angle => (
        <View key={angle.key} style={styles.photoRow}>
          <Text style={styles.angleLabel}>{angle.label}</Text>
          <Image source={{ uri: photos[angle.key]! }} style={styles.reviewPhoto} />
        </View>
      ))}

      <Text style={styles.note}>
        📅 These photos are saved to {format(new Date(), 'MMMM yyyy')}
      </Text>

      <Button
        onPress={saveSession}
        loading={saving}
        label={saving ? 'Saving...' : 'Save This Month\'s Log'}
      />
    </ScrollView>
  )
}
```

---

## Upload Service

```typescript
// services/hairloss.service.ts
import { supabase } from '@/lib/supabase'

export async function uploadHairLossPhotos(
  photos: Record<string, string | null>,
  userId: string
) {
  const date = new Date().toISOString().split('T')[0]  // 2026-02-21
  const uploads: Promise<void>[] = []

  for (const [angle, uri] of Object.entries(photos)) {
    if (!uri) continue

    uploads.push(
      (async () => {
        // Convert URI to blob
        const response = await fetch(uri)
        const blob = await response.blob()
        const fileName = `${userId}/${date}/${angle}.jpg`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('hair-loss-photos')
          .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })

        if (uploadError) throw uploadError

        const photoUrl = supabase.storage
          .from('hair-loss-photos')
          .getPublicUrl(fileName).data.publicUrl

        // Save log entry
        await supabase.from('hair_loss_logs').insert({
          user_id: userId,
          photo_url: photoUrl,
          photo_angle: angle,
          logged_date: date
        })
      })()
    )
  }

  await Promise.all(uploads)
  
  // Award XP for logging
  await awardXP(userId, 75)
  await checkAndAwardBadge(userId, 'hair-tracker')
}
```

---

## Timeline Comparison View

The most powerful part. Users see their photos side by side across months.

```tsx
// components/hairloss/HairLossTimeline.tsx
export function HairLossTimeline({ logs }: { logs: HairLossLog[] }) {
  const [selectedAngle, setSelectedAngle] = useState<AngleKey>('top')
  const [compareMonths, setCompareMonths] = useState<[string, string]>(['latest', 'oldest'])

  // Group logs by month
  const byMonth = groupBy(logs, log => log.logged_date.substring(0, 7))
  const months = Object.keys(byMonth).sort()

  const leftPhoto = byMonth[compareMonths[0]]?.find(l => l.photo_angle === selectedAngle)
  const rightPhoto = byMonth[compareMonths[1]]?.find(l => l.photo_angle === selectedAngle)

  return (
    <View>
      {/* Angle selector */}
      <ScrollView horizontal style={styles.angleSelector}>
        {ANGLES.map(angle => (
          <Pressable
            key={angle.key}
            onPress={() => setSelectedAngle(angle.key)}
            style={[styles.angleChip, selectedAngle === angle.key && styles.activeChip]}
          >
            <Text>{angle.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Side-by-side comparison */}
      <View style={styles.comparison}>
        <View style={styles.comparisonSide}>
          <Text style={styles.monthLabel}>{compareMonths[0]}</Text>
          {leftPhoto
            ? <Image source={{ uri: leftPhoto.photo_url }} style={styles.comparisonPhoto} />
            : <View style={styles.photoPlaceholder}><Text>No photo</Text></View>
          }
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.comparisonSide}>
          <Text style={styles.monthLabel}>{compareMonths[1]}</Text>
          {rightPhoto
            ? <Image source={{ uri: rightPhoto.photo_url }} style={styles.comparisonPhoto} />
            : <View style={styles.photoPlaceholder}><Text>No photo</Text></View>
          }
        </View>
      </View>

      {/* Month scrubber */}
      <ScrollView horizontal style={styles.monthScrubber}>
        {months.map(month => (
          <Pressable
            key={month}
            style={styles.monthThumb}
            onPress={() => setCompareMonths([month, compareMonths[1]])}
          >
            <Image
              source={{ uri: byMonth[month].find(l => l.photo_angle === selectedAngle)?.photo_url }}
              style={styles.thumbPhoto}
            />
            <Text style={styles.thumbLabel}>{format(new Date(month), 'MMM yy')}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
```

---

## Reminder System

Send a push notification on the 1st of each month:

```typescript
async function scheduleMonthlyReminder() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📸 Time for your monthly hair check',
      body: 'Log this month\'s photos to track your progress.',
      data: { screen: 'hair-loss-tracker' }
    },
    trigger: {
      day: 1,       // 1st of month
      hour: 10,
      minute: 0,
      repeats: true
    }
  })
}
```
