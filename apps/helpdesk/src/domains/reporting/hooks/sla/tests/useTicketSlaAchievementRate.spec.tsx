import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
    useSatisfiedOrBreachedTicketsInPolicyPerStatus,
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
} from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import {
    fetchTicketSlaAchievementRateTrend,
    useTicketSlaAchievementRate,
    useTicketSlaAchievementRateTrend,
} from 'domains/reporting/hooks/sla/useTicketSlaAchievementRate'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { calculatePercentage } from 'domains/reporting/utils/reporting'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock(
    'domains/reporting/hooks/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus',
)
const useSatisfiedOrBreachedTicketsInPolicyPerStatusMock = assumeMock(
    useSatisfiedOrBreachedTicketsInPolicyPerStatus,
)
const useSatisfiedOrBreachedTicketsInPolicyPerStatusTrendMock = assumeMock(
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
)
const fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrendMock = assumeMock(
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useNewStatsFiltersMock = assumeMock(useStatsFilters)

describe('useTicketSlaAchievementRate', () => {
    const startDate = '2021-05-01T00:00:00+02:00'
    const endDate = '2021-05-04T23:59:59+02:00'
    const filters: StatsFilters = {
        period: {
            start_datetime: startDate,
            end_datetime: endDate,
        },
    }
    const userTimezone = 'UTC'

    beforeEach(() => {
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: filters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
    })

    it.each([
        [10, 30, calculatePercentage(10, 10 + 30)],
        [null, 30, calculatePercentage(0, 30)],
        [10, null, calculatePercentage(10, 10)],
    ])(
        'should calculate achievement rate',
        (satisfiedTickets, breachedTickets, rate) => {
            useSatisfiedOrBreachedTicketsInPolicyPerStatusMock.mockReturnValueOnce(
                {
                    data: { value: satisfiedTickets, decile: 0, allData: [] },
                    isFetching: false,
                    isError: false,
                },
            )
            useSatisfiedOrBreachedTicketsInPolicyPerStatusMock.mockReturnValueOnce(
                {
                    data: { value: breachedTickets, decile: 0, allData: [] },
                    isFetching: false,
                    isError: false,
                },
            )

            const { result } = renderHook(() => useTicketSlaAchievementRate(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore({})}> {children} </Provider>
                ),
            })

            expect(result.current).toEqual({
                data: {
                    value: rate,
                },
                isFetching: false,
                isError: false,
            })
        },
    )

    it('should calculate achievement rate even when data is not available', () => {
        const breachedTickets = 30
        const expectedRate = 0
        useSatisfiedOrBreachedTicketsInPolicyPerStatusMock.mockReturnValueOnce({
            data: null,
            isFetching: false,
            isError: false,
        })
        useSatisfiedOrBreachedTicketsInPolicyPerStatusMock.mockReturnValueOnce({
            data: { value: breachedTickets, decile: 0, allData: [] },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useTicketSlaAchievementRate(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore({})}> {children} </Provider>
            ),
        })

        expect(result.current).toEqual({
            data: {
                value: expectedRate,
            },
            isFetching: false,
            isError: false,
        })
    })
})

describe('TicketSlaAchievementRate', () => {
    const startDate = '2021-05-01T00:00:00+02:00'
    const endDate = '2021-05-04T23:59:59+02:00'
    const filters = {
        period: {
            start_datetime: startDate,
            end_datetime: endDate,
        },
    }
    const userTimezone = 'UTC'

    describe('useTicketSlaAchievementRateTrend', () => {
        it('should calculate achievement rate', () => {
            const satisfiedTickets = 10
            const breachedTickets = 30
            const prevSatisfiedTickets = 5
            const prevBreachedTickets = 15
            useSatisfiedOrBreachedTicketsInPolicyPerStatusTrendMock.mockReturnValueOnce(
                {
                    data: {
                        value: satisfiedTickets,
                        prevValue: prevSatisfiedTickets,
                    },
                    isFetching: false,
                    isError: false,
                },
            )

            useSatisfiedOrBreachedTicketsInPolicyPerStatusTrendMock.mockReturnValueOnce(
                {
                    data: {
                        value: breachedTickets,
                        prevValue: prevBreachedTickets,
                    },
                    isFetching: false,
                    isError: false,
                },
            )

            const { result } = renderHook(
                () => useTicketSlaAchievementRateTrend(filters, userTimezone),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore({})}> {children} </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                data: {
                    value: calculatePercentage(
                        satisfiedTickets,
                        satisfiedTickets + breachedTickets,
                    ),
                    prevValue: calculatePercentage(
                        prevSatisfiedTickets,
                        prevSatisfiedTickets + prevBreachedTickets,
                    ),
                },
                isFetching: false,
                isError: false,
            })
        })
    })

    describe('fetchTicketSlaAchievementRateTrend', () => {
        it('should calculate achievement rate', async () => {
            const satisfiedTickets = 10
            const breachedTickets = 30
            const prevSatisfiedTickets = 5
            const prevBreachedTickets = 15
            fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrendMock.mockResolvedValueOnce(
                {
                    data: {
                        value: satisfiedTickets,
                        prevValue: prevSatisfiedTickets,
                    },
                    isFetching: false,
                    isError: false,
                },
            )

            fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrendMock.mockResolvedValueOnce(
                {
                    data: {
                        value: breachedTickets,
                        prevValue: prevBreachedTickets,
                    },
                    isFetching: false,
                    isError: false,
                },
            )

            const result = await fetchTicketSlaAchievementRateTrend(
                filters,
                userTimezone,
            )

            expect(result).toEqual({
                data: {
                    value: calculatePercentage(
                        satisfiedTickets,
                        satisfiedTickets + breachedTickets,
                    ),
                    prevValue: calculatePercentage(
                        prevSatisfiedTickets,
                        prevSatisfiedTickets + prevBreachedTickets,
                    ),
                },
                isFetching: false,
                isError: false,
            })
        })
    })
})
