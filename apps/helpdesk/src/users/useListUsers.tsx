import { useEffect } from 'react'

import type { UseInfiniteQueryOptions } from '@tanstack/react-query'
import { useInfiniteQuery } from '@tanstack/react-query'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { handleError } from 'hooks/agents/errorHandler'
import useAppDispatch from 'hooks/useAppDispatch'
import { fetchAgents } from 'models/agents/resources'

export default function useListUsers(
    params?: Parameters<typeof fetchAgents>[0],
    query?: UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof fetchAgents>>,
        unknown
    >,
) {
    const dispatch = useAppDispatch()
    const response = useInfiniteQuery({
        queryKey: queryKeys.users.listUsers(),
        queryFn: async ({ pageParam }) =>
            fetchAgents({
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
            handleError(response.error, 'Failed to fetch users', dispatch)
        }
    }, [dispatch, response])

    return response
}
