import {QueryCache, QueryClient} from '@tanstack/react-query'

export const queryCache = new QueryCache()

export const appQueryClient = new QueryClient({
    queryCache,
})
