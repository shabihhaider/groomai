import { Stack } from 'expo-router'
import { Colors } from '@/constants/colors'

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.bg.primary },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="step-1-basics" />
            <Stack.Screen name="step-2-face" />
            <Stack.Screen name="step-3-skin" />
            <Stack.Screen name="step-4-hair" />
            <Stack.Screen name="step-5-goals" />
            <Stack.Screen name="step-6-trial" />
        </Stack>
    )
}
