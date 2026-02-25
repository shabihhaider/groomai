import { Component, ReactNode } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import * as Updates from 'expo-updates'

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
    state: State = { hasError: false }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error) {
        // Log to Sentry
        console.error('Unhandled error:', error)
    }

    async handleRestart() {
        await Updates.reloadAsync()
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.message}>We logged this automatically. Restart the app to continue.</Text>
                    <Pressable style={styles.button} onPress={this.handleRestart}>
                        <Text style={styles.buttonText}>Restart App</Text>
                    </Pressable>
                </View>
            )
        }
        return this.props.children
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 24 },
    title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 12 },
    message: { color: '#A0A0A0', fontSize: 15, textAlign: 'center', marginBottom: 32 },
    button: { backgroundColor: '#C9A84C', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
    buttonText: { color: '#0A0A0A', fontWeight: '700', fontSize: 16 },
})
