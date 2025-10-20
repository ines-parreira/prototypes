import {
    useInfiniteQuery,
    UseInfiniteQueryOptions,
} from '@tanstack/react-query'

import {
    HttpError,
    HttpResponse,
    listTeams,
    ListTeams200,
    ListTeamsParams,
} from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useInfiniteListTeams<
    TData = HttpResponse<ListTeams200>,
    TError = HttpError<unknown>,
>(
    params?: Omit<ListTeamsParams, 'cursor'>,
    options?: UseInfiniteQueryOptions<
        HttpResponse<ListTeams200>,
        TError,
        TData
    >,
) {
    return useInfiniteQuery({
        queryKey: [...queryKeys.teams.listTeams(params), 'paginated'],
        queryFn: async ({ pageParam, signal }) =>
            listTeams({ ...params, cursor: pageParam }, { signal }),
        getNextPageParam: (lastPage) => lastPage.data.meta.next_cursor,
        ...options,
    })
}
