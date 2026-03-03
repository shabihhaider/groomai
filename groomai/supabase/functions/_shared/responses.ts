// supabase/functions/_shared/responses.ts

export type JsonHeaders = Record<string, string>

export function jsonResponse(body: unknown, status = 200, headers: JsonHeaders = {}): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...headers, 'Content-Type': 'application/json' },
    })
}
