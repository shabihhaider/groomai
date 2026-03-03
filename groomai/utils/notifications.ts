// utils/notifications.ts
// Push notification scheduling for routine reminders and streak warnings

import { Platform } from 'react-native'
import { supabase } from '@/lib/supabase'
import Constants from 'expo-constants'

const isExpoGo = Constants.appOwnership === 'expo'
let Notifications: typeof import('expo-notifications') | null = null

if (!isExpoGo) {
    try {
        Notifications = require('expo-notifications')
        // Configure notification handler
        Notifications?.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldShowBanner: true,
                shouldShowList: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        })
    } catch (e) {
        console.warn('Could not load expo-notifications:', e)
    }
}

export async function requestNotificationPermissions(): Promise<boolean> {
    if (isExpoGo || !Notifications) return true

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
    }

    if (finalStatus !== 'granted') return false

    // Android needs a notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('routine-reminders', {
            name: 'Routine Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#C9A84C',
        })
    }

    return true
}

export async function scheduleMorningReminder(time: string) {
    if (isExpoGo || !Notifications) return

    // Cancel existing morning reminders
    await cancelNotificationsByTag('morning-reminder')

    const [hour, minute] = time.split(':').map(Number)

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Good morning ☀️',
            body: 'Start your day right. Your morning routine is waiting.',
            data: { screen: 'routines' },
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
        },
        identifier: 'morning-reminder',
    })
}

export async function scheduleNightReminder(time: string) {
    if (isExpoGo || !Notifications) return

    // Cancel existing night reminders
    await cancelNotificationsByTag('night-reminder')

    const [hour, minute] = time.split(':').map(Number)

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Wind down 🌙',
            body: 'Time for your night routine. Your skin repairs while you sleep.',
            data: { screen: 'routines' },
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
        },
        identifier: 'night-reminder',
    })
}

export async function scheduleStreakWarning(streakCount: number) {
    if (isExpoGo || !Notifications) return

    // Cancel any existing streak warnings
    await cancelNotificationsByTag('streak-warning')

    if (streakCount <= 0) return

    await Notifications.scheduleNotificationAsync({
        content: {
            title: `⚠️ Don't lose your ${streakCount}-day streak!`,
            body: "You haven't completed today's routine yet. 2 minutes is all it takes.",
            data: { screen: 'routines' },
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 20,
            minute: 0,
        },
        identifier: 'streak-warning',
    })
}

export async function cancelNotificationsByTag(identifier: string) {
    if (isExpoGo || !Notifications) return
    await Notifications.cancelScheduledNotificationAsync(identifier)
}

export async function cancelAllNotifications() {
    if (isExpoGo || !Notifications) return
    await Notifications.cancelAllScheduledNotificationsAsync()
}

export async function loadAndScheduleNotifications(userId: string) {
    if (isExpoGo || !Notifications) return

    const { data } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (!data) return

    if (data.morning_routine_enabled && data.morning_routine_time) {
        await scheduleMorningReminder(data.morning_routine_time)
    }

    if (data.night_routine_enabled && data.night_routine_time) {
        await scheduleNightReminder(data.night_routine_time)
    }
}
