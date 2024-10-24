import {queryKeys} from '@gorgias/api-queries'
import {useInfiniteQuery, UseInfiniteQueryOptions} from '@tanstack/react-query'
import {useEffect} from 'react'

import {handleError} from 'hooks/agents/errorHandler'
import useAppDispatch from 'hooks/useAppDispatch'
import {fetchTeams} from 'models/team/resources'

export default function useListTeams(
    params?: Parameters<typeof fetchTeams>[0],
    query?: UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof fetchTeams>>,
        unknown
    >
) {
    const dispatch = useAppDispatch()
    const response = useInfiniteQuery({
        queryKey: queryKeys.teams.listTeams(),
        queryFn: async ({pageParam}) =>
            fetchTeams({
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
            handleError(response.error, 'Failed to fetch teams', dispatch)
        }
    }, [dispatch, response])

    return response
}
