import type { DefaultOptions } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'

const defaultQueryClientOptions: DefaultOptions = {
    queries: {
        retry: false,
    },
    mutations: {
        retry: false,
    },
}

export const createTestQueryClient = (
    overrides?: DefaultOptions,
): QueryClient =>
    new QueryClient({
        defaultOptions: {
            queries: {
                ...defaultQueryClientOptions.queries,
                ...overrides?.queries,
            },
            mutations: {
                ...defaultQueryClientOptions.mutations,
                ...overrides?.mutations,
            },
        },
    })
