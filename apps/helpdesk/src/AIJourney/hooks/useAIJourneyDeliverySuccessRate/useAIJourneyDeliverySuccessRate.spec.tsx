import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import {
    TimeSeriesDataItem,
    useTimeSeries,
} from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useAIJourneyDeliverySuccessRate } from './useAIJourneyDeliverySuccessRate'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')

describe('useAIJourneyDeliverySuccessRate', () => {
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
        ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
            if (
                args.measures.includes(
                    AiSalesAgentConversationsMeasure.AiJourneyTotalFailedMessages,
                )
            ) {
                return {
                    data: { value: 10, prevValue: 5 },
                    isFetching: false,
                }
            }

            return {
                data: { value: 100, prevValue: 50 },
                isFetching: false,
            }
        })
        ;(useTimeSeries as jest.Mock).mockImplementation((args) => {
            if (
                args.measures.includes(
                    AiSalesAgentConversationsMeasure.AiJourneyTotalFailedMessages,
                )
            ) {
                return {
                    data: [
                        [
                            {
                                dateTime: '2025-07-03',
                                value: 10,
                                label: AiSalesAgentConversationsMeasure.AiJourneyTotalFailedMessages,
                            },
                            {
                                dateTime: '2025-07-10',
                                value: 15,
                                label: AiSalesAgentConversationsMeasure.AiJourneyTotalFailedMessages,
                            },
                        ],
                    ] satisfies TimeSeriesDataItem[][],
                    isFetching: false,
                }
            }

            return {
                data: [
                    [
                        {
                            dateTime: '2025-07-03',
                            value: 100,
                            label: AiSalesAgentConversationsMeasure.Count,
                        },
                        {
                            dateTime: '2025-07-10',
                            value: 150,
                            label: AiSalesAgentConversationsMeasure.Count,
                        },
                    ],
                ] satisfies TimeSeriesDataItem[][],
                isFetching: false,
            }
        })

        const userTimezone = 'America/New_York'

        const { result } = renderHook(() =>
            useAIJourneyDeliverySuccessRate(
                '123',
                userTimezone,
                mockFilters,
                ReportingGranularity.Week,
                'shopName',
            ),
        )

        expect(result.current).toEqual({
            label: 'Delivery Success Rate',
            value: 90,
            isLoading: false,
            interpretAs: 'more-is-better',
            metricFormat: 'percent-precision-1',
            prevValue: 90,
            series: [
                {
                    dateTime: '2025-07-03',
                    label: 'AiSalesAgentConversations.totalFailedMessages',
                    value: 90,
                },
                {
                    dateTime: '2025-07-10',
                    label: 'AiSalesAgentConversations.totalFailedMessages',
                    value: 90,
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
            useAIJourneyDeliverySuccessRate(
                '123',
                'UTC',
                mockFilters,
                ReportingGranularity.Week,
                'shopName',
            ),
        )

        expect(result.current).toEqual({
            interpretAs: 'more-is-better',
            isLoading: true,
            label: 'Delivery Success Rate',
            metricFormat: 'percent-precision-1',
            prevValue: 0,
            value: 0,
            series: [],
        })
    })
})
