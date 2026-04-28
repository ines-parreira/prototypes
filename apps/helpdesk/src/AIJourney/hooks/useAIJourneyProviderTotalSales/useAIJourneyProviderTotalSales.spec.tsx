import { renderHook } from '@repo/testing'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useAIJourneyProviderTotalSales } from './useAIJourneyProviderTotalSales'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')

describe('useAIJourneyProviderTotalSales', () => {
    const mockFilters = {
        period: {
            start_datetime: '2025-07-03T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    }

    const defaultOptions = {
        provider: 'klaviyo' as const,
        integrationId: '123',
        userTimezone: 'America/New_York',
        filters: mockFilters,
        currency: 'USD',
        granularity: ReportingGranularity.Week,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return correct data when values are available', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 5000, prevValue: 3000 },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: [
                [
                    {
                        dateTime: '2025-07-03',
                        value: 2000,
                        label: 'AIJourneyOrdersAsProvider.gmv',
                    },
                    {
                        dateTime: '2025-07-10',
                        value: 3000,
                        label: 'AIJourneyOrdersAsProvider.gmv',
                    },
                ],
            ] satisfies TimeSeriesDataItem[][],
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyProviderTotalSales(defaultOptions),
        )

        expect(result.current).toEqual({
            interpretAs: 'more-is-better',
            isLoading: false,
            label: 'Provider Total Sales',
            metricFormat: 'currency',
            currency: 'USD',
            prevValue: 3000,
            value: 5000,
            series: [
                {
                    dateTime: '2025-07-03',
                    value: 2000,
                    label: 'AIJourneyOrdersAsProvider.gmv',
                },
                {
                    dateTime: '2025-07-10',
                    value: 3000,
                    label: 'AIJourneyOrdersAsProvider.gmv',
                },
            ],
        })
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
            useAIJourneyProviderTotalSales(defaultOptions),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.label).toBe('Provider Total Sales')
        expect(result.current.currency).toBe('USD')
    })

    it('should handle undefined prevValue', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 1500, prevValue: undefined },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyProviderTotalSales(defaultOptions),
        )

        expect(result.current.value).toBe(1500)
        expect(result.current.prevValue).toBeUndefined()
    })

    it('should disable queries when provider is null', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyProviderTotalSales({
                ...defaultOptions,
                provider: null,
            }),
        )

        expect(useMetricTrend).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            undefined,
            undefined,
            false,
        )
        expect(useTimeSeries).toHaveBeenCalledWith(
            expect.anything(),
            undefined,
            false,
        )

        expect(result.current.value).toBe(0)
        expect(result.current.prevValue).toBe(0)
        expect(result.current.series).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })

    it('should disable queries when forceEmpty is true', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyProviderTotalSales({
                ...defaultOptions,
                forceEmpty: true,
            }),
        )

        expect(useMetricTrend).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            undefined,
            undefined,
            false,
        )

        expect(result.current.value).toBe(0)
        expect(result.current.series).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })

    it('should use the correct provider in queries', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 100, prevValue: 50 },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: [[]],
            isFetching: false,
        })

        renderHook(() =>
            useAIJourneyProviderTotalSales({
                ...defaultOptions,
                provider: 'postscript',
            }),
        )

        const timeSeriesCall = (useTimeSeries as jest.Mock).mock.calls[0][0]
        expect(timeSeriesCall.measures[0]).toBe('AIJourneyOrdersAsProvider.gmv')
        expect(timeSeriesCall.metricName).toBe(
            'ai-journey-provider-gmv-influenced-time-series',
        )
    })
})
