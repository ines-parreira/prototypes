import { assumeMock, renderHook } from '@repo/testing'

import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { automatedSalesConversationsQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchAutomatedSalesConversationsTrend,
    useAutomatedSalesConversationsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useAutomatedSalesConversationsTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend')

const mockUseMetricTrend = assumeMock(useMetricTrend)
const mockFetchMetricTrend = assumeMock(fetchMetricTrend)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2021-05-29T00:00:00.000',
        end_datetime: '2021-06-04T23:59:59.000',
    },
}
const timezone = 'UTC'

const mockTrend = {
    data: { value: 5, prevValue: 3 },
    isFetching: false,
    isError: false,
}

describe('useAutomatedSalesConversationsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseMetricTrend.mockReturnValue(mockTrend)
    })

    it('should call useMetricTrend with current and previous period queries', () => {
        renderHook(() =>
            useAutomatedSalesConversationsTrend(statsFilters, timezone),
        )

        expect(mockUseMetricTrend).toHaveBeenCalledWith(
            automatedSalesConversationsQueryFactory(statsFilters, timezone),
            automatedSalesConversationsQueryFactory(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            ),
            undefined,
            undefined,
            true,
        )
    })

    it('should pass enabled=false when disabled', () => {
        renderHook(() =>
            useAutomatedSalesConversationsTrend(statsFilters, timezone, false),
        )

        expect(mockUseMetricTrend).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(Object),
            undefined,
            undefined,
            false,
        )
    })

    it('should return the result from useMetricTrend', () => {
        const { result } = renderHook(() =>
            useAutomatedSalesConversationsTrend(statsFilters, timezone),
        )

        expect(result.current).toEqual(mockTrend)
    })
})

describe('fetchAutomatedSalesConversationsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchMetricTrend.mockResolvedValue(mockTrend)
    })

    it('should call fetchMetricTrend with current and previous period queries', async () => {
        await fetchAutomatedSalesConversationsTrend(statsFilters, timezone)

        expect(mockFetchMetricTrend).toHaveBeenCalledWith(
            automatedSalesConversationsQueryFactory(statsFilters, timezone),
            automatedSalesConversationsQueryFactory(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            ),
        )
    })

    it('should return the result from fetchMetricTrend', async () => {
        const result = await fetchAutomatedSalesConversationsTrend(
            statsFilters,
            timezone,
        )

        expect(result).toEqual(mockTrend)
    })
})
