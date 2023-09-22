import {QueryClient, QueryKey} from '@tanstack/react-query'

export function createQueryClientWithCacheData(
    cacheData: [QueryKey, unknown][]
): QueryClient {
    const queryClient = new QueryClient()
    for (const [key, data] of cacheData) {
        queryClient.setQueryData(key, {data})
    }
    return queryClient
}
