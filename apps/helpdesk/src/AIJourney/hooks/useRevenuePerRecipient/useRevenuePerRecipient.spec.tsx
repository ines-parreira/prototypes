import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useRevenuePerRecipient } from './useRevenuePerRecipient'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')

describe('useRevenuePerRecipient', () => {
    const mockUserTimezone = 'America/New_York'
    const mockFilters = {
        period: {
            start_datetime: '2025-07-03T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should calculate revenue per recipient correctly', () => {
        let metricTrendCallCount = 0
        ;(useMetricTrend as jest.Mock).mockImplementation(() => {
            metricTrendCallCount++
            if (metricTrendCallCount === 1) {
                return {
                    data: { value: 1000, prevValue: 500 },
                    isFetching: false,
                }
            }

            if (metricTrendCallCount === 2) {
                return {
                    data: { value: 50, prevValue: 25 },
                    isFetching: false,
                }
            }

            return {
                data: null,
                isFetching: false,
            }
        })

        let timeSeriesCallCount = 0
        ;(useTimeSeries as jest.Mock).mockImplementation(() => {
            timeSeriesCallCount++
            if (timeSeriesCallCount === 1) {
                return {
                    data: [
                        [
                            {
                                dateTime: '2025-07-03',
                                value: 500,
                                label: AiSalesAgentOrdersMeasure.Gmv,
                            },
                            {
                                dateTime: '2025-07-10',
                                value: 1000,
                                label: AiSalesAgentOrdersMeasure.Gmv,
                            },
                        ],
                    ] satisfies TimeSeriesDataItem[][],
                    isFetching: false,
                }
            }

            if (timeSeriesCallCount === 2) {
                return {
                    data: [
                        [
                            {
                                dateTime: '2025-07-03',
                                value: 25,
                                label: AiSalesAgentConversationsMeasure.Count,
                            },
                            {
                                dateTime: '2025-07-10',
                                value: 50,
                                label: AiSalesAgentConversationsMeasure.Count,
                            },
                        ],
                    ] satisfies TimeSeriesDataItem[][],
                    isFetching: false,
                }
            }

            return {
                data: undefined,
                isFetching: false,
            }
        })

        const { result } = renderHook(() =>
            useRevenuePerRecipient({
                integrationId: '123',
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                currency: 'USD',
                granularity: ReportingGranularity.Week,
            }),
        )

        expect(result.current.value).toBe(20)
        expect(result.current.prevValue).toBe(20)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.label).toBe('Revenue Per Recipient')
        expect(result.current.metricFormat).toBe('currency')
        expect(result.current.currency).toBe('USD')
        expect(result.current.series).toEqual([
            {
                dateTime: '2025-07-03',
                label: 'AiSalesAgentOrders.gmv',
                value: 20,
            },
            {
                dateTime: '2025-07-10',
                label: 'AiSalesAgentOrders.gmv',
                value: 20,
            },
        ])
    })

    it('should handle loading state correctly', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: null,
            isFetching: true,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useRevenuePerRecipient({
                integrationId: '123',
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                currency: 'USD',
                granularity: ReportingGranularity.Week,
            }),
        )

        expect(result.current.value).toBe(0)
        expect(result.current.isLoading).toBe(true)
    })

    it('should return 0 when recipients value is 0', () => {
        let metricTrendCallCount = 0
        ;(useMetricTrend as jest.Mock).mockImplementation(() => {
            metricTrendCallCount++
            if (metricTrendCallCount === 1) {
                return {
                    data: { value: 1000, prevValue: 500 },
                    isFetching: false,
                }
            }

            if (metricTrendCallCount === 2) {
                return {
                    data: { value: 0, prevValue: 0 },
                    isFetching: false,
                }
            }

            return {
                data: null,
                isFetching: false,
            }
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useRevenuePerRecipient({
                integrationId: '123',
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                currency: 'USD',
                granularity: ReportingGranularity.Week,
            }),
        )

        expect(result.current.value).toBe(0)
    })

    it('should handle missing data correctly', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: null,
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useRevenuePerRecipient({
                integrationId: '123',
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                currency: 'USD',
                granularity: ReportingGranularity.Week,
            }),
        )

        expect(result.current.value).toBe(0)
    })

    it('should handle edge case of previous value being 0', () => {
        let metricTrendCallCount = 0
        ;(useMetricTrend as jest.Mock).mockImplementation(() => {
            metricTrendCallCount++
            if (metricTrendCallCount === 1) {
                return {
                    data: { value: 1000, prevValue: 0 },
                    isFetching: false,
                }
            }

            if (metricTrendCallCount === 2) {
                return {
                    data: { value: 50, prevValue: 25 },
                    isFetching: false,
                }
            }

            return {
                data: null,
                isFetching: false,
            }
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useRevenuePerRecipient({
                integrationId: '123',
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                currency: 'USD',
                granularity: ReportingGranularity.Week,
            }),
        )

        expect(result.current.value).toBe(20)
        expect(result.current.prevValue).toBe(0)
    })

    it('should disable queries and return zeroed values when no flows or campaigns are selected', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useRevenuePerRecipient({
                integrationId: '123',
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                currency: 'USD',
                granularity: ReportingGranularity.Week,
                forceEmpty: true,
            }),
        )

        const metricTrendCalls = (useMetricTrend as jest.Mock).mock.calls
        metricTrendCalls.forEach((call) => {
            expect(call[4]).toBe(false)
        })
        const timeSeriesCalls = (useTimeSeries as jest.Mock).mock.calls
        timeSeriesCalls.forEach((call) => {
            expect(call[2]).toBe(false)
        })

        expect(result.current.value).toBe(0)
        expect(result.current.prevValue).toBe(0)
        expect(result.current.series).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })
})
