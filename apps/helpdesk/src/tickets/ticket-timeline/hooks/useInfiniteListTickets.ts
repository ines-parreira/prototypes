import type { UseInfiniteQueryOptions } from '@tanstack/react-query'
import { useInfiniteQuery } from '@tanstack/react-query'

import type {
    HttpError,
    HttpResponse,
    ListTickets200,
    ListTicketsParams,
} from '@gorgias/helpdesk-client'
import { listTickets } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useInfiniteListTickets<
    TData = HttpResponse<ListTickets200>,
    TError = HttpError<unknown>,
>(
    params?: Omit<ListTicketsParams, 'cursor'>,
    options?: UseInfiniteQueryOptions<
        HttpResponse<ListTickets200>,
        TError,
        TData
    >,
) {
    return useInfiniteQuery({
        queryKey: [...queryKeys.tickets.listTickets(params), 'paginated'],
        queryFn: async ({ pageParam, signal }) =>
            listTickets(
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
