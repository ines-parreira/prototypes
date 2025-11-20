import type { UseInfiniteQueryOptions } from '@tanstack/react-query'
import { useInfiniteQuery } from '@tanstack/react-query'

import type {
    HttpError,
    HttpResponse,
    ListTeams200,
    ListTeamsParams,
} from '@gorgias/helpdesk-client'
import { listTeams } from '@gorgias/helpdesk-client'
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
