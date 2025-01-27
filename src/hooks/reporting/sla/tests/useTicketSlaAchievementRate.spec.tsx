import {renderHook} from '@testing-library/react-hooks'

import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
    useSatisfiedOrBreachedTicketsInPolicyPerStatus,
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import {
    fetchTicketSlaAchievementRateTrend,
    useTicketSlaAchievementRate,
    useTicketSlaAchievementRateTrend,
} from 'hooks/reporting/sla/useTicketSlaAchievementRate'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {ReportingGranularity} from 'models/reporting/types'
import {RootState, StoreDispatch} from 'state/types'
import {calculatePercentage} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus')
const useSatisfiedOrBreachedTicketsInPolicyPerStatusMock = assumeMock(
    useSatisfiedOrBreachedTicketsInPolicyPerStatus
)
const useSatisfiedOrBreachedTicketsInPolicyPerStatusTrendMock = assumeMock(
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend
)
const fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrendMock = assumeMock(
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend
)
jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

describe('useTicketSlaAchievementRate', () => {
    const startDate = '2021-05-01T00:00:00+02:00'
    const endDate = '2021-05-04T23:59:59+02:00'
    const filters = {
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
            isAnalyticsNewFilters: true,
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
                    data: {value: satisfiedTickets, decile: 0, allData: []},
                    isFetching: false,
                    isError: false,
                }
            )
            useSatisfiedOrBreachedTicketsInPolicyPerStatusMock.mockReturnValueOnce(
                {
                    data: {value: breachedTickets, decile: 0, allData: []},
                    isFetching: false,
                    isError: false,
                }
            )

            const {result} = renderHook(() => useTicketSlaAchievementRate(), {
                wrapper: ({children}) => (
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
        }
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
            data: {value: breachedTickets, decile: 0, allData: []},
            isFetching: false,
            isError: false,
        })

        const {result} = renderHook(() => useTicketSlaAchievementRate(), {
            wrapper: ({children}) => (
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

describe('useTicketSlaAchievementRate with AnalyticsNewFilters', () => {
    it.each([
        [10, 30, calculatePercentage(10, 10 + 30)],
        [null, 30, calculatePercentage(0, 30)],
        [10, null, calculatePercentage(10, 10)],
    ])(
        'should calculate achievement rate',
        (satisfiedTickets, breachedTickets, rate) => {
            useSatisfiedOrBreachedTicketsInPolicyPerStatusMock.mockReturnValueOnce(
                {
                    data: {value: satisfiedTickets, decile: 0, allData: []},
                    isFetching: false,
                    isError: false,
                }
            )
            useSatisfiedOrBreachedTicketsInPolicyPerStatusMock.mockReturnValueOnce(
                {
                    data: {value: breachedTickets, decile: 0, allData: []},
                    isFetching: false,
                    isError: false,
                }
            )

            const {result} = renderHook(() => useTicketSlaAchievementRate(), {
                wrapper: ({children}) => (
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
        }
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
            data: {value: breachedTickets, decile: 0, allData: []},
            isFetching: false,
            isError: false,
        })

        const {result} = renderHook(() => useTicketSlaAchievementRate(), {
            wrapper: ({children}) => (
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
                }
            )

            useSatisfiedOrBreachedTicketsInPolicyPerStatusTrendMock.mockReturnValueOnce(
                {
                    data: {
                        value: breachedTickets,
                        prevValue: prevBreachedTickets,
                    },
                    isFetching: false,
                    isError: false,
                }
            )

            const {result} = renderHook(
                () => useTicketSlaAchievementRateTrend(filters, userTimezone),
                {
                    wrapper: ({children}) => (
                        <Provider store={mockStore({})}> {children} </Provider>
                    ),
                }
            )

            expect(result.current).toEqual({
                data: {
                    value: calculatePercentage(
                        satisfiedTickets,
                        satisfiedTickets + breachedTickets
                    ),
                    prevValue: calculatePercentage(
                        prevSatisfiedTickets,
                        prevSatisfiedTickets + prevBreachedTickets
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
                }
            )

            fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrendMock.mockResolvedValueOnce(
                {
                    data: {
                        value: breachedTickets,
                        prevValue: prevBreachedTickets,
                    },
                    isFetching: false,
                    isError: false,
                }
            )

            const result = await fetchTicketSlaAchievementRateTrend(
                filters,
                userTimezone
            )

            expect(result).toEqual({
                data: {
                    value: calculatePercentage(
                        satisfiedTickets,
                        satisfiedTickets + breachedTickets
                    ),
                    prevValue: calculatePercentage(
                        prevSatisfiedTickets,
                        prevSatisfiedTickets + prevBreachedTickets
                    ),
                },
                isFetching: false,
                isError: false,
            })
        })
    })
})
