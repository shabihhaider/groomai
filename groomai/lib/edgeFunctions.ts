// lib/edgeFunctions.ts
// Helpers for calling Supabase Edge Functions with consistent error decoding.

import { supabase } from '@/lib/supabase'

export type PublicFunctionErrorBody = {
    error?: string
    code?: string
    message?: string
    retryable?: boolean
    remaining?: number
}

export type NormalizedFunctionError = {
    code: string
    message: string
    status?: number
    aiCode?: string
    retryable?: boolean
    remaining?: number
    raw?: unknown
}

function tryParseJson(value: unknown): any {
    if (typeof value !== 'string') return value
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

export function normalizeEdgeFunctionError(err: any): NormalizedFunctionError {
    const status: number | undefined = err?.context?.status ?? err?.status ?? err?.statusCode
    const rawBody = tryParseJson(err?.context?.body)
    const body: PublicFunctionErrorBody | undefined = rawBody && typeof rawBody === 'object' ? rawBody : undefined

    const primaryCode = (body?.error || err?.name || 'edge_function_error') as string

    // For AI, server returns: { error: 'ai_unavailable', code: 'ai_quota_exceeded' | ... }
    const aiCode = body?.error === 'ai_unavailable' ? body?.code : undefined

    const message =
        body?.message ||
        (typeof rawBody === 'string' ? rawBody : undefined) ||
        err?.message ||
        'Request failed'

    return {
        code: primaryCode,
        aiCode,
        message,
        status,
        retryable: body?.retryable,
        remaining: body?.remaining,
        raw: body ?? rawBody ?? err,
    }
}

export async function invokeEdgeFunction<T>(
    name: string,
    body: any
): Promise<T> {
    const { data, error } = await supabase.functions.invoke(name, { body: body as any })

    if (error) {
        const normalized = normalizeEdgeFunctionError(error)
        throw Object.assign(new Error(normalized.message), normalized)
    }

    return data as T
}
