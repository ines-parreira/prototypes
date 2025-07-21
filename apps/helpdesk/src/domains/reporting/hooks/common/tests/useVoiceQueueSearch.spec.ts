import { InfiniteQueryObserverSuccessResult } from '@tanstack/react-query'
import { act } from '@testing-library/react'
import { mocked } from 'jest-mock'

import {
    HttpResponse,
    ListVoiceQueues200,
    VoiceQueue,
} from '@gorgias/helpdesk-queries'

import { useInfiniteListVoiceQueues } from 'domains/reporting/hooks/common/useInfiniteListVoiceQueues'
import {
    useVoiceQueueSearch,
    VOICE_QUEUE_FETCH_ERROR_MESSAGE,
    VOICE_QUEUE_SEARCH_DEBOUNCE_TIME,
    VOICE_QUEUES_LIMIT,
} from 'domains/reporting/hooks/common/useVoiceQueueSearch'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/hooks/common/useInfiniteListVoiceQueues')
jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')

const useInfiniteListVoiceQueuesMock = mocked(useInfiniteListVoiceQueues)
const useAppDispatchMock = mocked(useAppDispatch)
const notifyMock = mocked(notify)

const fakeVoiceQueues = [
    { id: 1, name: 'Queue 1' },
    { id: 2, name: 'Queue 2' },
    { id: 3, name: 'Queue 3' },
] as VoiceQueue[]

const defaultQueryOptions = {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
}

const useInfiniteListVoiceQueuesParams = {
    data: {
        pages: [
            {
                data: {
                    data: [fakeVoiceQueues[0], fakeVoiceQueues[1]],
                },
            },
            {
                data: {
                    data: [fakeVoiceQueues[2]],
                },
            },
        ],
    },
    isFetchingNextPage: false,
    hasNextPage: true,
    fetchNextPage: jest.fn(),
    isError: false,
} as unknown as InfiniteQueryObserverSuccessResult<
    HttpResponse<ListVoiceQueues200>,
    unknown
>

describe('useVoiceQueueSearch', () => {
    it('returns flattened voice queues from the hook', () => {
        useInfiniteListVoiceQueuesMock.mockReturnValue(
            useInfiniteListVoiceQueuesParams,
        )

        const { result } = renderHook(() => useVoiceQueueSearch())

        expect(useInfiniteListVoiceQueuesMock).toHaveBeenCalledWith(
            {
                search: '',
                limit: VOICE_QUEUES_LIMIT,
            },
            defaultQueryOptions,
        )

        expect(result.current.voiceQueues).toEqual([
            fakeVoiceQueues[0],
            fakeVoiceQueues[1],
            fakeVoiceQueues[2],
        ])
    })

    it('changes the search query with debounce', async () => {
        jest.useFakeTimers()

        useInfiniteListVoiceQueuesMock.mockReturnValue(
            useInfiniteListVoiceQueuesParams,
        )

        const { result } = renderHook(() => useVoiceQueueSearch())

        act(() => {
            result.current.handleVoiceQueueSearch('test queue')
        })

        expect(useInfiniteListVoiceQueuesMock).toHaveBeenCalledWith(
            {
                search: '',
                limit: VOICE_QUEUES_LIMIT,
            },
            defaultQueryOptions,
        )

        act(() => {
            jest.advanceTimersByTime(VOICE_QUEUE_SEARCH_DEBOUNCE_TIME)
        })

        expect(useInfiniteListVoiceQueuesMock).toHaveBeenCalledWith(
            {
                search: 'test queue',
                limit: VOICE_QUEUES_LIMIT,
            },
            defaultQueryOptions,
        )

        jest.useRealTimers()
    })

    it.each([
        {
            hasNextPage: true,
            isFetchingNextPage: false,
            expectedShouldLoadMore: true,
        },
        {
            hasNextPage: undefined,
            isFetchingNextPage: true,
            expectedShouldLoadMore: false,
        },
        {
            hasNextPage: false,
            isFetchingNextPage: true,
            expectedShouldLoadMore: false,
        },
        {
            hasNextPage: true,
            isFetchingNextPage: true,
            expectedShouldLoadMore: false,
        },
    ])(
        'correctly sets shouldLoadMore if new data is available',
        ({ hasNextPage, isFetchingNextPage, expectedShouldLoadMore }) => {
            useInfiniteListVoiceQueuesMock.mockReturnValue({
                ...useInfiniteListVoiceQueuesParams,
                hasNextPage: hasNextPage,
                isFetchingNextPage: isFetchingNextPage,
            })

            const { result } = renderHook(() => useVoiceQueueSearch())

            expect(result.current.shouldLoadMore).toBe(expectedShouldLoadMore)
        },
    )

    it('dispatches an error notification when error is returned', () => {
        const dispatchMock = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useInfiniteListVoiceQueuesMock.mockReturnValue({
            ...useInfiniteListVoiceQueuesParams,
            data: {
                pages: [],
            },
            isError: true,
        } as unknown as InfiniteQueryObserverSuccessResult<
            HttpResponse<ListVoiceQueues200>,
            unknown
        >)

        renderHook(() => useVoiceQueueSearch())

        expect(notifyMock).toHaveBeenCalledWith({
            message: VOICE_QUEUE_FETCH_ERROR_MESSAGE,
            status: NotificationStatus.Error,
        })
        expect(dispatchMock).toHaveBeenCalled()
    })

    it('fetches next page when onLoad is called', () => {
        const fetchNextPageMock = jest.fn()
        useInfiniteListVoiceQueuesMock.mockReturnValue({
            ...useInfiniteListVoiceQueuesParams,
            fetchNextPage: fetchNextPageMock,
        })

        const { result } = renderHook(() => useVoiceQueueSearch())

        expect(result.current.onLoad).toBe(fetchNextPageMock)
    })
})
