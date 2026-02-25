import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '@/constants/colors'

interface AvatarProps {
    name?: string | null
    size?: number
    uri?: string | null
}

export function Avatar({ name, size = 48 }: AvatarProps) {
    const initials = name
        ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?'

    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
            ]}
        >
            <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.overlay.gold,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.gold.muted,
    },
    initials: {
        color: Colors.gold.primary,
        fontWeight: '700',
    },
})
