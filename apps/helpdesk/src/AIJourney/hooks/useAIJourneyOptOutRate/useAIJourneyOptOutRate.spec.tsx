import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'

import { useAIJourneyOptOutRate } from './useAIJourneyOptOutRate'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')

describe('useAIJourneyOptOutRate', () => {
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
                args.filters.find(
                    (f: any) =>
                        f.member ===
                        AiSalesAgentConversationsDimension.JourneyCompleteReason,
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

        const userTimezone = 'America/New_York'

        const { result } = renderHook(() =>
            useAIJourneyOptOutRate(
                '123',
                userTimezone,
                mockFilters,
                'shopName',
            ),
        )

        expect(result.current).toEqual({
            label: 'Opt Out Rate',
            value: 50,
            isLoading: false,
            interpretAs: 'less-is-better',
            metricFormat: 'percent-precision-1',
            prevValue: 40,
            drilldown: {
                integrationId: '123',
                journeyId: undefined,
                metricName: 'aiJourneyOptOutRate',
                shopName: 'shopName',
                title: 'Opt Out Rate',
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
            useAIJourneyOptOutRate('123', 'UTC', mockFilters, 'shopName'),
        )

        expect(result.current).toEqual({
            interpretAs: 'less-is-better',
            isLoading: true,
            label: 'Opt Out Rate',
            metricFormat: 'percent-precision-1',
            prevValue: 0,
            value: 0,
            drilldown: {
                integrationId: '123',
                journeyId: undefined,
                metricName: 'aiJourneyOptOutRate',
                shopName: 'shopName',
                title: 'Opt Out Rate',
            },
        })
    })
})
