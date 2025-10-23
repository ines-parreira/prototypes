import {
    useInfiniteQuery,
    UseInfiniteQueryOptions,
} from '@tanstack/react-query'

import {
    HttpError,
    HttpResponse,
    listUsers,
    ListUsers200,
    ListUsersParams,
} from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useInfiniteListUsers<
    TData = HttpResponse<ListUsers200>,
    TError = HttpError<unknown>,
>(
    params?: Omit<ListUsersParams, 'cursor'>,
    options?: UseInfiniteQueryOptions<
        HttpResponse<ListUsers200>,
        TError,
        TData
    >,
) {
    return useInfiniteQuery({
        queryKey: [...queryKeys.users.listUsers(params), 'paginated'],
        queryFn: async ({ pageParam, signal }) =>
            listUsers(
                {
                    ...params,
                    cursor: pageParam,
                },
                { signal },
            ),
        getNextPageParam: (lastPage) => lastPage.data.meta.next_cursor,
        ...options,
    })
}
