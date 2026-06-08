import { useCallback, useEffect, useMemo, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { debounce } from 'lodash'
import _flatten from 'lodash/flatten'

import { toast } from '@gorgias/axiom'

import { useInfiniteListVoiceQueues } from 'domains/reporting/hooks/common/useInfiniteListVoiceQueues'

export const VOICE_QUEUES_LIMIT = 20
export const VOICE_QUEUE_SEARCH_DEBOUNCE_TIME = Duration.millis(300)
export const VOICE_QUEUE_FETCH_ERROR_MESSAGE = 'Failed to fetch queues'

export const useVoiceQueueSearch = () => {
    const [query, setQuery] = useState('')

    const queryResult = useInfiniteListVoiceQueues(
        {
            search: query,
            limit: VOICE_QUEUES_LIMIT,
        },
        {
            staleTime: Duration.minutes(1),
            refetchOnWindowFocus: false,
        },
    )

    const { data, isFetchingNextPage, hasNextPage, fetchNextPage, isError } =
        queryResult

    // eslint-disable-next-line exhaustive-deps
    const handleVoiceQueueSearch = useCallback(
        debounce(setQuery, VOICE_QUEUE_SEARCH_DEBOUNCE_TIME),
        [setQuery],
    )

    const voiceQueues = useMemo(
        () => _flatten(data?.pages.map((page) => page.data.data)),
        [data],
    )

    useEffect(() => {
        if (isError) {
            toast.error(VOICE_QUEUE_FETCH_ERROR_MESSAGE)
        }
    }, [isError])

    return {
        ...queryResult,
        handleVoiceQueueSearch,
        onLoad: fetchNextPage,
        voiceQueues,
        shouldLoadMore: (hasNextPage && !isFetchingNextPage) ?? false,
    }
}
