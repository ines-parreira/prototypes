import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import _keyBy from 'lodash/keyBy'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useFlag } from 'core/flags'
import { TagSelection } from 'domains/reporting/hooks/tags/useTagResultsSelection'
import { filterTimeDataWithSelectedTags } from 'domains/reporting/hooks/ticket-insights/helpers'
import { useTicketCountPerTag } from 'domains/reporting/hooks/ticket-insights/useTicketCountPerTag'
import {
    useTagsTicketCountTimeSeries,
    useTotalTaggedTicketCountTimeSeries,
} from 'domains/reporting/hooks/timeSeries'
import { getPeriodDateTimes } from 'domains/reporting/hooks/useTimeSeries'
import type { Period } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { defaultStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import {
    initialState,
    setOrder,
    tagsReportSlice,
} from 'domains/reporting/state/ui/stats/tagsReportSlice'
import { getFilterDateRange } from 'domains/reporting/utils/reporting'
import { tags } from 'fixtures/tag'
import { OrderDirection } from 'models/api/types'
import type { RootState, StoreDispatch } from 'state/types'

jest.mock('core/flags')
const useFlagsMock = assumeMock(useFlag)

jest.mock('domains/reporting/hooks/timeSeries')
const useTagsTicketCountTimeSeriesMock = assumeMock(
    useTagsTicketCountTimeSeries,
)
const useTotalTaggedTicketCountTimeSeriesMock = assumeMock(
    useTotalTaggedTicketCountTimeSeries,
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
                    dateTime: period.start_datetime,
                    value: 37,
                    label: 'TicketTagsEnriched.ticketCount',
                },

                {
                    dateTime: period.end_datetime,
                    value: 18,
                    label: 'TicketTagsEnriched.ticketCount',
                },
            ],
        ],
        [anotherTagId]: [
            [
                {
                    dateTime: period.start_datetime,
                    value: 12,
                    label: 'TicketTagsEnriched.ticketCount',
                },

                {
                    dateTime: period.end_datetime,
                    value: 45,
                    label: 'TicketTagsEnriched.ticketCount',
                },
            ],
        ],
        [thirdTagId]: [
            [
                {
                    dateTime: period.start_datetime,
                    value: 24,
                    label: 'TicketTagsEnriched.ticketCount',
                },

                {
                    dateTime: period.end_datetime,
                    value: 30,
                    label: 'TicketTagsEnriched.ticketCount',
                },
            ],
        ],
        [deletedTagId]: [
            [
                {
                    dateTime: period.start_datetime,
                    value: 999,
                    label: 'TicketTagsEnriched.ticketCount',
                },

                {
                    dateTime: period.end_datetime,
                    value: 999,
                    label: 'TicketTagsEnriched.ticketCount',
                },
            ],
        ],
    }

    const exampleTotalTaggedTicketCountTimeSeries = [
        [
            {
                dateTime: period.start_datetime,
                value: 37,
                label: 'TicketTagsEnriched.ticketCount',
            },
            {
                dateTime: period.end_datetime,
                value: 18,
                label: 'TicketTagsEnriched.ticketCount',
            },
        ],
    ]

    beforeEach(() => {
        useTagsTicketCountTimeSeriesMock.mockReturnValue({
            data: exampleResponse,
            isLoading: false,
        } as any)

        useTotalTaggedTicketCountTimeSeriesMock.mockReturnValue({
            data: exampleTotalTaggedTicketCountTimeSeries,
            isLoading: false,
        } as any)

        useFlagsMock.mockReturnValue(false)
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

    it('should apply the new percent calculations when the feature flag is enabled', () => {
        useFlagsMock.mockReturnValue(true)

        const { result } = renderHook(() => useTicketCountPerTag(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current.grandTotal).toEqual(
            exampleTotalTaggedTicketCountTimeSeries[0].reduce(
                (sum, item) => sum + item.value,
                0,
            ),
        )
        expect(result.current.columnTotals).toEqual(
            exampleTotalTaggedTicketCountTimeSeries[0].map(
                (item) => item.value,
            ),
        )
    })

    it('should return defaults when no data and the feature flag is enabled', () => {
        useFlagsMock.mockReturnValue(true)

        useTotalTaggedTicketCountTimeSeriesMock.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as any)

        const { result } = renderHook(() => useTicketCountPerTag(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current.grandTotal).toEqual(0)
        expect(result.current.columnTotals).toEqual([])
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
        useTotalTaggedTicketCountTimeSeriesMock.mockReturnValue({
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

    describe('filterTimeDataWithSelectedTags', () => {
        const firstTagId = 525510

        const data = [
            {
                tagId: firstTagId.toString(),
                tag: {
                    created_datetime: '2025-02-26T22:47:11.927981+00:00',
                    decoration: {
                        color: '#f50ca9',
                    },
                    deleted_datetime: null,
                    description: null,
                    id: 712667,
                    name: 'Chat campaign - Exit Intent',
                    uri: '/api/tags/712667/',
                    usage: 3,
                },
                total: 3,
                timeSeries: [
                    {
                        dateTime: '2024-12-16T00:00:00.000',
                        value: 0,
                        label: 'TicketTagsEnriched.ticketCount',
                    },
                ],
            },
            {
                tagId: '713249',
                tag: {
                    created_datetime: '2025-03-03T13:13:30.178619+00:00',
                    decoration: {
                        color: '#430950',
                    },
                    deleted_datetime: null,
                    description: null,
                    id: 713249,
                    name: 'Chat campaign - French visitors',
                    uri: '/api/tags/713249/',
                    usage: 3,
                },
                total: 3,
                timeSeries: [
                    {
                        dateTime: '2024-12-16T00:00:00.000',
                        value: 0,
                        label: 'TicketTagsEnriched.ticketCount',
                    },
                    {
                        dateTime: '2024-12-23T00:00:00.000',
                        value: 0,
                        label: 'TicketTagsEnriched.ticketCount',
                    },
                ],
            },
        ]

        const statsFilters = {
            ...defaultStatsFilters,
            tags: [
                {
                    operator: LogicalOperatorEnum.ALL_OF,
                    values: [firstTagId],
                    filterInstanceId: TagFilterInstanceId.First,
                },
            ],
        }

        it('should return filtered data if tagResultsSelection is equal to TagSelection.excludeTags', () => {
            const { result } = renderHook(
                () =>
                    filterTimeDataWithSelectedTags({
                        data,
                        statsFilters,
                        tagResultsSelection: TagSelection.excludeTags,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual([data[0]])
        })
    })
})
