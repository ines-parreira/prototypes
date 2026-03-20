import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { AiSalesAgentConversationsDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'

import { useAIJourneyOptOutRate } from './useAIJourneyOptOutRate'

jest.mock('domains/reporting/hooks/useMetricTrend')

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

    it('should return correct trend data when values are available', () => {
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

        const { result } = renderHook(() =>
            useAIJourneyOptOutRate({
                integrationId: '123',
                userTimezone: 'America/New_York',
                filters: mockFilters,
                shopName: 'shopName',
            }),
        )

        expect(result.current).toEqual({
            trend: {
                isFetching: false,
                isError: false,
                data: {
                    label: 'Opt-out rate',
                    value: 50,
                    prevValue: 40,
                },
            },
            interpretAs: 'less-is-better',
            metricFormat: 'percent',
            hint: {
                title: 'Percentage of recipients who unsubscribed after receiving a message.',
            },
        })
    })

    it('should return null values when loading', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAIJourneyOptOutRate({
                integrationId: '123',
                userTimezone: 'UTC',
                filters: mockFilters,
                shopName: 'shopName',
            }),
        )

        expect(result.current.trend.isFetching).toBe(true)
        expect(result.current.trend.data?.value).toBeNull()
    })

    it('should disable queries when no flows or campaigns are selected', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 50, prevValue: 20 },
            isFetching: false,
        })

        renderHook(() =>
            useAIJourneyOptOutRate({
                integrationId: '123',
                userTimezone: 'UTC',
                filters: mockFilters,
                shopName: 'shopName',
                forceEmpty: true,
            }),
        )

        const metricTrendCalls = (useMetricTrend as jest.Mock).mock.calls
        metricTrendCalls.forEach((call) => {
            expect(call[4]).toBe(false)
        })
    })
})
