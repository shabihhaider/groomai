// supabase/functions/_shared/aiErrors.ts

export type PublicAIErrorBody = {
    error: 'ai_unavailable'
    code:
        | 'ai_missing_key'
        | 'ai_invalid_key'
        | 'ai_quota_exceeded'
        | 'ai_rate_limited'
        | 'ai_model_unavailable'
        | 'ai_network_error'
        | 'ai_unknown'
    message: string
    retryable: boolean
}

function getStatus(err: any): number | undefined {
    return (
        err?.status ??
        err?.statusCode ??
        err?.response?.status ??
        err?.context?.status
    )
}

function getErrorText(err: unknown): string {
    if (err instanceof Error) return err.message
    try {
        return JSON.stringify(err)
    } catch {
        return String(err)
    }
}

export function toPublicAIErrorBody(err: unknown): PublicAIErrorBody {
    const status = getStatus(err)
    const message = getErrorText(err).toLowerCase()

    // OpenAI / auth
    if (status === 401 || message.includes('incorrect api key') || message.includes('invalid api key')) {
        return {
            error: 'ai_unavailable',
            code: 'ai_invalid_key',
            message: 'AI is temporarily unavailable.',
            retryable: false,
        }
    }

    // Quota / billing
    if (
        status === 429 &&
        (message.includes('insufficient_quota') ||
            message.includes('exceeded your current quota') ||
            message.includes('billing') ||
            message.includes('quota'))
    ) {
        return {
            error: 'ai_unavailable',
            code: 'ai_quota_exceeded',
            message: 'AI is temporarily unavailable.',
            retryable: false,
        }
    }

    // OpenAI rate limit (still 429, but distinct from quota)
    if (status === 429 || message.includes('rate limit')) {
        return {
            error: 'ai_unavailable',
            code: 'ai_rate_limited',
            message: 'AI is busy right now. Please try again in a moment.',
            retryable: true,
        }
    }

    // Model not found / not available
    if (status === 404 || message.includes('model') && message.includes('not found')) {
        return {
            error: 'ai_unavailable',
            code: 'ai_model_unavailable',
            message: 'AI is temporarily unavailable.',
            retryable: false,
        }
    }

    // Network / upstream
    if (
        message.includes('fetch failed') ||
        message.includes('network') ||
        message.includes('timed out') ||
        message.includes('timeout')
    ) {
        return {
            error: 'ai_unavailable',
            code: 'ai_network_error',
            message: 'AI is temporarily unavailable. Please check your connection and try again.',
            retryable: true,
        }
    }

    return {
        error: 'ai_unavailable',
        code: 'ai_unknown',
        message: 'AI is temporarily unavailable.',
        retryable: true,
    }
}
