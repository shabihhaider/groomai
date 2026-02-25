export const Colors = {
    // Backgrounds
    bg: {
        primary: '#0A0A0A',      // Main background — deep black
        secondary: '#111111',    // Card backgrounds
        tertiary: '#1A1A1A',     // Elevated surfaces
        input: '#161616',        // Input fields
    },

    // Gold — the signature brand color
    gold: {
        primary: '#C9A84C',      // Main gold — actions, CTAs, active states
        light: '#E8C76A',        // Highlighted gold text
        dark: '#9E7A2D',         // Pressed state
        muted: '#C9A84C33',      // Gold with 20% opacity — borders, subtle accents
        gradient: ['#C9A84C', '#E8C76A', '#C9A84C'] as const,
    },

    // Text
    text: {
        primary: '#FFFFFF',      // Main text
        secondary: '#A0A0A0',    // Subtext, labels
        tertiary: '#555555',     // Placeholder, disabled
        inverse: '#0A0A0A',      // Text on gold backgrounds
    },

    // Semantic
    success: '#4CAF50',        // Routine complete, safe scan
    warning: '#FF9800',        // Caution, streak warning
    error: '#F44336',          // Avoid product, errors
    info: '#2196F3',

    // Rarity colors (for badges)
    rarity: {
        common: '#9E9E9E',       // Silver-grey
        rare: '#2196F3',         // Blue
        epic: '#9C27B0',         // Purple
        legendary: '#C9A84C',    // Gold
    },

    // Transparent overlays
    overlay: {
        light: 'rgba(255,255,255,0.05)',
        dark: 'rgba(0,0,0,0.6)',
        gold: 'rgba(201,168,76,0.1)',
    }
}
