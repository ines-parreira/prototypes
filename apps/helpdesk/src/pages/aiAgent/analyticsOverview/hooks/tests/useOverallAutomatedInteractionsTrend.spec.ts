import { assumeMock, renderHook } from '@repo/testing'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicOverallAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchOverallAutomatedInteractionsTrend,
    useOverallAutomatedInteractionsTrend,
} from 'pages/aiAgent/analyticsOverview/hooks/useOverallAutomatedInteractionsTrend'

jest.mock('domains/reporting/hooks/useStatsMetricTrend')

const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)

const mockFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
} as StatsFilters

const timezone = 'UTC'

const mockTrend = {
    isFetching: false,
    isError: false,
    data: { value: 120, prevValue: 95 },
}

describe('useOverallAutomatedInteractionsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsMetricTrend.mockReturnValue(mockTrend)
    })

    const renderHookUnderTest = (enabled?: boolean) =>
        renderHook(() =>
            useOverallAutomatedInteractionsTrend(
                mockFilters,
                timezone,
                enabled,
            ),
        )

    it('should call useStatsMetricTrend with current and previous period V2 queries', () => {
        renderHookUnderTest()

        expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
            dynamicOverallAutomatedInteractionsQueryFactoryV2({
                filters: mockFilters,
                timezone,
            }),
            dynamicOverallAutomatedInteractionsQueryFactoryV2({
                filters: {
                    ...mockFilters,
                    period: getPreviousPeriod(mockFilters.period),
                },
                timezone,
            }),
            true,
        )
    })

    it('should call useStatsMetricTrend with enabled=false when disabled', () => {
        renderHookUnderTest(false)

        expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(Object),
            false,
        )
    })

    it('should return the trend result', () => {
        const { result } = renderHookUnderTest()

        expect(result.current).toBe(mockTrend)
    })

    it('should propagate isFetching=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
            isFetching: true,
        })

        const { result } = renderHookUnderTest()

        expect(result.current.isFetching).toBe(true)
    })

    it('should propagate isError=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
            isError: true,
        })

        const { result } = renderHookUnderTest()

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchOverallAutomatedInteractionsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchStatsMetricTrend.mockResolvedValue(mockTrend)
    })

    it('should call fetchStatsMetricTrend with current and previous period V2 queries', async () => {
        await fetchOverallAutomatedInteractionsTrend(mockFilters, timezone)

        expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
            dynamicOverallAutomatedInteractionsQueryFactoryV2({
                filters: mockFilters,
                timezone,
            }),
            dynamicOverallAutomatedInteractionsQueryFactoryV2({
                filters: {
                    ...mockFilters,
                    period: getPreviousPeriod(mockFilters.period),
                },
                timezone,
            }),
        )
    })

    it('should return the trend result', async () => {
        const result = await fetchOverallAutomatedInteractionsTrend(
            mockFilters,
            timezone,
        )

        expect(result).toBe(mockTrend)
    })
})
