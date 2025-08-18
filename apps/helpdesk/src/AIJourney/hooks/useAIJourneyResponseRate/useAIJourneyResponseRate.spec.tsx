import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import {
    TimeSeriesDataItem,
    useTimeSeries,
} from 'domains/reporting/hooks/useTimeSeries'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { useAIJourneyResponseRate } from './useAIJourneyResponseRate'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')
jest.mock('pages/aiAgent/Overview/hooks/useCurrency')

describe('useAIJourneyResponseRate', () => {
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
        ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
            if (
                args.filters.find(
                    (f: any) =>
                        f.member === AiSalesAgentConversationsDimension.Replied,
                )
            ) {
                return {
                    data: { value: 50, prevValue: 20 },
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
                args.filters.find(
                    (f: any) =>
                        f.member === AiSalesAgentConversationsDimension.Replied,
                )
            ) {
                return {
                    data: [
                        [
                            {
                                dateTime: '2025-07-03',
                                value: 50,
                                label: AiSalesAgentConversationsMeasure.Count,
                            },
                            {
                                dateTime: '2025-07-10',
                                value: 60,
                                label: AiSalesAgentConversationsMeasure.Count,
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
                            value: 120,
                            label: AiSalesAgentConversationsMeasure.Count,
                        },
                    ],
                ] satisfies TimeSeriesDataItem[][],
                isFetching: false,
            }
        })

        const userTimezone = 'America/New_York'

        const { result } = renderHook(() =>
            useAIJourneyResponseRate(
                '123',
                userTimezone,
                mockFilters,
                ReportingGranularity.Week,
            ),
        )

        expect(result.current).toEqual({
            label: 'Response Rate',
            value: 50,
            currency: 'USD',
            isLoading: false,
            interpretAs: 'more-is-better',
            metricFormat: 'percent',
            prevValue: 40,
            series: [
                {
                    dateTime: '2025-07-03',
                    label: 'AiSalesAgentConversations.count',
                    value: 50,
                },
                {
                    dateTime: '2025-07-10',
                    label: 'AiSalesAgentConversations.count',
                    value: 50,
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
            useAIJourneyResponseRate(
                '123',
                'UTC',
                mockFilters,
                ReportingGranularity.Week,
            ),
        )

        expect(result.current).toEqual({
            currency: 'USD',
            interpretAs: 'more-is-better',
            isLoading: true,
            label: 'Response Rate',
            metricFormat: 'percent',
            prevValue: 0,
            value: 0,
            series: [],
        })
    })

    it('should correctly use the currency from useCurrency hook', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 50, prevValue: 25 },
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
            useAIJourneyResponseRate(
                '123',
                'UTC',
                mockFilters,
                ReportingGranularity.Week,
            ),
        )

        expect(result.current.currency).toBe('EUR')
    })
})
