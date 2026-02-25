import { View, Pressable, Text, StyleSheet } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'

const TAB_CONFIG: Record<string, {
    icon: keyof typeof Ionicons.glyphMap
    iconOutline: keyof typeof Ionicons.glyphMap
    label: string
}> = {
    home: { icon: 'home', iconOutline: 'home-outline', label: 'Home' },
    routines: { icon: 'list', iconOutline: 'list-outline', label: 'Routines' },
    barber: { icon: 'cut', iconOutline: 'cut-outline', label: 'Barber' },
    tracker: { icon: 'trophy', iconOutline: 'trophy-outline', label: 'Progress' },
    profile: { icon: 'person', iconOutline: 'person-outline', label: 'Profile' },
}

function TabItem({
    route,
    isFocused,
    onPress,
}: {
    route: any
    isFocused: boolean
    onPress: () => void
}) {
    const config = TAB_CONFIG[route.name] ?? {
        icon: 'ellipse',
        iconOutline: 'ellipse-outline',
        label: route.name,
    }

    // Scale animation on press
    const scale = useSharedValue(1)
    // Indicator width
    const indicatorWidth = useSharedValue(isFocused ? 1 : 0)

    const scaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ scaleX: indicatorWidth.value }],
        opacity: indicatorWidth.value,
    }))

    // Sync indicator when focused state changes
    if (isFocused) {
        indicatorWidth.value = withSpring(1, { damping: 12, stiffness: 180 })
    } else {
        indicatorWidth.value = withTiming(0, { duration: 200 })
    }

    function handlePress() {
        scale.value = withSpring(0.85, { damping: 8, stiffness: 300 })
        setTimeout(() => {
            scale.value = withSpring(1, { damping: 10, stiffness: 200 })
        }, 120)
        Haptics.selectionAsync()
        if (!isFocused) onPress()
    }

    return (
        <Pressable onPress={handlePress} style={styles.tab}>
            <Animated.View style={scaleStyle}>
                <Ionicons
                    name={isFocused ? config.icon : config.iconOutline}
                    size={22}
                    color={isFocused ? Colors.gold.primary : Colors.text.tertiary}
                />
            </Animated.View>
            <Text
                style={[
                    styles.label,
                    { color: isFocused ? Colors.gold.primary : Colors.text.tertiary },
                ]}
            >
                {config.label}
            </Text>

            {/* Animated gold indicator dot at bottom */}
            <Animated.View style={[styles.activeIndicator, indicatorStyle]} />
        </Pressable>
    )
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets()

    return (
        <BlurView
            intensity={70}
            tint="dark"
            style={[styles.container, { paddingBottom: insets.bottom + 4 }]}
        >
            <View style={styles.topBorder} />
            <View style={styles.inner}>
                {state.routes.map((route, index) => (
                    <TabItem
                        key={route.key}
                        route={route}
                        isFocused={state.index === index}
                        onPress={() => navigation.navigate(route.name)}
                    />
                ))}
            </View>
        </BlurView>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    topBorder: {
        height: 1,
        backgroundColor: 'rgba(201,168,76,0.15)', // subtle gold top border
    },
    inner: {
        flexDirection: 'row',
        paddingTop: 8,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
        position: 'relative',
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 3,
    },
    activeIndicator: {
        position: 'absolute',
        top: 0,
        width: 24,
        height: 2,
        borderRadius: 1,
        backgroundColor: Colors.gold.primary,
    },
})
