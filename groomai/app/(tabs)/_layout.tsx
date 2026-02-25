import { Tabs } from 'expo-router'
import { CustomTabBar } from '@/components/ui/CustomTabBar'

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen name="home" options={{ title: 'Home' }} />
            <Tabs.Screen name="routines" options={{ title: 'Routines' }} />
            <Tabs.Screen name="barber" options={{ title: 'Barber' }} />
            <Tabs.Screen name="tracker" options={{ title: 'Progress' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        </Tabs>
    )
}
