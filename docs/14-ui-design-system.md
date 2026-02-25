# UI Design System

## Philosophy
The app must feel like a **luxury product** — not an app someone built over a weekend. Think: dark, confident, gold accents, tight typography. Reference: Apple Fitness+, Cash App's dark mode, Calm App's premium feel.

Every design decision should pass this test: *"Would a man be proud to have this on his phone's home screen?"*

---

## Color Palette (`constants/colors.ts`)

```typescript
export const Colors = {
  // Backgrounds
  bg: {
    primary: '#0A0A0A',      // Main background — deep black
    secondary: '#111111',    // Card backgrounds
    tertiary: '#1A1A1A',     // Elevated surfaces
    input: '#161616',        // Input fields
  },

  // Gold — the signature brand color
  gold: {
    primary: '#C9A84C',      // Main gold — actions, CTAs, active states
    light: '#E8C76A',        // Highlighted gold text
    dark: '#9E7A2D',         // Pressed state
    muted: '#C9A84C33',      // Gold with 20% opacity — borders, subtle accents
    gradient: ['#C9A84C', '#E8C76A', '#C9A84C'], // Gold gradient
  },

  // Text
  text: {
    primary: '#FFFFFF',      // Main text
    secondary: '#A0A0A0',    // Subtext, labels
    tertiary: '#555555',     // Placeholder, disabled
    inverse: '#0A0A0A',      // Text on gold backgrounds
  },

  // Semantic
  success: '#4CAF50',        // Routine complete, safe scan
  warning: '#FF9800',        // Caution, streak warning
  error: '#F44336',          // Avoid product, errors
  info: '#2196F3',

  // Rarity colors (for badges)
  rarity: {
    common: '#9E9E9E',       // Silver-grey
    rare: '#2196F3',         // Blue
    epic: '#9C27B0',         // Purple
    legendary: '#C9A84C',    // Gold
  },

  // Transparent overlays
  overlay: {
    light: 'rgba(255,255,255,0.05)',
    dark: 'rgba(0,0,0,0.6)',
    gold: 'rgba(201,168,76,0.1)',
  }
}
```

---

## Typography (`constants/typography.ts`)

```typescript
import { Platform } from 'react-native'

// Font: SF Pro on iOS (system), Roboto on Android (system)
// No custom fonts in v1 — system fonts render fastest and look native

export const Typography = {
  // Display — hero screens, paywall
  display: {
    fontSize: 40,
    fontWeight: '700' as const,
    letterSpacing: -1,
    lineHeight: 44,
    color: '#FFFFFF',
  },

  // Heading — section titles
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5, lineHeight: 32 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3, lineHeight: 26 },
  h3: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2, lineHeight: 22 },

  // Body
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  small: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
}
```

---

## Core UI Components

### Button (`components/ui/Button.tsx`)
```tsx
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  loading?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function Button({
  label, onPress, variant = 'primary', loading, disabled, size = 'md', fullWidth = true
}: ButtonProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }))

  function handlePressIn() {
    scale.value = withSpring(0.96, { damping: 15 })
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 15 })
  }

  async function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
      <Pressable
        style={[
          styles.base,
          styles[variant],
          styles[size],
          (disabled || loading) && styles.disabled
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {loading
          ? <ActivityIndicator color={variant === 'primary' ? '#000' : '#C9A84C'} />
          : <Text style={[styles.label, styles[`label_${variant}`]]}>{label}</Text>
        }
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  base: { borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: '#C9A84C' },
  secondary: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#C9A84C33' },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: '#F4433620' },
  sm: { height: 40, paddingHorizontal: 16 },
  md: { height: 52, paddingHorizontal: 24 },
  lg: { height: 60, paddingHorizontal: 32 },
  disabled: { opacity: 0.4 },
  label: { fontSize: 16, fontWeight: '600' },
  label_primary: { color: '#0A0A0A' },
  label_secondary: { color: '#FFFFFF' },
  label_ghost: { color: '#C9A84C' },
  label_danger: { color: '#F44336' },
})
```

---

### Card (`components/ui/Card.tsx`)
```tsx
import { View, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'gold' | 'glass'
  style?: object
}

export function Card({ children, variant = 'default', style }: CardProps) {
  if (variant === 'glass') {
    return (
      <BlurView intensity={20} tint="dark" style={[styles.base, styles.glass, style]}>
        {children}
      </BlurView>
    )
  }

  return (
    <View style={[styles.base, styles[variant], style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: { borderRadius: 16, padding: 16, overflow: 'hidden' },
  default: { backgroundColor: '#111111' },
  elevated: { backgroundColor: '#1A1A1A', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  gold: { backgroundColor: '#111111', borderWidth: 1, borderColor: '#C9A84C33' },
  glass: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
})
```

---

### Skeleton Loader (`components/ui/Skeleton.tsx`)
```tsx
import Animated, {
  useAnimatedStyle, useSharedValue,
  withRepeat, withTiming, interpolateColor
} from 'react-native-reanimated'
import { useEffect } from 'react'

export function Skeleton({ width, height, borderRadius = 8 }: {
  width: number | string
  height: number
  borderRadius?: number
}) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true)
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#1A1A1A', '#2A2A2A']
    )
  }))

  return (
    <Animated.View style={[{ width, height, borderRadius }, animatedStyle]} />
  )
}
```

---

### Custom Tab Bar (`components/ui/CustomTabBar.tsx`)
```tsx
import { View, Pressable, StyleSheet } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'

const TAB_ICONS = {
  home: { active: '⚡', inactive: '⚡' },
  routines: { active: '✓', inactive: '○' },
  barber: { active: '✂', inactive: '✂' },
  tracker: { active: '📊', inactive: '📊' },
  profile: { active: '●', inactive: '○' },
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <BlurView intensity={60} tint="dark" style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.inner}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index

          function onPress() {
            Haptics.selectionAsync()
            if (!isFocused) navigation.navigate(route.name)
          }

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab}>
              <TabIcon name={route.name} active={isFocused} />
              {isFocused && <View style={styles.activeIndicator} />}
            </Pressable>
          )
        })}
      </View>
    </BlurView>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)'
  },
  inner: { flexDirection: 'row', paddingTop: 10 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  activeIndicator: {
    position: 'absolute', bottom: -4, width: 4, height: 4,
    borderRadius: 2, backgroundColor: '#C9A84C'
  }
})
```

---

## Spacing System
```typescript
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
}
```

---

## Animation Standards

```typescript
// All spring animations use these settings for consistency
export const Springs = {
  snappy: { damping: 20, stiffness: 300 },
  smooth: { damping: 25, stiffness: 200 },
  bouncy: { damping: 10, stiffness: 150 },
}

// Standard entrance animations
export const Entrances = {
  fadeUp: FadeInDown.duration(400).springify(),
  fadeIn: FadeIn.duration(300),
  zoom: ZoomIn.duration(300).springify(),
  slide: SlideInDown.duration(400).springify(),
}
```

---

## Screen Template (copy for every new screen)

```tsx
import { View, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Colors } from '@/constants/colors'

export default function TemplatScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Animated.View entering={FadeInDown.duration(400)}>
            {/* Screen content here */}
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg.primary },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 }, // 100 for tab bar clearance
})
```
