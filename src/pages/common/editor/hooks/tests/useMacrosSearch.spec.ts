import { InfiniteQueryObserverSuccessResult } from '@tanstack/react-query'
import * as reactQuery from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks'

import { logEvent, SegmentEvent } from 'common/segment'
import { ticket as defaultTicket } from 'fixtures/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import { assumeMock } from 'utils/testing'

import useMacrosSearch, { SEARCH_DEBOUNCE_DELAY } from '../useMacrosSearch'

jest.mock('models/macro/resources', () => ({
    fetchMacros: jest.fn(),
}))

jest.mock('common/segment')

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

const logEventMock = logEvent as jest.Mock

jest.mock('@tanstack/react-query')
const useInfiniteQuerySpy = jest.spyOn(reactQuery, 'useInfiniteQuery')

const mockMacrosData = [{ id: 1 }, { id: 2 }]
const mockMeta = { next_cursor: 'beepboop' }

describe('useMacrosSearch', () => {
    const defaultOptions = {
        params: { search: '' },
        ticket: defaultTicket,
    }
    let dispatch: jest.Mock

    beforeEach(() => {
        jest.useFakeTimers()
        useInfiniteQuerySpy.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: [],
                            meta: { next_cursor: undefined },
                        },
                    },
                ],
                pageParams: [],
            },
        } as unknown as InfiniteQueryObserverSuccessResult<unknown, unknown>)

        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should return the default state', () => {
        const { result } = renderHook(() => useMacrosSearch(defaultOptions))

        expect(result.current).toEqual({
            data: [],
            nextCursor: undefined,
        })
    })

    it('should return data state', () => {
        useInfiniteQuerySpy.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: mockMacrosData,
                            meta: mockMeta,
                        },
                    },
                ],
                pageParams: [],
            },
        } as unknown as InfiniteQueryObserverSuccessResult<unknown, unknown>)
        const { result } = renderHook(() => useMacrosSearch(defaultOptions))

        expect(result.current).toEqual({
            data: mockMacrosData,
            nextCursor: mockMeta.next_cursor,
        })
    })

    it('should log an event if a search is executed due to changing parameters', async () => {
        const { rerender } = renderHook((options) => useMacrosSearch(options), {
            initialProps: defaultOptions,
        })
        rerender({
            ...defaultOptions,
            params: { ...defaultOptions.params, search: 'beep' },
        })

        act(() => {
            jest.advanceTimersByTime(SEARCH_DEBOUNCE_DELAY)
        })

        await waitFor(() =>
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.TicketMacrosSearch,
                {
                    changed: ['search'],
                    search: 'beep',
                },
            ),
        )
    })

    it('should update received macros data', () => {
        const mockNewMacrosData = [{ id: 3 }, { id: 4 }]
        const mockNewMeta = { next_cursor: 'boopbeep' }
        useInfiniteQuerySpy
            .mockReturnValueOnce({
                data: {
                    pages: [
                        {
                            data: {
                                data: mockMacrosData,
                                meta: mockMeta,
                            },
                        },
                    ],
                    pageParams: [],
                },
            } as unknown as InfiniteQueryObserverSuccessResult<
                unknown,
                unknown
            >)
            .mockReturnValueOnce({
                data: {
                    pages: [
                        {
                            data: {
                                data: mockNewMacrosData,
                                meta: mockNewMeta,
                            },
                        },
                    ],
                    pageParams: [],
                },
            } as unknown as InfiniteQueryObserverSuccessResult<
                unknown,
                unknown
            >)
        const { rerender, result } = renderHook(() =>
            useMacrosSearch(defaultOptions),
        )
        rerender({
            ...defaultOptions,
            params: { ...defaultOptions.params, search: 'beep' },
        })

        expect(result.current).toEqual({
            data: mockNewMacrosData,
            nextCursor: mockNewMeta.next_cursor,
        })
    })
})
