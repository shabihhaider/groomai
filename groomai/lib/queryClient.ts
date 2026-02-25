import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,   // 5 minutes — data considered fresh
            gcTime: 1000 * 60 * 30,     // 30 minutes — keep in memory
            retry: 2,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        }
    }
})
