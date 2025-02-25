import React from 'react'

import { act, renderHook } from '@testing-library/react-hooks'
import _keyBy from 'lodash/keyBy'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { tags } from 'fixtures/tag'
import { useTicketCountPerTag } from 'hooks/reporting/ticket-insights/useTicketCountPerTag'
import { useTagsTicketCountTimeSeries } from 'hooks/reporting/timeSeries'
import { getPeriodDateTimes } from 'hooks/reporting/useTimeSeries'
import { OrderDirection } from 'models/api/types'
import { ReportingGranularity } from 'models/reporting/types'
import { Period } from 'models/stat/types'
import { RootState, StoreDispatch } from 'state/types'
import {
    initialState,
    setOrder,
    tagsReportSlice,
} from 'state/ui/stats/tagsReportSlice'
import { getFilterDateRange } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/timeSeries')
const useTagsTicketCountTimeSeriesMock = assumeMock(
    useTagsTicketCountTimeSeries,
)
const mockStore = configureMockStore<RootState, StoreDispatch>()

describe('useTicketCountPerTag', () => {
    const period: Period = {
        start_datetime: '2024-09-26T00:00:00.000',
        end_datetime: '2024-09-27T00:00:00.000',
    }
    const defaultState = {
        entities: {
            tags: _keyBy(tags, 'id'),
        },
        stats: {
            filters: { period },
        },
        ui: {
            stats: {
                filters: {
                    cleanStatsFilters: { period },
                },
                [tagsReportSlice.name]: initialState,
            },
        },
    } as RootState

    const granularity = ReportingGranularity.Day
    const tagId = '1'
    const anotherTagId = '2'
    const thirdTagId = '3'
    const deletedTagId = '789'
    const exampleResponse = {
        [tagId]: [
            [
                {
                    dateTime: '2024-09-26T00:00:00.000',
                    value: 37,
                    label: 'TicketTagsEnriched.ticketCount',
                },

                {
                    dateTime: '2024-09-27T00:00:00.000',
                    value: 18,
                    label: 'TicketTagsEnriched.ticketCount',
                },
            ],
        ],
        [anotherTagId]: [
            [
                {
                    dateTime: '2024-09-26T00:00:00.000',
                    value: 12,
                    label: 'TicketTagsEnriched.ticketCount',
                },

                {
                    dateTime: '2024-09-27T00:00:00.000',
                    value: 45,
                    label: 'TicketTagsEnriched.ticketCount',
                },
            ],
        ],
        [thirdTagId]: [
            [
                {
                    dateTime: '2024-09-26T00:00:00.000',
                    value: 24,
                    label: 'TicketTagsEnriched.ticketCount',
                },

                {
                    dateTime: '2024-09-27T00:00:00.000',
                    value: 30,
                    label: 'TicketTagsEnriched.ticketCount',
                },
            ],
        ],
        [deletedTagId]: [
            [
                {
                    dateTime: '2024-09-26T00:00:00.000',
                    value: 999,
                    label: 'TicketTagsEnriched.ticketCount',
                },

                {
                    dateTime: '2024-09-27T00:00:00.000',
                    value: 999,
                    label: 'TicketTagsEnriched.ticketCount',
                },
            ],
        ],
    }
    beforeEach(() => {
        useTagsTicketCountTimeSeriesMock.mockReturnValue({
            data: exampleResponse,
            isLoading: false,
        } as any)
    })

    it('should return formatted data and dateTimes', () => {
        const { result } = renderHook(() => useTicketCountPerTag(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current.dateTimes).toEqual(
            getPeriodDateTimes(getFilterDateRange(period), granularity),
        )

        expect(result.current.data).toContainEqual({
            tagId,
            tag: tags.find((tag) => String(tag.id) === tagId),
            total: exampleResponse[tagId][0].reduce(
                (sum, item) => sum + item.value,
                0,
            ),
            timeSeries: exampleResponse[tagId][0],
        })
        expect(result.current.data).toContainEqual({
            tagId: anotherTagId,
            tag: tags.find((tag) => String(tag.id) === anotherTagId),
            total: exampleResponse[anotherTagId][0].reduce(
                (sum, item) => sum + item.value,
                0,
            ),
            timeSeries: exampleResponse[anotherTagId][0],
        })
    })

    it('should return data sorted by totals column', () => {
        const state: RootState = {
            ...defaultState,
            ui: {
                ...defaultState.ui,
                stats: {
                    ...defaultState.ui.stats,
                    [tagsReportSlice.name]: {
                        ...initialState,
                        order: {
                            column: 'total',
                            direction: OrderDirection.Asc,
                        },
                    },
                },
            },
        }

        const { result } = renderHook(() => useTicketCountPerTag(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.dateTimes).toEqual(
            getPeriodDateTimes(getFilterDateRange(period), granularity),
        )

        expect(result.current.data[0]).toEqual({
            tagId: thirdTagId,
            tag: tags.find((tag) => String(tag.id) === thirdTagId),
            total: exampleResponse[thirdTagId][0].reduce(
                (sum, item) => sum + item.value,
                0,
            ),
            timeSeries: exampleResponse[thirdTagId][0],
        })
    })

    it('should return data sorted by first time Series column', () => {
        const state: RootState = {
            ...defaultState,
            ui: {
                ...defaultState.ui,
                stats: {
                    ...defaultState.ui.stats,
                    [tagsReportSlice.name]: {
                        ...initialState,
                        order: {
                            column: 0,
                            direction: OrderDirection.Asc,
                        },
                    },
                },
            },
        }

        const { result } = renderHook(() => useTicketCountPerTag(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.dateTimes).toEqual(
            getPeriodDateTimes(getFilterDateRange(period), granularity),
        )

        expect(result.current.data[0]).toEqual({
            tagId: anotherTagId,
            tag: tags.find((tag) => String(tag.id) === anotherTagId),
            total: exampleResponse[anotherTagId][0].reduce(
                (sum, item) => sum + item.value,
                0,
            ),
            timeSeries: exampleResponse[anotherTagId][0],
        })
    })

    it('should return loading and empty array when no data', () => {
        useTagsTicketCountTimeSeriesMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)
        const { result } = renderHook(() => useTicketCountPerTag(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current.dateTimes).toEqual(
            getPeriodDateTimes(getFilterDateRange(period), granularity),
        )

        expect(result.current.data).toEqual([])
        expect(result.current.isLoading).toEqual(true)
    })

    it('should return tags with no data items', () => {
        useTagsTicketCountTimeSeriesMock.mockReturnValue({
            data: { [tagId]: [] },
            isLoading: false,
        } as any)
        const { result } = renderHook(() => useTicketCountPerTag(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current.dateTimes).toEqual(
            getPeriodDateTimes(getFilterDateRange(period), granularity),
        )

        expect(result.current.data).toEqual([
            expect.objectContaining({
                tagId: tagId,
                tag: tags.find((tag) => String(tag.id) === tagId),
                total: 0,
                timeSeries: [],
            }),
        ])
        expect(result.current.isLoading).toEqual(false)
    })

    describe('sorting', () => {
        it('should sort by tag name', () => {
            const { result } = renderHook(() => useTicketCountPerTag(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            })

            act(() => {
                result.current.setOrdering('tag')
            })

            expect(result.current.data).toEqual([
                expect.objectContaining({
                    tag: undefined,
                }),
                expect.objectContaining({
                    tag: expect.objectContaining({
                        name: 'billing',
                    }),
                }),
                expect.objectContaining({
                    tag: expect.objectContaining({
                        name: 'refund',
                    }),
                }),

                expect.objectContaining({
                    tag: expect.objectContaining({
                        name: 'rejected',
                    }),
                }),
            ])

            act(() => {
                result.current.setOrdering('tag')
            })

            expect(result.current.data).toEqual([
                expect.objectContaining({
                    tag: undefined,
                }),
                expect.objectContaining({
                    tag: expect.objectContaining({
                        name: 'billing',
                    }),
                }),
                expect.objectContaining({
                    tag: expect.objectContaining({
                        name: 'refund',
                    }),
                }),

                expect.objectContaining({
                    tag: expect.objectContaining({
                        name: 'rejected',
                    }),
                }),
            ])
        })

        it('should sort by total column', () => {
            const { result } = renderHook(() => useTicketCountPerTag(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            })

            act(() => {
                result.current.setOrdering('total')
            })

            expect(result.current.data).toEqual([
                expect.objectContaining({
                    total: 1998,
                }),
                expect.objectContaining({
                    total: 57,
                }),
                expect.objectContaining({
                    total: 55,
                }),
                expect.objectContaining({
                    total: 54,
                }),
            ])

            act(() => {
                result.current.setOrdering('total')
            })

            expect(result.current.data).toEqual([
                expect.objectContaining({
                    total: 1998,
                }),
                expect.objectContaining({
                    total: 57,
                }),
                expect.objectContaining({
                    total: 55,
                }),
                expect.objectContaining({
                    total: 54,
                }),
            ])
        })

        it('should sort by specific data column', () => {
            const store = mockStore(defaultState)
            const { result } = renderHook(() => useTicketCountPerTag(), {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            })

            act(() => {
                result.current.setOrdering(0)
            })

            expect(store.getActions()).toContainEqual(setOrder({ column: 0 }))
        })

        it('should allow changing the sorting', () => {
            const store = mockStore(defaultState)
            const { result } = renderHook(() => useTicketCountPerTag(), {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            })
            expect(result.current.order).toEqual({
                column: 'tag',
                direction: OrderDirection.Asc,
            })

            act(() => {
                result.current.setOrdering('total')
            })

            expect(store.getActions()).toContainEqual(
                setOrder({ column: 'total' }),
            )
        })
    })
})
