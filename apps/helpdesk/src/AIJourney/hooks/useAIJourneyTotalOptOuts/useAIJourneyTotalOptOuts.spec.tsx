import { renderHook } from '@testing-library/react'

import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { aiJourneyOptedOutQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'

import { useAIJourneyTotalOptOuts } from './useAIJourneyTotalOptOuts'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('AIJourney/utils/analytics-factories/factories')

describe('useAIJourneyTotalOptOuts', () => {
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
            data: { value: 60, prevValue: 40 },
            isFetching: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return metric data with correct shape when loaded', () => {
        const { result } = renderHook(() =>
            useAIJourneyTotalOptOuts({
                integrationId,
                userTimezone,
                filters,
                journeyIds: ['journey-1'],
            }),
        )

        expect(result.current).toEqual({
            trend: {
                isFetching: false,
                isError: false,
                data: {
                    label: 'Total opted-out',
                    value: 60,
                    prevValue: 40,
                },
            },
            interpretAs: 'less-is-better',
            metricFormat: 'decimal',
            hint: {
                title: 'Total number of recipients who unsubscribed after receiving a message.',
            },
            drilldownMetricName: AIJourneyMetric.TotalOptOuts,
        })
    })

    it('should call the factory with current and previous period', () => {
        const journeyIds = ['journey-1']

        renderHook(() =>
            useAIJourneyTotalOptOuts({
                integrationId,
                userTimezone,
                filters,
                journeyIds,
            }),
        )

        expect(aiJourneyOptedOutQueryFactory).toHaveBeenCalledWith(
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

        expect(aiJourneyOptedOutQueryFactory).toHaveBeenCalledTimes(2)
    })

    it('should return null value when loading', () => {
        mockUseMetricTrend.mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAIJourneyTotalOptOuts({
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
            useAIJourneyTotalOptOuts({
                integrationId,
                userTimezone,
                filters,
            }),
        )

        expect(aiJourneyOptedOutQueryFactory).toHaveBeenCalledWith(
            integrationId,
            expect.any(Object),
            userTimezone,
            undefined,
        )

        expect(result.current.trend.data?.value).toBe(60)
        expect(result.current.trend.data?.prevValue).toBe(40)
    })

    it('should return null prevValue when trendData has no prevValue', () => {
        mockUseMetricTrend.mockReturnValue({
            data: { value: 25, prevValue: undefined },
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyTotalOptOuts({
                integrationId,
                userTimezone,
                filters,
                journeyIds: ['journey-1'],
            }),
        )

        expect(result.current.trend.data?.prevValue).toBeNull()
    })

    it('should include drilldownMetricName as TotalOptOuts', () => {
        const { result } = renderHook(() =>
            useAIJourneyTotalOptOuts({
                integrationId,
                userTimezone,
                filters,
                journeyIds: ['journey-1'],
            }),
        )

        expect(result.current.drilldownMetricName).toBe(
            AIJourneyMetric.TotalOptOuts,
        )
    })

    it('should disable queries and return zeroed values when no flows or campaigns are selected', () => {
        const { result } = renderHook(() =>
            useAIJourneyTotalOptOuts({
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
