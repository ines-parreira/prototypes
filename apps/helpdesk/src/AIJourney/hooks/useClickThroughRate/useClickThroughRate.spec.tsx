import { renderHook } from '@testing-library/react'

import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { useClickThroughRate } from './useClickThroughRate'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')
jest.mock('pages/aiAgent/Overview/hooks/useCurrency')

describe('useClickThroughRate', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useCurrency as jest.Mock).mockReturnValue({
            currency: 'USD',
        })
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
            useClickThroughRate(
                '123',
                userTimezone,
                mockFilters,
                ReportingGranularity.Week,
                'shopName',
            ),
        )

        expect(result.current).toEqual({
            label: 'Click Through Rate',
            value: 100,
            currency: 'USD',
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
                journeyId: undefined,
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
            useClickThroughRate(
                '123',
                'UTC',
                mockFilters,
                ReportingGranularity.Week,
                'shopName',
            ),
        )

        expect(result.current).toEqual({
            currency: 'USD',
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
                journeyId: undefined,
                shopName: 'shopName',
            },
        })
    })

    it('should correctly use the currency from useCurrency hook', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 100, prevValue: 50 },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: [],
            isFetching: false,
        })
        ;(useCurrency as jest.Mock).mockReturnValue({
            currency: 'EUR',
        })

        const { result } = renderHook(() =>
            useClickThroughRate(
                '123',
                'UTC',
                mockFilters,
                ReportingGranularity.Week,
                'shopName',
            ),
        )

        expect(result.current.currency).toBe('EUR')
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
            useClickThroughRate(
                'integration123',
                'America/Los_Angeles',
                mockFilters,
                ReportingGranularity.Day,
                'testShopName',
                'journey456',
            ),
        )

        expect(result.current.drilldown).toEqual({
            title: 'Click Through Rate',
            metricName: AIJourneyMetric.ClickThroughRate,
            integrationId: 'integration123',
            journeyId: 'journey456',
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
            useClickThroughRate(
                'integration789',
                'Europe/Paris',
                mockFilters,
                ReportingGranularity.Month,
                'anotherShopName',
            ),
        )

        expect(result.current.drilldown).toEqual({
            title: 'Click Through Rate',
            metricName: AIJourneyMetric.ClickThroughRate,
            integrationId: 'integration789',
            journeyId: undefined,
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
            useClickThroughRate(
                '123',
                'UTC',
                mockFilters,
                ReportingGranularity.Week,
                'shopName',
            ),
        )

        expect(result.current.label).toBe('Click Through Rate')
        expect(result.current.drilldown?.title).toBe('Click Through Rate')
    })
})
