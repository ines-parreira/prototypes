import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import {
    TimeSeriesDataItem,
    useTimeSeries,
} from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { useAverageOrderValue } from './useAverageOrderValue'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')
jest.mock('pages/aiAgent/Overview/hooks/useCurrency')

describe('useAverageOrderValue', () => {
    const mockUserTimezone = 'America/New_York'
    const mockFilters = {
        period: {
            start_datetime: '2025-07-03T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    }

    beforeEach(() => {
        ;(useCurrency as jest.Mock).mockReturnValue({ currency: 'USD' })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should calculate average order value correctly', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === AiSalesAgentOrdersMeasure.GmvUsd) {
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
        })
        ;(useTimeSeries as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === AiSalesAgentOrdersMeasure.GmvUsd) {
                return {
                    data: [
                        [
                            {
                                dateTime: '2025-07-03',
                                value: 500,
                                label: AiSalesAgentOrdersMeasure.GmvUsd,
                            },
                            {
                                dateTime: '2025-07-10',
                                value: 1000,
                                label: AiSalesAgentOrdersMeasure.GmvUsd,
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
        })

        const { result } = renderHook(() =>
            useAverageOrderValue(
                '123',
                mockUserTimezone,
                mockFilters,
                ReportingGranularity.Week,
            ),
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
                label: 'AiSalesAgentOrders.gmvUsd',
                value: 50,
            },
            {
                dateTime: '2025-07-10',
                label: 'AiSalesAgentOrders.gmvUsd',
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
            useAverageOrderValue(
                '123',
                mockUserTimezone,
                mockFilters,
                ReportingGranularity.Week,
            ),
        )

        expect(result.current.value).toBe(0)
        expect(result.current.isLoading).toBe(true)
    })

    it('should return 0 when orders value is 0', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === AiSalesAgentOrdersMeasure.GmvUsd) {
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
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAverageOrderValue(
                '123',
                mockUserTimezone,
                mockFilters,
                ReportingGranularity.Week,
            ),
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
            useAverageOrderValue(
                '123',
                mockUserTimezone,
                mockFilters,
                ReportingGranularity.Week,
            ),
        )

        expect(result.current.value).toBe(0)
    })

    it('should handle edge case of previous value being 0', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === AiSalesAgentOrdersMeasure.GmvUsd) {
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
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAverageOrderValue(
                '123',
                mockUserTimezone,
                mockFilters,
                ReportingGranularity.Week,
            ),
        )

        expect(result.current.value).toBe(50)
        expect(result.current.prevValue).toBe(0)
    })
})
