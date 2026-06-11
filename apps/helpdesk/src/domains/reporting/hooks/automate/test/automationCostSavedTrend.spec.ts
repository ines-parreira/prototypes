import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchAutomationCostSavedTrend,
    formatCostSavedData,
    useAutomationCostSavedTrend,
} from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicOverallAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')

const mockUseMoneySavedPerInteractionWithAutomate = assumeMock(
    useMoneySavedPerInteractionWithAutomate,
)
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2021-05-29T00:00:00.000',
        end_datetime: '2021-06-04T23:59:59.000',
    },
}
const userTimezone = 'UTC'
const moneySavedPerInteractionWithAutomate = 123

const mockTrend = {
    data: { value: 3, prevValue: 5 },
    isFetching: false,
    isError: false,
}

describe('useAutomationCostSavedTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseMoneySavedPerInteractionWithAutomate.mockReturnValue(
            moneySavedPerInteractionWithAutomate,
        )
        mockUseStatsMetricTrend.mockReturnValue(mockTrend)
    })

    const renderCostSavedTrendHook = () =>
        renderHook(() =>
            useAutomationCostSavedTrend(statsFilters, userTimezone),
        )

    it('should call useStatsMetricTrend with current and previous period V2 queries', () => {
        renderCostSavedTrendHook()

        expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
            dynamicOverallAutomatedInteractionsQueryFactoryV2({
                filters: statsFilters,
                timezone: userTimezone,
            }),
            dynamicOverallAutomatedInteractionsQueryFactoryV2({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone: userTimezone,
            }),
        )
    })

    it('should calculate and format trend from v2', () => {
        const { result } = renderCostSavedTrendHook()

        expect(result.current).toEqual({
            data: formatCostSavedData(
                mockTrend,
                moneySavedPerInteractionWithAutomate,
            ),
            isFetching: false,
            isError: false,
        })
    })

    it('should return 0s on empty data', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            data: { value: null, prevValue: null },
            isFetching: false,
            isError: false,
        })

        const { result } = renderCostSavedTrendHook()

        expect(result.current.data).toEqual({ value: 0, prevValue: 0 })
    })

    it('should propagate isFetching=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
            isFetching: true,
        })

        const { result } = renderCostSavedTrendHook()

        expect(result.current.isFetching).toBe(true)
    })

    it('should propagate isError=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
            isError: true,
        })

        const { result } = renderCostSavedTrendHook()

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchAutomationCostSavedTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockFetchStatsMetricTrend.mockResolvedValue(mockTrend)
    })

    it('should call fetchStatsMetricTrend with current and previous period V2 queries', async () => {
        await fetchAutomationCostSavedTrend(
            statsFilters,
            userTimezone,
            undefined,
            moneySavedPerInteractionWithAutomate,
        )

        expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
            dynamicOverallAutomatedInteractionsQueryFactoryV2({
                filters: statsFilters,
                timezone: userTimezone,
            }),
            dynamicOverallAutomatedInteractionsQueryFactoryV2({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone: userTimezone,
            }),
        )
    })

    it('should calculate and format trend from v2', async () => {
        const result = await fetchAutomationCostSavedTrend(
            statsFilters,
            userTimezone,
            undefined,
            moneySavedPerInteractionWithAutomate,
        )

        expect(result).toEqual({
            data: formatCostSavedData(
                mockTrend,
                moneySavedPerInteractionWithAutomate,
            ),
            isFetching: false,
            isError: false,
        })
    })
})
