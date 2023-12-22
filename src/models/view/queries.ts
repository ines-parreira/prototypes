import {
    QueryFunctionContext,
    useInfiniteQuery,
    UseInfiniteQueryOptions,
} from '@tanstack/react-query'

import {reportError} from 'utils/errors'

import {getViewItems} from './resources'
import {ListParams} from './types'

const STALE_TIME = 1 * 60 * 60 * 1000
const CACHE_TIME = STALE_TIME + 60 * 1000

export const viewItemsDefinitionKeys = {
    all: () => ['view'] as const,
    lists: () => [...viewItemsDefinitionKeys.all(), 'list'] as const,
    list: (params: {query: string}) => [
        ...viewItemsDefinitionKeys.lists(),
        params,
    ],
    details: () => [...viewItemsDefinitionKeys.all(), 'detail'] as const,
    detail: (id: number) => [...viewItemsDefinitionKeys.details(), id] as const,
    updates: (viewId: number) =>
        [
            ...viewItemsDefinitionKeys.all(),
            viewId,
            'tickets',
            'updates',
        ] as const,
}

export const useGetViewItems = <
    TData = Awaited<ReturnType<typeof getViewItems>>
>(
    {viewId, ...params}: ListParams,
    overrides?: UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof getViewItems>>,
        unknown,
        TData
    >
) =>
    useInfiniteQuery({
        queryKey: viewItemsDefinitionKeys.detail(viewId),
        queryFn: (context: QueryFunctionContext) =>
            getViewItems({viewId, url: context.pageParam, ...params}),
        getNextPageParam: (lastPage) => lastPage.data.meta.next_items,
        onError: () => {
            reportError(
                new Error(`Failed to fetch items for view id ${viewId}`)
            )
        },
        staleTime: STALE_TIME,
        cacheTime: CACHE_TIME,
        ...overrides,
    })
