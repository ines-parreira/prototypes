import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import React from 'react'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {assumeMock} from 'utils/testing'
import {
    getCleanStatsFiltersWithTimezone,
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
} from 'state/ui/stats/selectors'
import {ReportingGranularity} from 'models/reporting/types'
import {RootState, StoreDispatch} from 'state/types'
import {
    useBreachedSlaTicketsTrend,
    useSatisfiedSlaTicketsTrend,
} from 'hooks/reporting/sla/useSLAsTicketsTrends'
import {FeatureFlagKey} from 'config/featureFlags'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus')
const useTicketsInPolicyPerStatusTrendMock = assumeMock(
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend
)

jest.mock('state/ui/stats/selectors')
const legacyStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)

const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone
)

const startDate = '2021-05-01T00:00:00+02:00'
const endDate = '2021-05-04T23:59:59+02:00'
const filters = {
    period: {
        start_datetime: startDate,
        end_datetime: endDate,
    },
}
const userTimezone = 'UTC'
const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

describe('useSLAsTicketsTrends', () => {
    beforeEach(() => {
        legacyStatsFiltersWithTimezoneMock.mockReturnValue({
            cleanStatsFilters: filters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            cleanStatsFilters: filters,
            userTimezone,
            granularity: ReportingGranularity.Day,
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

describe('useSLAsTicketsTrendsw with isAnalyticsNewFilters', () => {
    beforeEach(() => {
        legacyStatsFiltersWithTimezoneMock.mockReturnValue({
            cleanStatsFilters: filters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            cleanStatsFilters: filters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
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
        legacyStatsFiltersWithTimezoneMock.mockReturnValue({
            cleanStatsFilters: filters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            cleanStatsFilters: filters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
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
