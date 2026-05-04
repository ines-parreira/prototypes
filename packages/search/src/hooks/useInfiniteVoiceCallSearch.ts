import { useInfiniteQuery } from '@tanstack/react-query'

import type {
    HttpError,
    HttpResponse,
    SearchVoiceCalls200,
} from '@gorgias/helpdesk-client'
import { searchVoiceCalls } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

type UseInfiniteVoiceCallSearchOptions = {
    query: string
    enabled: boolean
    limit: number
}

function getNextCursor(lastPage: Record<string, any> | undefined) {
    return (
        lastPage?.meta?.next_cursor ?? lastPage?.meta?.nextCursor ?? undefined
    )
}

type SearchVoiceCallsResponse = HttpResponse<SearchVoiceCalls200>

export function useInfiniteVoiceCallSearch({
    query,
    enabled,
    limit,
}: UseInfiniteVoiceCallSearchOptions) {
    const queryResult = useInfiniteQuery<
        SearchVoiceCallsResponse,
        HttpError<unknown>
    >({
        queryKey: [
            ...queryKeys.search.all(),
            'voice-calls',
            {
                query,
                limit,
            },
        ],
        enabled,
        queryFn: async ({ pageParam, signal }) =>
            searchVoiceCalls(
                {
                    search: query,
                },
                {
                    limit,
                    ...(typeof pageParam === 'string'
                        ? { cursor: pageParam }
                        : {}),
                    with_highlights: true,
                },
                {
                    signal,
                },
            ),
        getNextPageParam: (lastPage) => getNextCursor(lastPage.data),
    })

    return {
        ...queryResult,
        items:
            queryResult.data?.pages.flatMap((page) => page.data.data ?? []) ??
            [],
    }
}
