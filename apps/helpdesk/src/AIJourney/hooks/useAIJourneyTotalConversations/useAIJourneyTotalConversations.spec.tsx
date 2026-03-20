import { renderHook } from '@testing-library/react'

import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { aiJourneyTotalConversationsQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'

import { useAIJourneyTotalConversations } from './useAIJourneyTotalConversations'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('AIJourney/utils/analytics-factories/factories')

describe('useAIJourneyTotalConversations', () => {
    const mockUseMetricTrend = useMetricTrend as jest.Mock
    const integrationId = '123'
    const userTimezone = 'America/New_York'
    const filters = {
        period: {
            start_datetime: '2025-08-07T00:00:00.000Z',
            end_datetime: '2025-09-04T23:59:59.999Z',
        },
    }

    beforeEach(() => {
        mockUseMetricTrend.mockReturnValue({
            data: { value: 42, prevValue: 35 },
            isFetching: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return metric data with correct formatting', () => {
        const journeyId = 'test-journey-id'
        const { result } = renderHook(() =>
            useAIJourneyTotalConversations({
                integrationId,
                userTimezone,
                filters,
                journeyIds: [journeyId],
            }),
        )

        expect(result.current).toEqual({
            trend: {
                isFetching: false,
                isError: false,
                data: {
                    label: 'Recipients',
                    value: 42,
                    prevValue: 35,
                },
            },
            interpretAs: 'more-is-better',
            metricFormat: 'decimal',
            hint: {
                title: 'Unique customers who received at least 1 message during the selected date range.',
            },
            drilldownMetricName: AIJourneyMetric.TotalConversations,
        })

        expect(aiJourneyTotalConversationsQueryFactory).toHaveBeenCalledWith(
            integrationId,
            expect.objectContaining({
                period: expect.objectContaining({
                    start_datetime: expect.any(String),
                    end_datetime: expect.any(String),
                }),
            }),
            userTimezone,
            [journeyId],
        )
    })

    it('should return null values when loading', () => {
        mockUseMetricTrend.mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAIJourneyTotalConversations({
                integrationId,
                userTimezone,
                filters,
                journeyIds: ['test-journey-id'],
            }),
        )

        expect(result.current.trend.isFetching).toBe(true)
        expect(result.current.trend.data?.value).toBeNull()
    })

    it('should handle undefined journeyIds', () => {
        const { result } = renderHook(() =>
            useAIJourneyTotalConversations({
                integrationId,
                userTimezone,
                filters,
            }),
        )

        expect(aiJourneyTotalConversationsQueryFactory).toHaveBeenCalledWith(
            integrationId,
            expect.any(Object),
            userTimezone,
            undefined,
        )

        expect(result.current.trend.data?.label).toBe('Recipients')
        expect(result.current.trend.data?.value).toBe(42)
    })

    it('should include drilldownMetricName as TotalConversations', () => {
        const { result } = renderHook(() =>
            useAIJourneyTotalConversations({
                integrationId,
                userTimezone,
                filters,
                journeyIds: ['journey-1'],
            }),
        )

        expect(result.current.drilldownMetricName).toBe(
            AIJourneyMetric.TotalConversations,
        )
    })

    it('should disable queries and return zeroed values when no flows or campaigns are selected', () => {
        const { result } = renderHook(() =>
            useAIJourneyTotalConversations({
                integrationId,
                userTimezone,
                filters,
                journeyIds: ['journey-1'],
                forceEmpty: true,
            }),
        )

        const calls = (useMetricTrend as jest.Mock).mock.calls
        expect(calls[0][4]).toBe(false)

        expect(result.current.trend.isFetching).toBe(false)
        expect(result.current.trend.data?.value).toBe(0)
        expect(result.current.trend.data?.prevValue).toBe(0)
    })
})
