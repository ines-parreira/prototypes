import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useAIJourneyTotalSales } from './useAIJourneyTotalSales'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')
jest.mock(
    'domains/reporting/models/queryFactories/ai-sales-agent/metrics',
    () => ({
        gmvInfluencedQueryFactory: jest
            .fn()
            .mockImplementation((filters) => filters),
    }),
)

describe('useAIJourneyTotalSales', () => {
    const mockUserTimezone = 'America/New_York'
    const mockFilters = {
        period: {
            start_datetime: '2025-07-03T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return loading state when data is being fetched', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAIJourneyTotalSales(
                '123',
                mockUserTimezone,
                mockFilters,
                'USD',
                ReportingGranularity.Week,
            ),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.label).toBe('Total Revenue')
        expect(result.current.currency).toBe('USD')
    })

    it('should handle undefined data', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyTotalSales(
                '123',
                mockUserTimezone,
                mockFilters,
                'USD',
                ReportingGranularity.Week,
            ),
        )

        expect(result.current.value).toBe(0)
    })

    it('should handle missing previous value', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: {
                value: 1000,
                prevValue: undefined,
            },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyTotalSales(
                '123',
                mockUserTimezone,
                mockFilters,
                'USD',
                ReportingGranularity.Week,
            ),
        )

        expect(result.current.value).toBe(1000)
    })

    it('should handle zero previous value', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: {
                value: 1000,
                prevValue: 0,
            },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyTotalSales(
                '123',
                mockUserTimezone,
                mockFilters,
                'USD',
                ReportingGranularity.Week,
            ),
        )

        expect(result.current.value).toBe(1000)
    })

    it('should return the series', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: {
                value: 1000,
                prevValue: 0,
            },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: [
                [
                    {
                        dateTime: '2025-07-03',
                        value: 100,
                        label: AiSalesAgentOrdersMeasure.Gmv,
                    },
                    {
                        dateTime: '2025-07-10',
                        value: 10,
                        label: AiSalesAgentOrdersMeasure.Gmv,
                    },
                ],
            ] satisfies TimeSeriesDataItem[][],
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyTotalSales(
                '123',
                mockUserTimezone,
                mockFilters,
                'USD',
                ReportingGranularity.Week,
            ),
        )

        expect(result.current.series).toEqual([
            {
                dateTime: '2025-07-03',
                label: 'AiSalesAgentOrders.gmv',
                value: 100,
            },
            {
                dateTime: '2025-07-10',
                label: 'AiSalesAgentOrders.gmv',
                value: 10,
            },
        ])
    })
})
