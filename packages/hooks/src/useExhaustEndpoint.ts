import { useEffect, useMemo } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'
import type { QueryKey, UseInfiniteQueryOptions } from '@tanstack/react-query'

import type { HttpResponse, PaginationMeta } from '@gorgias/helpdesk-client'

type ListResponse<ListItemType> = {
    meta: PaginationMeta
    data: ListItemType[]
}

type Response<ListItemType> = HttpResponse<ListResponse<ListItemType>>

export function useExhaustEndpoint<ListItemType>(
    queryKey: QueryKey,
    fetchPage: (cursor?: string) => Promise<Response<ListItemType>>,
    options?: UseInfiniteQueryOptions<Response<ListItemType>>,
) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        refetch,
    } = useInfiniteQuery(queryKey, ({ pageParam }) => fetchPage(pageParam), {
        ...options,
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

    return useMemo(
        () => ({ data: allData, isLoading, refetch }),
        [allData, isLoading, refetch],
    )
}
