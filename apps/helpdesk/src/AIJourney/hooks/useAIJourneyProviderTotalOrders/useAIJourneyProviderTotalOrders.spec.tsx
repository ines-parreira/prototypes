import { renderHook } from '@repo/testing'

import { useMetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useAIJourneyProviderTotalOrders } from './useAIJourneyProviderTotalOrders'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')

describe('useAIJourneyProviderTotalOrders', () => {
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
        granularity: ReportingGranularity.Week,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return correct data when values are available', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 75, prevValue: 40 },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: [
                [
                    {
                        dateTime: '2025-07-03',
                        value: 3,
                        label: 'AIJourneyOrdersAsProvider.count',
                    },
                    {
                        dateTime: '2025-07-10',
                        value: 5,
                        label: 'AIJourneyOrdersAsProvider.count',
                    },
                ],
            ] satisfies TimeSeriesDataItem[][],
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyProviderTotalOrders(defaultOptions),
        )

        expect(result.current).toEqual({
            interpretAs: 'more-is-better',
            isLoading: false,
            label: 'Provider Orders',
            metricFormat: 'decimal-precision-1',
            prevValue: 40,
            value: 75,
            series: [
                {
                    dateTime: '2025-07-03',
                    value: 3,
                    label: 'AIJourneyOrdersAsProvider.count',
                },
                {
                    dateTime: '2025-07-10',
                    value: 5,
                    label: 'AIJourneyOrdersAsProvider.count',
                },
            ],
        })
    })

    it('should handle loading state correctly', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAIJourneyProviderTotalOrders(defaultOptions),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.value).toBe(0)
        expect(result.current.prevValue).toBe(0)
        expect(result.current.series).toEqual([])
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
            useAIJourneyProviderTotalOrders({
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
            useAIJourneyProviderTotalOrders({
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
        expect(useTimeSeries).toHaveBeenCalledWith(
            expect.anything(),
            undefined,
            false,
        )

        expect(result.current.value).toBe(0)
        expect(result.current.series).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })

    it('should use the correct provider in queries', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 10, prevValue: 5 },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: [[]],
            isFetching: false,
        })

        renderHook(() =>
            useAIJourneyProviderTotalOrders({
                ...defaultOptions,
                provider: 'attentive',
            }),
        )

        const timeSeriesCall = (useTimeSeries as jest.Mock).mock.calls[0][0]
        expect(timeSeriesCall.measures[0]).toBe(
            'AIJourneyOrdersAsProvider.count',
        )
        expect(timeSeriesCall.metricName).toBe(
            'ai-journey-provider-total-number-of-order-time-series',
        )
    })
})
