import type { UseInfiniteQueryOptions } from '@tanstack/react-query'
import { useInfiniteQuery } from '@tanstack/react-query'

import type {
    HttpError,
    HttpResponse,
    ListBusinessHoursIntegrations200,
    ListBusinessHoursIntegrationsParams,
} from '@gorgias/helpdesk-client'
import { listBusinessHoursIntegrations } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export default function useInfiniteListBusinessHoursIntegrations<
    TData = HttpResponse<ListBusinessHoursIntegrations200>,
    TError = HttpError<unknown>,
>(
    businessHoursId: number,
    params?: Omit<ListBusinessHoursIntegrationsParams, 'cursor'>,
    options?: UseInfiniteQueryOptions<
        HttpResponse<ListBusinessHoursIntegrations200>,
        TError,
        TData
    >,
) {
    return useInfiniteQuery({
        queryKey: [
            ...queryKeys.businessHours.listBusinessHoursIntegrations(
                businessHoursId,
                params,
            ),
            'paginated',
        ],
        queryFn: async ({ pageParam, signal }) =>
            listBusinessHoursIntegrations(
                businessHoursId,
                { ...params, cursor: pageParam },
                { signal },
            ),
        getNextPageParam: (lastPage) => lastPage.data.meta.next_cursor,
        ...options,
    })
}
