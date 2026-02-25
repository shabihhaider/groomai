import { Redirect } from 'expo-router'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { useUserStore } from '@/stores/user.store'
import { Colors } from '@/constants/colors'

export default function Index() {
    const session = useUserStore((s) => s.session)
    const profile = useUserStore((s) => s.profile)
    const isLoading = useUserStore((s) => s.isLoading)

    // Still loading auth/profile
    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.gold.primary} />
            </View>
        )
    }

    // No session → auth flow
    if (!session) {
        return <Redirect href="/(auth)/welcome" />
    }

    // Session exists but onboarding not complete
    if (profile && !profile.onboarding_completed) {
        return <Redirect href="/(onboarding)/step-1-basics" />
    }

    // Fully onboarded → main app
    return <Redirect href="/(tabs)/home" />
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        backgroundColor: Colors.bg.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
