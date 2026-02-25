// Font: SF Pro on iOS (system), Roboto on Android (system)
// No custom fonts in v1 — system fonts render fastest and look native

export const Typography = {
    // Display — hero screens, paywall
    display: {
        fontSize: 40,
        fontWeight: '700' as const,
        letterSpacing: -1,
        lineHeight: 44,
        color: '#FFFFFF',
    },

    // Heading — section titles
    h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5, lineHeight: 32 },
    h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3, lineHeight: 26 },
    h3: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2, lineHeight: 22 },

    // Body
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    bodyMedium: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
    small: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
    label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
}
