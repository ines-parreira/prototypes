import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {
    useTicketsInPolicyPerStatus,
    useTicketsInPolicyPerStatusTrend,
} from 'hooks/reporting/sla/useTicketsInPolicy'
import {
    useTicketSlaAchievementRate,
    useTicketSlaAchievementRateTrend,
} from 'hooks/reporting/sla/useTicketSlaAchievementRate'
import {ReportingGranularity} from 'models/reporting/types'
import {RootState, StoreDispatch} from 'state/types'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {calculatePercentage} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/reporting/sla/useTicketsInPolicy')
const useTicketsInPolicyPerStatusMock = assumeMock(useTicketsInPolicyPerStatus)
const useTicketsInPolicyPerStatusTrendMock = assumeMock(
    useTicketsInPolicyPerStatusTrend
)
jest.mock('state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)

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
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
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
            useTicketsInPolicyPerStatusMock.mockReturnValueOnce({
                data: {value: satisfiedTickets, decile: 0, allData: []},
                isFetching: false,
                isError: false,
            })
            useTicketsInPolicyPerStatusMock.mockReturnValueOnce({
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
        useTicketsInPolicyPerStatusMock.mockReturnValueOnce({
            data: null,
            isFetching: false,
            isError: false,
        })
        useTicketsInPolicyPerStatusMock.mockReturnValueOnce({
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

describe('useTicketSlaAchievementRateTrend', () => {
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
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            cleanStatsFilters: filters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
    })

    it('should calculate achievement rate', () => {
        const satisfiedTickets = 10
        const breachedTickets = 30
        const prevSatisfiedTickets = 5
        const prevBreachedTickets = 15
        useTicketsInPolicyPerStatusTrendMock.mockReturnValueOnce({
            data: {value: satisfiedTickets, prevValue: prevSatisfiedTickets},
            isFetching: false,
            isError: false,
        })

        useTicketsInPolicyPerStatusTrendMock.mockReturnValueOnce({
            data: {value: breachedTickets, prevValue: prevBreachedTickets},
            isFetching: false,
            isError: false,
        })

        const {result} = renderHook(() => useTicketSlaAchievementRateTrend(), {
            wrapper: ({children}) => (
                <Provider store={mockStore({})}> {children} </Provider>
            ),
        })

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
