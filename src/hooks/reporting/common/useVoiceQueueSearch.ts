import { useCallback, useEffect, useMemo, useState } from 'react'

import { debounce } from 'lodash'
import _flatten from 'lodash/flatten'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useInfiniteListVoiceQueues } from './useInfiniteListVoiceQueues'

export const VOICE_QUEUES_LIMIT = 20
export const VOICE_QUEUE_SEARCH_DEBOUNCE_TIME = 300
export const VOICE_QUEUE_FETCH_ERROR_MESSAGE = 'Failed to fetch queues'

export const useVoiceQueueSearch = () => {
    const dispatch = useAppDispatch()

    const [query, setQuery] = useState('')

    const queryResult = useInfiniteListVoiceQueues(
        {
            search: query,
            limit: VOICE_QUEUES_LIMIT,
        },
        {
            staleTime: 60_000,
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
            void dispatch(
                notify({
                    message: VOICE_QUEUE_FETCH_ERROR_MESSAGE,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [isError, dispatch])

    return {
        ...queryResult,
        handleVoiceQueueSearch,
        onLoad: fetchNextPage,
        voiceQueues,
        shouldLoadMore: (hasNextPage && !isFetchingNextPage) ?? false,
    }
}
