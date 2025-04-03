import { useInfiniteQuery } from '@tanstack/react-query'

import { listVoiceQueues, ListVoiceQueuesParams } from '@gorgias/api-client'
import { queryKeys } from '@gorgias/api-queries'

export const useInfiniteListVoiceQueues = (
    params?: Omit<ListVoiceQueuesParams, 'cursor'>,
) => {
    return useInfiniteQuery({
        queryKey: [
            ...queryKeys.voiceQueues.listVoiceQueues(params),
            'paginated',
        ],
        queryFn: async ({ pageParam, signal }) =>
            listVoiceQueues({ ...params, cursor: pageParam }, { signal }),
        getNextPageParam: (lastPage) => lastPage.data.meta.next_cursor,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    })
}
