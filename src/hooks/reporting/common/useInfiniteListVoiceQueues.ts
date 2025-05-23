import {
    useInfiniteQuery,
    UseInfiniteQueryOptions,
} from '@tanstack/react-query'

import {
    HttpError,
    HttpResponse,
    listVoiceQueues,
    ListVoiceQueues200,
    ListVoiceQueuesParams,
} from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useInfiniteListVoiceQueues<
    TData = HttpResponse<ListVoiceQueues200>,
    TError = HttpError<unknown>,
>(
    params?: Omit<ListVoiceQueuesParams, 'cursor'>,
    options?: UseInfiniteQueryOptions<
        HttpResponse<ListVoiceQueues200>,
        TError,
        TData
    >,
) {
    return useInfiniteQuery({
        queryKey: [
            ...queryKeys.voiceQueues.listVoiceQueues(params),
            'paginated',
        ],
        queryFn: async ({ pageParam, signal }) =>
            listVoiceQueues({ ...params, cursor: pageParam }, { signal }),
        getNextPageParam: (lastPage) => lastPage.data.meta.next_cursor,
        ...options,
    })
}
