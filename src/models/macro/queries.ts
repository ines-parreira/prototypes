import {UseInfiniteQueryOptions, useInfiniteQuery} from '@tanstack/react-query'

import {fetchMacros} from './resources'

/**
 * RQ Key Factory for Macros
 */

export const macroKeys = {
    all: () => ['macros'] as const,
    lists: () => [...macroKeys.all(), 'list'] as const,
}

/**
 * queries
 */

export const useGetAICompatibleMacros = <
    TData = Awaited<ReturnType<typeof fetchMacros>>
>(
    overrides?: UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof fetchMacros>>,
        unknown,
        TData
    >
) => {
    return useInfiniteQuery({
        queryKey: macroKeys.lists(),
        queryFn: async ({pageParam}) =>
            fetchMacros({
                cursor: pageParam,
                limit: 100,
                search: '[ai compatible]',
            }),
        getNextPageParam: (lastPage) => {
            return lastPage.data.meta.next_cursor
        },
        staleTime: 1000 * 60 * 5,
        ...overrides,
    })
}
