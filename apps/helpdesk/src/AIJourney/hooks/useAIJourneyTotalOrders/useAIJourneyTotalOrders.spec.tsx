import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { totalNumberOfOrderQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useAIJourneyTotalOrders } from './useAIJourneyTotalOrders'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')
jest.mock('domains/reporting/models/queryFactories/ai-sales-agent/metrics')

describe('useAIJourneyTotalOrders', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(totalNumberOfOrderQueryFactory as jest.Mock).mockReturnValue(
            'mocked-query',
        )
    })

    const mockFilters = {
        period: {
            start_datetime: '2025-07-03T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    }

    it('should return correct data when values are available', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation(() => ({
            data: { value: 100, prevValue: 50 },
            isFetching: false,
        }))
        ;(useTimeSeries as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === AiSalesAgentOrdersMeasure.Count) {
                return {
                    data: [
                        [
                            {
                                dateTime: '2025-07-03',
                                value: 1,
                                label: AiSalesAgentOrdersMeasure.Count,
                            },
                            {
                                dateTime: '2025-07-10',
                                value: 0,
                                label: AiSalesAgentOrdersMeasure.Count,
                            },
                        ],
                    ] satisfies TimeSeriesDataItem[][],
                    isFetching: false,
                }
            }
        })

        const userTimezone = 'America/New_York'

        const { result } = renderHook(() =>
            useAIJourneyTotalOrders({
                integrationId: '123',
                userTimezone,
                filters: mockFilters,
                granularity: ReportingGranularity.Week,
                shopName: 'shopName',
            }),
        )

        expect(result.current).toEqual({
            interpretAs: 'more-is-better',
            isLoading: false,
            label: 'Total Orders',
            metricFormat: 'decimal-precision-1',
            prevValue: 50,
            value: 100,
            series: [
                {
                    dateTime: '2025-07-03',
                    label: 'AiSalesAgentOrders.count',
                    value: 1,
                },
                {
                    dateTime: '2025-07-10',
                    label: 'AiSalesAgentOrders.count',
                    value: 0,
                },
            ],
            drilldown: {
                integrationId: '123',
                metricName: 'aiJourneyTotalOrders',
                shopName: 'shopName',
                title: 'Total Orders',
            },
        })
    })

    it('should handle loading state correctly', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation(() => ({
            data: undefined,
            isFetching: true,
        }))
        ;(useTimeSeries as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === AiSalesAgentOrdersMeasure.Count) {
                return {
                    data: undefined,
                    isFetching: true,
                }
            }
        })

        const { result } = renderHook(() =>
            useAIJourneyTotalOrders({
                integrationId: '123',
                userTimezone: 'UTC',
                filters: mockFilters,
                granularity: ReportingGranularity.Week,
                shopName: 'shopName',
            }),
        )

        expect(result.current).toEqual({
            interpretAs: 'more-is-better',
            isLoading: true,
            label: 'Total Orders',
            metricFormat: 'decimal-precision-1',
            prevValue: 0,
            value: 0,
            series: [],
            drilldown: {
                integrationId: '123',
                metricName: 'aiJourneyTotalOrders',
                shopName: 'shopName',
                title: 'Total Orders',
            },
        })
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
            useAIJourneyTotalOrders({
                integrationId: '123',
                userTimezone: 'UTC',
                filters: mockFilters,
                granularity: ReportingGranularity.Week,
                shopName: 'shopName',
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
