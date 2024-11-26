import {renderHook} from '@testing-library/react-hooks'

import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import {
    useBreachedSlaTicketsTrend,
    useSatisfiedSlaTicketsTrend,
} from 'hooks/reporting/sla/useSLAsTicketsTrends'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {ReportingGranularity} from 'models/reporting/types'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus')
const useTicketsInPolicyPerStatusTrendMock = assumeMock(
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend
)

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

const startDate = '2021-05-01T00:00:00+02:00'
const endDate = '2021-05-04T23:59:59+02:00'
const filters = {
    period: {
        start_datetime: startDate,
        end_datetime: endDate,
    },
}
const userTimezone = 'UTC'

describe('useSLAsTicketsTrends', () => {
    beforeEach(() => {
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: filters,
            userTimezone,
            granularity: ReportingGranularity.Day,
            isAnalyticsNewFilters: true,
        })
    })

    it.each([
        {
            hook: useBreachedSlaTicketsTrend,
            expectedTicketStatus: TicketSLAStatus.Breached,
        },
        {
            hook: useSatisfiedSlaTicketsTrend,
            expectedTicketStatus: TicketSLAStatus.Satisfied,
        },
    ])(
        'should call $hook.name with correct ticket status $expectedTicketStatus',
        ({hook, expectedTicketStatus}) => {
            renderHook(() => hook(), {
                wrapper: ({children}) => (
                    <Provider store={mockStore({})}>{children}</Provider>
                ),
            })

            expect(useTicketsInPolicyPerStatusTrendMock).toHaveBeenCalledWith(
                filters,
                userTimezone,
                undefined,
                expectedTicketStatus
            )
        }
    )
})

describe('useSLAsTicketsTrends with isAnalyticsNewFilters', () => {
    beforeEach(() => {
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: filters,
            userTimezone,
            granularity: ReportingGranularity.Day,
            isAnalyticsNewFilters: true,
        })
    })

    it.each([
        {
            hook: useBreachedSlaTicketsTrend,
            expectedTicketStatus: TicketSLAStatus.Breached,
        },
        {
            hook: useSatisfiedSlaTicketsTrend,
            expectedTicketStatus: TicketSLAStatus.Satisfied,
        },
    ])(
        'should call $hook.name with correct ticket status $expectedTicketStatus',
        ({hook, expectedTicketStatus}) => {
            renderHook(() => hook(), {
                wrapper: ({children}) => (
                    <Provider store={mockStore({})}>{children}</Provider>
                ),
            })

            expect(useTicketsInPolicyPerStatusTrendMock).toHaveBeenCalledWith(
                filters,
                userTimezone,
                undefined,
                expectedTicketStatus
            )
        }
    )
})

describe('useSLAsTicketsTrends with isAnalyticsNewFilters', () => {
    beforeEach(() => {
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: filters,
            userTimezone,
            granularity: ReportingGranularity.Day,
            isAnalyticsNewFilters: true,
        })
    })

    it.each([
        {
            hook: useBreachedSlaTicketsTrend,
            expectedTicketStatus: TicketSLAStatus.Breached,
        },
        {
            hook: useSatisfiedSlaTicketsTrend,
            expectedTicketStatus: TicketSLAStatus.Satisfied,
        },
    ])(
        'should call $hook.name with correct ticket status $expectedTicketStatus',
        ({hook, expectedTicketStatus}) => {
            renderHook(() => hook(), {
                wrapper: ({children}) => (
                    <Provider store={mockStore({})}>{children}</Provider>
                ),
            })

            expect(useTicketsInPolicyPerStatusTrendMock).toHaveBeenCalledWith(
                filters,
                userTimezone,
                undefined,
                expectedTicketStatus
            )
        }
    )
})
