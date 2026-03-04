import { renderHook } from '@testing-library/react'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { zeroTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchAiAgentZeroTouchTicketsTrend,
    useAiAgentZeroTouchTicketsTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentZeroTouchTicketsTrend'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'

jest.mock('domains/reporting/hooks/useMetricTrend', () => ({
    __esModule: true,
    default: jest.fn(),
    fetchMetricTrend: jest.fn(),
}))
jest.mock(
    'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets',
)
jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
jest.mock('pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter')

const mockFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const mockTimezone = 'America/New_York'
const mockAiAgentUserId = 42
const mockFilteredFilters = {
    ...mockFilters,
    agents: { operator: 'one-of', values: [mockAiAgentUserId] },
} as StatsFilters
const mockQueryResult = { measures: ['TicketMessages.ticketCount'] }

describe('useAiAgentZeroTouchTicketsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useAIAgentUserId as jest.Mock).mockReturnValue(mockAiAgentUserId)
        ;(applyAiAgentFilter as jest.Mock).mockReturnValue(mockFilteredFilters)
        ;(zeroTouchTicketsQueryFactory as jest.Mock).mockReturnValue(
            mockQueryResult,
        )
    })

    it('should call applyAiAgentFilter with the result of useAIAgentUserId', () => {
        renderHook(() =>
            useAiAgentZeroTouchTicketsTrend(mockFilters, mockTimezone),
        )

        expect(applyAiAgentFilter).toHaveBeenCalledWith(
            mockFilters,
            mockAiAgentUserId,
        )
    })

    it('should call zeroTouchTicketsQueryFactory with filtered filters for both periods', () => {
        renderHook(() =>
            useAiAgentZeroTouchTicketsTrend(mockFilters, mockTimezone),
        )

        expect(zeroTouchTicketsQueryFactory).toHaveBeenCalledWith(
            mockFilteredFilters,
            mockTimezone,
        )
        expect(zeroTouchTicketsQueryFactory).toHaveBeenCalledWith(
            {
                ...mockFilteredFilters,
                period: getPreviousPeriod(mockFilteredFilters.period),
            },
            mockTimezone,
        )
    })

    it('should call useMetricTrend with AI_AGENT_ZERO_TOUCH_TICKETS metricName for both queries', () => {
        renderHook(() =>
            useAiAgentZeroTouchTicketsTrend(mockFilters, mockTimezone),
        )

        expect(useMetricTrend).toHaveBeenCalledWith(
            {
                ...mockQueryResult,
                metricName: METRIC_NAMES.AI_AGENT_ZERO_TOUCH_TICKETS,
            },
            {
                ...mockQueryResult,
                metricName: METRIC_NAMES.AI_AGENT_ZERO_TOUCH_TICKETS,
            },
        )
    })

    it('should return the value from useMetricTrend', () => {
        const mockReturnValue = {
            data: { value: 120, prevValue: 100 },
            isFetching: false,
            isError: false,
        }
        ;(useMetricTrend as jest.Mock).mockReturnValue(mockReturnValue)

        const { result } = renderHook(() =>
            useAiAgentZeroTouchTicketsTrend(mockFilters, mockTimezone),
        )

        expect(result.current).toBe(mockReturnValue)
    })
})

describe('fetchAiAgentZeroTouchTicketsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(applyAiAgentFilter as jest.Mock).mockReturnValue(mockFilteredFilters)
        ;(zeroTouchTicketsQueryFactory as jest.Mock).mockReturnValue(
            mockQueryResult,
        )
    })

    it('should call applyAiAgentFilter with the passed aiAgentUserId', async () => {
        ;(fetchMetricTrend as jest.Mock).mockResolvedValue({})

        await fetchAiAgentZeroTouchTicketsTrend(
            mockFilters,
            mockTimezone,
            mockAiAgentUserId,
        )

        expect(applyAiAgentFilter).toHaveBeenCalledWith(
            mockFilters,
            mockAiAgentUserId,
        )
    })

    it('should return the resolved value from fetchMetricTrend', async () => {
        const mockReturnValue = {
            data: { value: 120, prevValue: 100 },
            isFetching: false,
            isError: false,
        }
        ;(fetchMetricTrend as jest.Mock).mockResolvedValue(mockReturnValue)

        const result = await fetchAiAgentZeroTouchTicketsTrend(
            mockFilters,
            mockTimezone,
            mockAiAgentUserId,
        )

        expect(result).toBe(mockReturnValue)
    })
})
