import {useEffect} from 'react'
import {queryKeys} from '@gorgias/api-queries'
import {useInfiniteQuery, UseInfiniteQueryOptions} from '@tanstack/react-query'

import {handleError} from 'hooks/agents/errorHandler'
import useAppDispatch from 'hooks/useAppDispatch'
import {fetchTags} from 'models/tag/resources'

export default function useListTags(
    params?: Parameters<typeof fetchTags>[0],
    query?: UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof fetchTags>>,
        unknown
    >
) {
    const dispatch = useAppDispatch()
    const response = useInfiniteQuery({
        queryKey: queryKeys.tags.listTags(
            params?.search
                ? {
                      search: params.search,
                  }
                : undefined
        ),
        queryFn: async ({pageParam}) =>
            fetchTags({
                ...params,
                cursor: pageParam,
            }),
        getNextPageParam: (lastPage) => {
            return lastPage.data.meta.next_cursor
        },
        ...query,
    })

    useEffect(() => {
        if (response.error) {
            handleError(response.error, 'Failed to fetch tags', dispatch)
        }
    }, [dispatch, response])

    return response
}
