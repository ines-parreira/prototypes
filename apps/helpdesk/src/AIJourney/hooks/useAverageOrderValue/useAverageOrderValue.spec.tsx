import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useAverageOrderValue } from './useAverageOrderValue'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')

describe('useAverageOrderValue', () => {
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

    it('should calculate average order value correctly', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === AiSalesAgentOrdersMeasure.Gmv) {
                return {
                    data: { value: 1000, prevValue: 500 },
                    isFetching: false,
                }
            }

            if (measures === AiSalesAgentOrdersMeasure.Count) {
                return {
                    data: { value: 20, prevValue: 10 },
                    isFetching: false,
                }
            }

            return {
                data: null,
                isFetching: false,
            }
        })
        ;(useTimeSeries as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === AiSalesAgentOrdersMeasure.Gmv) {
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

            if (measures === AiSalesAgentOrdersMeasure.Count) {
                return {
                    data: [
                        [
                            {
                                dateTime: '2025-07-03',
                                value: 10,
                                label: AiSalesAgentOrdersMeasure.Count,
                            },
                            {
                                dateTime: '2025-07-10',
                                value: 20,
                                label: AiSalesAgentOrdersMeasure.Count,
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
            useAverageOrderValue({
                integrationId: '123',
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                currency: 'USD',
                granularity: ReportingGranularity.Week,
            }),
        )

        expect(result.current.value).toBe(50)
        expect(result.current.prevValue).toBe(50)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.label).toBe('Average Order Value')
        expect(result.current.metricFormat).toBe('currency')
        expect(result.current.currency).toBe('USD')
        expect(result.current.series).toEqual([
            {
                dateTime: '2025-07-03',
                label: 'AiSalesAgentOrders.gmv',
                value: 50,
            },
            {
                dateTime: '2025-07-10',
                label: 'AiSalesAgentOrders.gmv',
                value: 50,
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
            useAverageOrderValue({
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

    it('should return 0 when orders value is 0', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === AiSalesAgentOrdersMeasure.Gmv) {
                return {
                    data: { value: 1000, prevValue: 500 },
                    isFetching: false,
                }
            }

            if (measures === AiSalesAgentOrdersMeasure.Count) {
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
            useAverageOrderValue({
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
            useAverageOrderValue({
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
        ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === AiSalesAgentOrdersMeasure.Gmv) {
                return {
                    data: { value: 1000, prevValue: 0 },
                    isFetching: false,
                }
            }

            if (measures === AiSalesAgentOrdersMeasure.Count) {
                return {
                    data: { value: 20, prevValue: 10 },
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
            useAverageOrderValue({
                integrationId: '123',
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                currency: 'USD',
                granularity: ReportingGranularity.Week,
            }),
        )

        expect(result.current.value).toBe(50)
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
            useAverageOrderValue({
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
