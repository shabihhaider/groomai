// constants/hairstyleImages.ts
// Static require() mapping for local hairstyle images.
// React Native requires static require() calls — cannot use dynamic strings.
// Only the 18 V1 styles have local images; others show the default placeholder.

const HAIRSTYLE_IMAGE_MAP: Record<string, { front: any; side?: any; back?: any }> = {
    'broccoli-cut': { front: require('../assets/images/Hairstyles/broccoli-cut/front.png') },
    'overgrown-buzz-cut': { front: require('../assets/images/Hairstyles/overgrown-buzz-cut/front.png') },
    'crew-cut-texture': { front: require('../assets/images/Hairstyles/crew-cut-texture/front.png') },
    'blowout-low-taper': { front: require('../assets/images/Hairstyles/blowout-low-taper/front.png') },
    'curly-top-fade': { front: require('../assets/images/Hairstyles/curly-top-fade/front.png') },
    'mens-perm': { front: require('../assets/images/Hairstyles/mens-perm/front.png') },
    'curtain-fringe-taper': { front: require('../assets/images/Hairstyles/curtain-fringe-taper/front.png') },
    'textured-flow-fade': { front: require('../assets/images/Hairstyles/textured-flow-fade/front.png') },
    'bro-flow': { front: require('../assets/images/Hairstyles/bro-flow/front.png') },
    'soft-quiff-drop-fade': { front: require('../assets/images/Hairstyles/soft-quiff-drop-fade/front.png') },
    'gentleman-taper': { front: require('../assets/images/Hairstyles/gentleman-taper/front.png') },
    'long-straight-flow': { front: require('../assets/images/Hairstyles/long-straight-flow/front.png') },
    'long-curly-flow': { front: require('../assets/images/Hairstyles/long-curly-flow/front.png') },
    'long-slick-back': { front: require('../assets/images/Hairstyles/long-slick-back/front.png') },
    'half-up-half-down': { front: require('../assets/images/Hairstyles/half-up-half-down/front.png') },
    'long-wavy-layers': { front: require('../assets/images/Hairstyles/long-wavy-layers/front.png') },
    'long-shag': { front: require('../assets/images/Hairstyles/long-shag/front.png') },
    'low-ponytail': { front: require('../assets/images/Hairstyles/low-ponytail/front.png') },
    // New Beard & Combo styles placeholders
    'corporate-beard': { front: require('../assets/images/Hairstyles/corporate-beard/front.png') },
    'verdi-beard': { front: require('../assets/images/Hairstyles/verdi-beard/front.png') },
    'buzz-cut-faded-beard': { front: require('../assets/images/Hairstyles/buzz-cut-faded-beard/front.png') },
    'slick-back-full-beard': { front: require('../assets/images/Hairstyles/slick-back-full-beard/front.png') },
}

/**
 * Get the local image sources for a hairstyle by slug.
 * Returns an object with { front, side, back } if available, or undefined.
 */
export function getHairstyleImage(slug: string): { front?: any; side?: any; back?: any } | undefined {
    return HAIRSTYLE_IMAGE_MAP[slug]
}
