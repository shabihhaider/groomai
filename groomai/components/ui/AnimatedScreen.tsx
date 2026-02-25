import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated'
import { StyleSheet } from 'react-native'

export function AnimatedScreen({ children }: { children: React.ReactNode }) {
    return (
        <Animated.View
            entering={FadeInDown.duration(400).springify()}
            exiting={FadeOutUp.duration(300)}
            style={styles.container}
        >
            {children}
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
})
