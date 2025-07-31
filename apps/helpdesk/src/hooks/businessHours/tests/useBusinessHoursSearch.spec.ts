import { renderHook } from '@repo/testing'
import { InfiniteQueryObserverSuccessResult } from '@tanstack/react-query'
import { act } from '@testing-library/react'
import { mocked } from 'jest-mock'

import { HttpResponse, ListBusinessHours200 } from '@gorgias/helpdesk-client'
import { BusinessHoursList } from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import {
    BUSINESS_HOURS_FETCH_ERROR_MESSAGE,
    BUSINESS_HOURS_LIMIT,
    BUSINESS_HOURS_SEARCH_DEBOUNCE_TIME,
    useBusinessHoursSearch,
} from '../useBusinessHoursSearch'
import { useInfiniteListBusinessHours } from '../useInfiniteListBusinessHours'

jest.mock('../useInfiniteListBusinessHours')
jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')

const useInfiniteListBusinessHoursMock = mocked(useInfiniteListBusinessHours)
const useAppDispatchMock = mocked(useAppDispatch)
const notifyMock = mocked(notify)

const fakeBusinessHours = [
    { id: 1, name: 'Business Hours 1' },
    { id: 2, name: 'Business Hours 2' },
    { id: 3, name: 'Business Hours 3' },
] as BusinessHoursList[]

const defaultQueryOptions = {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
}

const useInfiniteListBusinessHoursParams = {
    data: {
        pages: [
            {
                data: {
                    data: [fakeBusinessHours[0], fakeBusinessHours[1]],
                },
            },
            {
                data: {
                    data: [fakeBusinessHours[2]],
                },
            },
        ],
    },
    isFetchingNextPage: false,
    hasNextPage: true,
    fetchNextPage: jest.fn(),
    isError: false,
} as unknown as InfiniteQueryObserverSuccessResult<
    HttpResponse<ListBusinessHours200>,
    unknown
>

describe('useBusinessHoursSearch', () => {
    it('returns flattened business hours from the hook', () => {
        useInfiniteListBusinessHoursMock.mockReturnValue(
            useInfiniteListBusinessHoursParams,
        )

        const { result } = renderHook(() => useBusinessHoursSearch())

        expect(useInfiniteListBusinessHoursMock).toHaveBeenCalledWith(
            {
                name: '',
                limit: BUSINESS_HOURS_LIMIT,
            },
            defaultQueryOptions,
        )

        expect(result.current.businessHours).toEqual([
            fakeBusinessHours[0],
            fakeBusinessHours[1],
            fakeBusinessHours[2],
        ])
    })

    it('changes the search query with debounce', async () => {
        jest.useFakeTimers()

        useInfiniteListBusinessHoursMock.mockReturnValue(
            useInfiniteListBusinessHoursParams,
        )

        const { result } = renderHook(() => useBusinessHoursSearch())

        act(() => {
            result.current.handleBusinessHoursSearch('test business hours')
        })

        expect(useInfiniteListBusinessHoursMock).toHaveBeenCalledWith(
            {
                name: '',
                limit: BUSINESS_HOURS_LIMIT,
            },
            defaultQueryOptions,
        )

        act(() => {
            jest.advanceTimersByTime(BUSINESS_HOURS_SEARCH_DEBOUNCE_TIME)
        })

        expect(useInfiniteListBusinessHoursMock).toHaveBeenCalledWith(
            {
                name: 'test business hours',
                limit: BUSINESS_HOURS_LIMIT,
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
            useInfiniteListBusinessHoursMock.mockReturnValue({
                ...useInfiniteListBusinessHoursParams,
                hasNextPage: hasNextPage,
                isFetchingNextPage: isFetchingNextPage,
            })

            const { result } = renderHook(() => useBusinessHoursSearch())

            expect(result.current.shouldLoadMore).toBe(expectedShouldLoadMore)
        },
    )

    it('dispatches an error notification when error is returned', () => {
        const dispatchMock = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useInfiniteListBusinessHoursMock.mockReturnValue({
            ...useInfiniteListBusinessHoursParams,
            data: {
                pages: [],
            },
            isError: true,
        } as unknown as InfiniteQueryObserverSuccessResult<
            HttpResponse<ListBusinessHours200>,
            unknown
        >)

        renderHook(() => useBusinessHoursSearch())

        expect(notifyMock).toHaveBeenCalledWith({
            message: BUSINESS_HOURS_FETCH_ERROR_MESSAGE,
            status: NotificationStatus.Error,
        })
        expect(dispatchMock).toHaveBeenCalled()
    })

    it('fetches next page when onLoad is called', () => {
        const fetchNextPageMock = jest.fn()
        useInfiniteListBusinessHoursMock.mockReturnValue({
            ...useInfiniteListBusinessHoursParams,
            fetchNextPage: fetchNextPageMock,
        })

        const { result } = renderHook(() => useBusinessHoursSearch())

        expect(result.current.onLoad).toBe(fetchNextPageMock)
    })
})
