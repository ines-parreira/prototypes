import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import {
    TimeSeriesDataItem,
    useTimeSeries,
} from 'domains/reporting/hooks/useTimeSeries'
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
            ),
        )

        expect(result.current.currency).toBe('EUR')
    })
})
