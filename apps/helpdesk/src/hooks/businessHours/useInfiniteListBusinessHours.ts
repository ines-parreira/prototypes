import {
    useInfiniteQuery,
    UseInfiniteQueryOptions,
} from '@tanstack/react-query'

import {
    HttpError,
    HttpResponse,
    listBusinessHours,
    ListBusinessHours200,
    ListBusinessHoursParams,
} from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useInfiniteListBusinessHours<
    TData = HttpResponse<ListBusinessHours200>,
    TError = HttpError<unknown>,
>(
    params?: Omit<ListBusinessHoursParams, 'cursor'>,
    options?: UseInfiniteQueryOptions<
        HttpResponse<ListBusinessHours200>,
        TError,
        TData
    >,
) {
    return useInfiniteQuery({
        queryKey: [
            ...queryKeys.businessHours.listBusinessHours(params),
            'paginated',
        ],
        queryFn: async ({ pageParam, signal }) =>
            listBusinessHours({ ...params, cursor: pageParam }, { signal }),
        getNextPageParam: (lastPage) => lastPage.data.meta.next_cursor,
        ...options,
    })
}
