import {
    useInfiniteQuery,
    UseInfiniteQueryOptions,
} from '@tanstack/react-query'

import { fetchMacros } from './resources'

/**
 * RQ Key Factory for Macros
 */

export const macroKeys = {
    all: () => ['macros'] as const,
    lists: (ids?: number[]) => [...macroKeys.all(), 'list', ids] as const,
}

/**
 * queries
 */

export const useGetAICompatibleMacros = <
    TData = Awaited<ReturnType<typeof fetchMacros>>,
>(
    overrides?: UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof fetchMacros>>,
        unknown,
        TData
    >,
    ids?: number[],
) => {
    return useInfiniteQuery({
        queryKey: macroKeys.lists(ids),
        queryFn: async ({ pageParam }) => {
            const result = await fetchMacros({
                cursor: pageParam,
                limit: 100,
                search: '[ai compatible]',
            })
            return {
                ...result,
                data: {
                    ...result.data,
                    data: result.data.data.filter((macro) =>
                        ids?.includes(macro.id ?? 0),
                    ),
                },
            }
        },
        getNextPageParam: (lastPage) => {
            return lastPage.data.meta.next_cursor
        },
        staleTime: 1000 * 60 * 5,
        ...overrides,
    })
}
