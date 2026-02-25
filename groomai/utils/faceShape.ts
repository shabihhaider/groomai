// ── Face Shape Detection ──
// Used for ML Kit selfie analysis (future) and quiz-based derivation

interface FaceLandmarks {
    faceWidth: number       // distance between cheekbones
    jawWidth: number        // distance between jaw corners
    foreheadWidth: number   // distance at temples
    faceHeight: number      // forehead to chin
    jawlineAngle: number    // sharpness of jaw angle (degrees)
}

export function detectFaceShape(landmarks: FaceLandmarks): string {
    const { faceWidth, jawWidth, foreheadWidth, faceHeight, jawlineAngle } = landmarks
    const ratio = faceHeight / faceWidth

    if (ratio > 1.5) return 'oblong'
    if (jawlineAngle < 130 && jawWidth > faceWidth * 0.85) return 'square'
    if (foreheadWidth > jawWidth * 1.2 && jawlineAngle > 150) return 'heart'
    if (faceWidth > faceHeight * 0.95) return 'round'
    if (foreheadWidth < faceWidth * 0.75 && jawWidth < faceWidth * 0.75) return 'diamond'
    return 'oval' // most common default
}

// ── Quiz-based derivation ──
// Maps quiz answers to a face shape without ML Kit
export type QuizAnswers = {
    jawline: 'sharp' | 'narrow' | 'rounded' | 'balanced'
    foreheadVsJaw: 'forehead_wider' | 'same' | 'jaw_wider'
    faceLength: 'short' | 'long' | 'medium'
}

export function deriveFaceShapeFromQuiz(answers: QuizAnswers): string {
    const { jawline, foreheadVsJaw, faceLength } = answers

    if (faceLength === 'long') {
        if (jawline === 'sharp') return 'oblong'
        return 'oval'
    }

    if (jawline === 'sharp') {
        if (foreheadVsJaw === 'same') return 'square'
        if (foreheadVsJaw === 'forehead_wider') return 'heart'
        return 'triangle'
    }

    if (jawline === 'narrow') {
        if (foreheadVsJaw === 'forehead_wider') return 'heart'
        return 'diamond'
    }

    if (jawline === 'rounded') {
        if (faceLength === 'short') return 'round'
        return 'oval'
    }

    // balanced jawline
    if (faceLength === 'short') return 'round'
    return 'oval'
}

export const FACE_SHAPE_LABELS: Record<string, string> = {
    oval: 'Oval',
    square: 'Square',
    round: 'Round',
    oblong: 'Oblong',
    diamond: 'Diamond',
    heart: 'Heart',
    triangle: 'Triangle',
}
