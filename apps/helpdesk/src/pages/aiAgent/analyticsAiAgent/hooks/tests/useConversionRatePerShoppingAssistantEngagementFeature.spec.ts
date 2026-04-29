import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchConversionRatePerShoppingAssistantEngagementFeature,
    useConversionRatePerShoppingAssistantEngagementFeature,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useConversionRatePerShoppingAssistantEngagementFeature'

const timezone = 'UTC'

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000',
        end_datetime: '2024-01-31T23:50:59.999',
    },
}

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useStatsMetricPerDimension: jest.fn(),
    fetchStatsMetricPerDimension: jest.fn(),
}))
const mockUseStatsMetricPerDimension = assumeMock(useStatsMetricPerDimension)
const mockFetchStatsMetricPerDimension = assumeMock(
    fetchStatsMetricPerDimension,
)

const defaultData = {
    value: null,
    decile: null,
    allData: [],
    allValues: [
        { dimension: 'search_bar', value: 0.15, decile: null },
        { dimension: 'ask_anything', value: 0.05, decile: null },
    ],
}

describe('useConversionRatePerShoppingAssistantEngagementFeature', () => {
    it('should return data from useStatsMetricPerDimension', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: defaultData,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() =>
            useConversionRatePerShoppingAssistantEngagementFeature(
                statsFilters,
                timezone,
            ),
        )

        expect(result.current).toEqual({
            data: defaultData,
            isFetching: false,
            isError: false,
        })
    })

    it('should forward isFetching state', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: undefined as any,
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() =>
            useConversionRatePerShoppingAssistantEngagementFeature(
                statsFilters,
                timezone,
            ),
        )

        expect(result.current.isFetching).toBe(true)
        expect(result.current.isError).toBe(false)
    })

    it('should forward isError state', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: undefined as any,
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(() =>
            useConversionRatePerShoppingAssistantEngagementFeature(
                statsFilters,
                timezone,
            ),
        )

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchConversionRatePerShoppingAssistantEngagementFeature', () => {
    it('should return data from fetchStatsMetricPerDimension', async () => {
        mockFetchStatsMetricPerDimension.mockResolvedValue({
            data: defaultData,
            isFetching: false,
            isError: false,
        })

        const result =
            await fetchConversionRatePerShoppingAssistantEngagementFeature(
                statsFilters,
                timezone,
            )

        expect(result).toEqual({
            data: defaultData,
            isFetching: false,
            isError: false,
        })
    })

    it('should forward isError when fetchStatsMetricPerDimension fails', async () => {
        mockFetchStatsMetricPerDimension.mockResolvedValue({
            data: undefined as any,
            isFetching: false,
            isError: true,
        })

        const result =
            await fetchConversionRatePerShoppingAssistantEngagementFeature(
                statsFilters,
                timezone,
            )

        expect(result.isError).toBe(true)
    })
})
