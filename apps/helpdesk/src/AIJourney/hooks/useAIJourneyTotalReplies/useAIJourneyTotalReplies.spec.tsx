import { renderHook } from '@testing-library/react'

import { aiJourneyRepliedMessagesQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'

import { useAIJourneyTotalReplies } from './useAIJourneyTotalReplies'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('AIJourney/utils/analytics-factories/factories')

describe('useAIJourneyTotalReplies', () => {
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
            data: { value: 300, prevValue: 250 },
            isFetching: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return metric data with correct shape when loaded', () => {
        const { result } = renderHook(() =>
            useAIJourneyTotalReplies({
                integrationId,
                userTimezone,
                filters,
                journeyIds: ['journey-1'],
            }),
        )

        expect(result.current).toEqual({
            drilldownMetricName: 'aiJourneyTotalReplies',
            trend: {
                isFetching: false,
                isError: false,
                data: {
                    label: 'Recipients who replied',
                    value: 300,
                    prevValue: 250,
                },
            },
            interpretAs: 'more-is-better',
            metricFormat: 'decimal',
            hint: {
                title: 'The number of recipients who sent a reply to the received message.',
            },
        })
    })

    it('should call the factory with current and previous period', () => {
        const journeyIds = ['journey-1']

        renderHook(() =>
            useAIJourneyTotalReplies({
                integrationId,
                userTimezone,
                filters,
                journeyIds,
            }),
        )

        expect(aiJourneyRepliedMessagesQueryFactory).toHaveBeenCalledWith(
            integrationId,
            expect.objectContaining({
                period: expect.objectContaining({
                    start_datetime: expect.any(String),
                    end_datetime: expect.any(String),
                }),
            }),
            userTimezone,
            journeyIds,
        )

        expect(aiJourneyRepliedMessagesQueryFactory).toHaveBeenCalledTimes(2)
    })

    it('should return null value when loading', () => {
        mockUseMetricTrend.mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAIJourneyTotalReplies({
                integrationId,
                userTimezone,
                filters,
                journeyIds: ['journey-1'],
            }),
        )

        expect(result.current.trend.isFetching).toBe(true)
        expect(result.current.trend.data?.value).toBeNull()
        expect(result.current.trend.data?.prevValue).toBeNull()
    })

    it('should handle undefined journeyIds', () => {
        const { result } = renderHook(() =>
            useAIJourneyTotalReplies({
                integrationId,
                userTimezone,
                filters,
            }),
        )

        expect(aiJourneyRepliedMessagesQueryFactory).toHaveBeenCalledWith(
            integrationId,
            expect.any(Object),
            userTimezone,
            undefined,
        )

        expect(result.current.trend.data?.value).toBe(300)
        expect(result.current.trend.data?.prevValue).toBe(250)
    })

    it('should return null prevValue when trendData has no prevValue', () => {
        mockUseMetricTrend.mockReturnValue({
            data: { value: 150, prevValue: undefined },
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyTotalReplies({
                integrationId,
                userTimezone,
                filters,
                journeyIds: ['journey-1'],
            }),
        )

        expect(result.current.trend.data?.prevValue).toBeNull()
    })

    it('should disable queries and return zeroed values when no flows or campaigns are selected', () => {
        const { result } = renderHook(() =>
            useAIJourneyTotalReplies({
                integrationId,
                userTimezone,
                filters,
                journeyIds: ['journey-1'],
                forceEmpty: true,
            }),
        )

        const metricTrendCalls = (useMetricTrend as jest.Mock).mock.calls
        metricTrendCalls.forEach((call) => {
            expect(call[4]).toBe(false)
        })

        expect(result.current.trend.isFetching).toBe(false)
        expect(result.current.trend.data?.value).toBe(0)
        expect(result.current.trend.data?.prevValue).toBe(0)
    })
})
