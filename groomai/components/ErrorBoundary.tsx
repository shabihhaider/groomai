import { Component, ReactNode } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { captureException } from '@/lib/analytics'
import { Colors } from '@/constants/colors'

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
    state: State = { hasError: false }

    static getDerivedStateFromError(error: Error): State {
        console.error('🔴 ErrorBoundary caught:', error.message, error.stack)
        return { hasError: true, error }
    }

    componentDidCatch(error: Error) {
        console.error('🔴 ErrorBoundary componentDidCatch:', error.message, error.stack)
        // Log to Sentry with route context
        captureException(error, { component: 'ErrorBoundary', message: error.message })
    }

    handleRestart = async () => {
        try {
            const Updates = require('expo-updates')
            await Updates.reloadAsync()
        } catch {
            // If OTA updates not available, reset error state to recover
            this.setState({ hasError: false, error: undefined })
        }
    }

    handleGoBack = () => {
        this.setState({ hasError: false, error: undefined })
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.emoji}>⚠️</Text>
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.message}>
                        We've logged this automatically and our team is on it.{"\n"}
                        Try going back or restarting the app.
                    </Text>
                    {__DEV__ && this.state.error && (
                        <Text style={{ color: '#ff6b6b', fontSize: 11, fontFamily: 'monospace', textAlign: 'center', marginBottom: 16, paddingHorizontal: 12 }}>
                            {this.state.error.message}{"\n"}{this.state.error.stack?.slice(0, 500)}
                        </Text>
                    )}
                    <Pressable style={styles.button} onPress={this.handleGoBack}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} onPress={this.handleRestart}>
                        <Text style={styles.secondaryButtonText}>Restart App</Text>
                    </Pressable>
                </View>
            )
        }
        return this.props.children
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 24 },
    emoji: { fontSize: 48, marginBottom: 16 },
    title: { color: Colors.text.primary, fontSize: 22, fontWeight: '700', marginBottom: 8 },
    message: { color: Colors.text.secondary, fontSize: 15, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
    button: { backgroundColor: Colors.gold.primary, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12, marginBottom: 12 },
    buttonText: { color: Colors.text.inverse, fontWeight: '700', fontSize: 16 },
    secondaryButton: { paddingHorizontal: 32, paddingVertical: 12 },
    secondaryButtonText: { color: Colors.text.secondary, fontWeight: '600', fontSize: 14 },
})
