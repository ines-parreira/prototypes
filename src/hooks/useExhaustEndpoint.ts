import { useEffect, useMemo } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'
import type { QueryKey } from '@tanstack/react-query'

type InferItem<T> = T extends { data: { data: (infer R)[] } } ? R : never

export function useExhaustEndpoint<TPage>(
    queryKey: QueryKey,
    fetchPage: (cursor?: string) => Promise<
        TPage & {
            data: {
                data: InferItem<TPage>[]
                meta: { next_cursor: string | null }
            }
        }
    >,
) {
    const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
        useInfiniteQuery(queryKey, ({ pageParam }) => fetchPage(pageParam), {
            getNextPageParam: ({ data }) => data.meta.next_cursor ?? undefined,
        })

    useEffect(() => {
        if (!isFetchingNextPage && hasNextPage) {
            fetchNextPage()
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage])

    const isLoading = hasNextPage || isFetching

    const allData = useMemo(() => {
        if (isLoading || !data) return []
        return data.pages.flatMap((page) => page.data.data)
    }, [data, isLoading])

    return useMemo(() => ({ data: allData, isLoading }), [allData, isLoading])
}
