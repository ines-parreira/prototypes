import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useAIJourneyResponseRate } from './useAIJourneyResponseRate'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')

describe('useAIJourneyResponseRate', () => {
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
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 50, prevValue: 40 },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: [
                [
                    {
                        dateTime: '2025-07-03',
                        value: 48,
                        label: AiSalesAgentConversationsMeasure.ReplyRate,
                    },
                    {
                        dateTime: '2025-07-10',
                        value: 52,
                        label: AiSalesAgentConversationsMeasure.ReplyRate,
                    },
                ],
            ] satisfies TimeSeriesDataItem[][],
            isFetching: false,
        })

        const userTimezone = 'America/New_York'

        const { result } = renderHook(() =>
            useAIJourneyResponseRate({
                integrationId: '123',
                userTimezone,
                filters: mockFilters,
                granularity: ReportingGranularity.Week,
            }),
        )

        expect(result.current).toEqual({
            label: 'Response Rate',
            value: 50,
            isLoading: false,
            interpretAs: 'more-is-better',
            metricFormat: 'percent-precision-1',
            prevValue: 40,
            series: [
                {
                    dateTime: '2025-07-03',
                    label: AiSalesAgentConversationsMeasure.ReplyRate,
                    value: 48,
                },
                {
                    dateTime: '2025-07-10',
                    label: AiSalesAgentConversationsMeasure.ReplyRate,
                    value: 52,
                },
            ],
            drilldown: {
                integrationId: '123',
                metricName: 'aiJourneyResponseRate',
                journeyIds: undefined,
                title: 'Response Rate',
            },
        })
    })

    it('should use the backend ReplyRate measure', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 12, prevValue: 10 },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: [[]],
            isFetching: false,
        })

        renderHook(() =>
            useAIJourneyResponseRate({
                integrationId: '123',
                userTimezone: 'UTC',
                filters: mockFilters,
                granularity: ReportingGranularity.Week,
            }),
        )

        const metricTrendCall = (useMetricTrend as jest.Mock).mock.calls[0]
        const query = metricTrendCall[0]
        expect(query.measures).toEqual([
            AiSalesAgentConversationsMeasure.ReplyRate,
        ])
        expect(query.dimensions).toEqual([])
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
            useAIJourneyResponseRate({
                integrationId: '123',
                userTimezone: 'UTC',
                filters: mockFilters,
                granularity: ReportingGranularity.Week,
            }),
        )

        expect(result.current).toEqual({
            interpretAs: 'more-is-better',
            isLoading: true,
            label: 'Response Rate',
            metricFormat: 'percent-precision-1',
            prevValue: 0,
            value: 0,
            series: [],
            drilldown: {
                integrationId: '123',
                metricName: 'aiJourneyResponseRate',
                journeyIds: undefined,
                title: 'Response Rate',
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
            useAIJourneyResponseRate({
                integrationId: '123',
                userTimezone: 'UTC',
                filters: mockFilters,
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
