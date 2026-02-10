import { assumeMock, renderHook } from '@repo/testing'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useAutomatedSalesConversationsTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useAutomatedSalesConversationsTrend'
import { useResolvedInteractionsMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useResolvedInteractionsMetric'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const mockUseStatsFilters = jest.mocked(useStatsFilters)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useAutomatedSalesConversationsTrend',
)
const useAutomatedSalesConversationsTrendMock = assumeMock(
    useAutomatedSalesConversationsTrend,
)

describe('useResolvedInteractionsMetric', () => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2024-01-01T00:00:00Z',
            end_datetime: '2024-01-31T23:59:59Z',
        },
    }
    const userTimezone = 'UTC'

    beforeEach(() => {
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone,
        } as any)

        useAutomatedSalesConversationsTrendMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 100,
                prevValue: 80,
            },
        } as any)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return metric data with correct label and values', () => {
        const { result } = renderHook(() => useResolvedInteractionsMetric(), {})

        expect(result.current).toEqual({
            isFetching: false,
            isError: false,
            data: {
                label: 'Automated interactions',
                value: 100,
                prevValue: 80,
            },
        })
    })

    it('should call useAutomatedSalesConversationsTrend with filters from useAutomateFilters', () => {
        renderHook(() => useResolvedInteractionsMetric(), {})

        expect(useAutomatedSalesConversationsTrendMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
    })

    it('should call useAutomatedSalesConversationsTrend only with automate filters', () => {
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                ...statsFilters,
                channels: withDefaultLogicalOperator(['email']),
            },
            userTimezone,
        } as any)

        renderHook(() => useResolvedInteractionsMetric(), {})

        expect(useAutomatedSalesConversationsTrendMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
    })
})
