import { renderHook } from '@testing-library/react'

import {
    aiJourneyTotalConversationsQueryFactory,
    aiJourneyTotalConversationsTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useAIJourneyTotalConversations } from './useAIJourneyTotalConversations'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')
jest.mock('AIJourney/utils/analytics-factories/factories')

describe('useAIJourneyTotalConversations', () => {
    const mockUseMetricTrend = useMetricTrend as jest.Mock
    const mockUseTimeSeries = useTimeSeries as jest.Mock
    const integrationId = '123'
    const userTimezone = 'America/New_York'
    const granularity = ReportingGranularity.Week
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

        mockUseTimeSeries.mockReturnValue({
            data: [[{ x: '2024-01-01', y: 10 }]],
            isFetching: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return metric data with correct formatting', () => {
        const journeyId = 'test-journey-id'
        const { result } = renderHook(() =>
            useAIJourneyTotalConversations(
                integrationId,
                userTimezone,
                filters,
                granularity,
                journeyId,
            ),
        )

        expect(result.current).toEqual({
            label: 'Total Conversations',
            value: 42,
            prevValue: 35,
            series: [{ x: '2024-01-01', y: 10 }],
            interpretAs: 'more-is-better',
            metricFormat: 'decimal-precision-1',
            isLoading: false,
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
            journeyId,
        )

        expect(aiJourneyTotalConversationsTimeSeriesQuery).toHaveBeenCalledWith(
            integrationId,
            filters,
            userTimezone,
            granularity,
            journeyId,
        )
    })

    it('should handle loading state', () => {
        mockUseMetricTrend.mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        mockUseTimeSeries.mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAIJourneyTotalConversations(
                integrationId,
                userTimezone,
                filters,
                granularity,
                'test-journey-id',
            ),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.value).toBe(0)
    })

    it('should handle undefined journeyId', () => {
        const { result } = renderHook(() =>
            useAIJourneyTotalConversations(
                integrationId,
                userTimezone,
                filters,
                granularity,
                undefined,
            ),
        )

        expect(aiJourneyTotalConversationsQueryFactory).toHaveBeenCalledWith(
            integrationId,
            expect.any(Object),
            userTimezone,
            undefined,
        )

        expect(result.current).toEqual({
            label: 'Total Conversations',
            value: 42,
            prevValue: 35,
            series: [{ x: '2024-01-01', y: 10 }],
            interpretAs: 'more-is-better',
            metricFormat: 'decimal-precision-1',
            isLoading: false,
        })
    })
})
