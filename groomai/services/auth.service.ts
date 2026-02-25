import { Platform } from 'react-native'
import { supabase } from '@/lib/supabase'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import * as QueryParams from 'expo-auth-session/build/QueryParams'

WebBrowser.maybeCompleteAuthSession()

const createSessionFromUrl = async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url)
    if (errorCode) throw new Error(errorCode)

    const { access_token, refresh_token } = params
    if (!access_token) return null

    const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
    })

    if (error) throw error
    return data.session
}

export const authService = {
    async signUpWithEmail(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        return data
    },

    async signInWithEmail(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    },

    async signInWithGoogle() {
        const redirectTo = makeRedirectUri()

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                skipBrowserRedirect: true,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        })

        if (error) throw error

        if (data.url && Platform.OS !== 'web') {
            const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
            if (res.type === 'success') {
                return await createSessionFromUrl(res.url)
            } else {
                throw new Error('Sign in canceled')
            }
        }

        return data
    },

    async signInWithApple() {
        if (Platform.OS !== 'ios') {
            throw new Error('Apple Sign-In is only available on iOS')
        }

        // Get Apple credential
        const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
        })

        if (!credential.identityToken) {
            throw new Error('No identity token returned from Apple')
        }

        // Exchange Apple token with Supabase
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken,
        })
        if (error) throw error

        // Update full_name if Apple provided it (only on first sign-in)
        if (credential.fullName?.givenName && data.user) {
            const fullName = [credential.fullName.givenName, credential.fullName.familyName]
                .filter(Boolean)
                .join(' ')
            if (fullName) {
                await supabase
                    .from('profiles')
                    .update({ full_name: fullName })
                    .eq('id', data.user.id)
            }
        }

        return data
    },

    async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    async getSession() {
        const { data: { session } } = await supabase.auth.getSession()
        return session
    },

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    }
}
