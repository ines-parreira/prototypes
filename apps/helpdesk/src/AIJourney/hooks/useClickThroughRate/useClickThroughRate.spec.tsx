import { renderHook } from '@testing-library/react'

import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useClickThroughRate } from './useClickThroughRate'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')

describe('useClickThroughRate', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    const mockFilters = {
        period: {
            start_datetime: '2025-07-03T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    }

    it('should return correct data when values are available', () => {
        // Mock useMetricTrend - returns the same data for both queries
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 100, prevValue: 100 },
            isFetching: false,
        })

        let timeSeriesCallCount = 0
        ;(useTimeSeries as jest.Mock).mockImplementation(() => {
            timeSeriesCallCount++
            // First call is for clicks, second is for conversations
            return {
                data: [
                    [
                        {
                            dateTime: '2025-07-03',
                            value: timeSeriesCallCount,
                            label: AiSalesAgentConversationsMeasure.Count,
                        },
                        {
                            dateTime: '2025-07-10',
                            value: timeSeriesCallCount * 2,
                            label: AiSalesAgentConversationsMeasure.Count,
                        },
                    ],
                ] satisfies TimeSeriesDataItem[][],
                isFetching: false,
            }
        })

        const userTimezone = 'America/New_York'

        const { result } = renderHook(() =>
            useClickThroughRate({
                integrationId: '123',
                userTimezone,
                filters: mockFilters,
                granularity: ReportingGranularity.Week,
                shopName: 'shopName',
            }),
        )

        expect(result.current).toEqual({
            label: 'Click Through Rate',
            value: 100,
            isLoading: false,
            interpretAs: 'more-is-better',
            metricFormat: 'percent-precision-1',
            prevValue: 100,
            series: [
                {
                    dateTime: '2025-07-03',
                    value: 50,
                },
                {
                    dateTime: '2025-07-10',
                    value: 50,
                },
            ],
            drilldown: {
                title: 'Click Through Rate',
                metricName: AIJourneyMetric.ClickThroughRate,
                integrationId: '123',
                journeyIds: undefined,
                shopName: 'shopName',
            },
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
            useClickThroughRate({
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
            label: 'Click Through Rate',
            metricFormat: 'percent-precision-1',
            prevValue: 0,
            value: 0,
            series: [],
            drilldown: {
                title: 'Click Through Rate',
                metricName: AIJourneyMetric.ClickThroughRate,
                integrationId: '123',
                journeyIds: undefined,
                shopName: 'shopName',
            },
        })
    })

    it('should include drilldown with journeyId when provided', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 75, prevValue: 25 },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: [],
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useClickThroughRate({
                integrationId: 'integration123',
                userTimezone: 'America/Los_Angeles',
                filters: mockFilters,
                granularity: ReportingGranularity.Day,
                shopName: 'testShopName',
                journeyIds: ['journey456'],
            }),
        )

        expect(result.current.drilldown).toEqual({
            title: 'Click Through Rate',
            metricName: AIJourneyMetric.ClickThroughRate,
            integrationId: 'integration123',
            journeyIds: ['journey456'],
            shopName: 'testShopName',
        })
    })

    it('should include drilldown with undefined journeyId when not provided', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 30, prevValue: 60 },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: [],
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useClickThroughRate({
                integrationId: 'integration789',
                userTimezone: 'Europe/Paris',
                filters: mockFilters,
                granularity: ReportingGranularity.Month,
                shopName: 'anotherShopName',
            }),
        )

        expect(result.current.drilldown).toEqual({
            title: 'Click Through Rate',
            metricName: AIJourneyMetric.ClickThroughRate,
            integrationId: 'integration789',
            journeyIds: undefined,
            shopName: 'anotherShopName',
        })
    })

    it('should use correct title from AIJourneyMetricsConfig', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 0, prevValue: 0 },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: [],
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useClickThroughRate({
                integrationId: '123',
                userTimezone: 'UTC',
                filters: mockFilters,
                granularity: ReportingGranularity.Week,
                shopName: 'shopName',
            }),
        )

        expect(result.current.label).toBe('Click Through Rate')
        expect(result.current.drilldown?.title).toBe('Click Through Rate')
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
            useClickThroughRate({
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
