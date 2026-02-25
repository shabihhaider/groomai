import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Purchases from 'react-native-purchases'
import { queryClient } from '@/lib/queryClient'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { TrialWarningBanner } from '@/components/paywall/TrialWarningBanner'
import { Colors } from '@/constants/colors'
import { useUserStore } from '@/stores/user.store'
import { useSubscriptionStore } from '@/stores/subscription.store'
import { supabase } from '@/lib/supabase'
import { initRevenueCat } from '@/lib/revenuecat'
import { requestNotificationPermissions, loadAndScheduleNotifications } from '@/utils/notifications'
import Constants from 'expo-constants'
import { router as expoRouter } from 'expo-router'
import { initSentry, analytics } from '@/lib/analytics'

// Initialize Sentry as early as possible (before component mount)
initSentry()

export default function RootLayout() {
    const setSession = useUserStore((s) => s.setSession)
    const setProfile = useUserStore((s) => s.setProfile)
    const setLoading = useUserStore((s) => s.setLoading)
    const checkSubscriptionStatus = useSubscriptionStore((s) => s.checkStatus)
    const resetSubscription = useSubscriptionStore((s) => s.reset)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session?.user) {
                fetchProfile(session.user.id)
                setupRevenueCat(session.user.id)
                // Request permissions + schedule notifications on app launch
                requestNotificationPermissions().then(() => {
                    loadAndScheduleNotifications(session.user.id)
                })
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session)
                if (session?.user) {
                    await fetchProfile(session.user.id)
                    await setupRevenueCat(session.user.id)
                    analytics.identify(session.user.id)
                    // Schedule notifications after login
                    requestNotificationPermissions().then(() => {
                        loadAndScheduleNotifications(session.user.id)
                    })
                } else {
                    setProfile(null)
                    analytics.signOut()
                    // Sign out of RevenueCat
                    try { await Purchases.logOut() } catch { /* not initialized */ }
                    resetSubscription()
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    // ── Push notification deep link handler ──
    useEffect(() => {
        let responseSubscription: any = null
        try {
            if (Constants.appOwnership !== 'expo') {
                const Notifications = require('expo-notifications')
                responseSubscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
                    const screen = response.notification.request.content.data?.screen
                    if (screen === 'routines') {
                        expoRouter.push('/(tabs)/routines')
                    } else if (screen === 'hair-loss-tracker') {
                        expoRouter.push('/hair-loss-tracker')
                    }
                })
            }
        } catch (e) {
            console.warn('Could not hook notification listeners:', e)
        }

        return () => responseSubscription?.remove()
    }, [])

    async function fetchProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
            } else {
                setProfile(data)
            }
        } catch (err) {
            console.error('Exception fetching profile:', err)
        }
    }

    async function setupRevenueCat(userId: string) {
        try {
            await initRevenueCat(userId)
            await checkSubscriptionStatus()
        } catch {
            // RevenueCat keys not set yet — silently continue
        }
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ErrorBoundary>
                <QueryClientProvider client={queryClient}>
                    <StatusBar style="light" />
                    <TrialWarningBanner />
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: Colors.bg.primary },
                            animation: 'slide_from_right',
                        }}
                    >
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(onboarding)" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen
                            name="paywall"
                            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                        />
                        <Stack.Screen
                            name="routine-editor"
                            options={{ animation: 'slide_from_right' }}
                        />
                        <Stack.Screen
                            name="badge-unlock"
                            options={{ presentation: 'transparentModal', animation: 'fade' }}
                        />
                        <Stack.Screen name="hair-loss-tracker" />
                        <Stack.Screen name="ai-routine" />
                        <Stack.Screen name="skin-analysis" />
                        <Stack.Screen name="product-scanner" />
                        <Stack.Screen name="celebrity-breakdown" />
                    </Stack>
                </QueryClientProvider>
            </ErrorBoundary>
        </GestureHandlerRootView>
    )
}
