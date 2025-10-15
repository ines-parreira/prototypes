import {
    useInfiniteQuery,
    UseInfiniteQueryOptions,
} from '@tanstack/react-query'

import {
    HttpError,
    HttpResponse,
    IntegrationType,
    listIntegrations,
    ListIntegrations200,
    ListIntegrationsOrderBy,
    ListIntegrationsParams,
} from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useInfiniteListVoiceIntegrations<
    TData = HttpResponse<ListIntegrations200>,
    TError = HttpError<unknown>,
>(
    params?: Omit<ListIntegrationsParams, 'cursor'>,
    options?: UseInfiniteQueryOptions<
        HttpResponse<ListIntegrations200>,
        TError,
        TData
    >,
) {
    return useInfiniteQuery({
        queryKey: [
            ...queryKeys.integrations.listIntegrations(params),
            'paginated',
        ],
        queryFn: async ({ pageParam, signal }) =>
            listIntegrations(
                {
                    ...params,
                    order_by: ListIntegrationsOrderBy.CreatedDatetimeDesc,
                    cursor: pageParam,
                    type: IntegrationType.Phone,
                },
                { signal },
            ),
        getNextPageParam: (lastPage) => lastPage.data.meta.next_cursor,
        ...options,
    })
}
