import { renderHook } from '@testing-library/react'

import {
    aiJourneyTotalMessagesQueryFactory,
    aiJourneyTotalMessagesTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useAIJourneyMessagesSent } from '../useAIJourneyMessagesSent/useAIJourneyMessagesSent'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')
jest.mock('AIJourney/utils/analytics-factories/factories')

describe('useAIJourneyMessagesSent', () => {
    const integrationId = '123'
    const userTimezone = 'America/New_York'
    const filters = {
        period: {
            start_datetime: '2025-08-07T00:00:00.000Z',
            end_datetime: '2025-09-04T23:59:59.999Z',
        },
    }
    const granularity = ReportingGranularity.Week
    const journeyIds = ['journey-1', 'journey-2']

    beforeEach(() => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 500, prevValue: 400 },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: [[{ dateTime: '2025-08-07', value: 100, label: 'messages' }]],
            isFetching: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return correct data when values are available', () => {
        const { result } = renderHook(() =>
            useAIJourneyMessagesSent({
                integrationId,
                userTimezone,
                filters,
                granularity,
                journeyIds,
            }),
        )

        expect(result.current).toEqual({
            label: 'Messages sent',
            value: 500,
            prevValue: 400,
            series: [{ dateTime: '2025-08-07', value: 100, label: 'messages' }],
            interpretAs: 'more-is-better',
            metricFormat: 'decimal-precision-1',
            isLoading: false,
        })
    })

    it('should return fallback values when data is undefined', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyMessagesSent({
                integrationId,
                userTimezone,
                filters,
                granularity,
                journeyIds,
            }),
        )

        expect(result.current.value).toBe(0)
        expect(result.current.prevValue).toBeUndefined()
        expect(result.current.series).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading true when trend is fetching', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAIJourneyMessagesSent({
                integrationId,
                userTimezone,
                filters,
                granularity,
                journeyIds,
            }),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading true when time series is fetching', () => {
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAIJourneyMessagesSent({
                integrationId,
                userTimezone,
                filters,
                granularity,
                journeyIds,
            }),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should call aiJourneyTotalMessagesQueryFactory with current and previous period', () => {
        renderHook(() =>
            useAIJourneyMessagesSent({
                integrationId,
                userTimezone,
                filters,
                granularity,
                journeyIds,
            }),
        )

        expect(aiJourneyTotalMessagesQueryFactory).toHaveBeenCalledWith(
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
        expect(aiJourneyTotalMessagesQueryFactory).toHaveBeenCalledTimes(2)
    })

    it('should call aiJourneyTotalMessagesTimeSeriesQuery with correct args', () => {
        renderHook(() =>
            useAIJourneyMessagesSent({
                integrationId,
                userTimezone,
                filters,
                granularity,
                journeyIds,
            }),
        )

        expect(aiJourneyTotalMessagesTimeSeriesQuery).toHaveBeenCalledWith(
            integrationId,
            filters,
            userTimezone,
            granularity,
            journeyIds,
        )
    })

    it('should handle undefined journeyIds', () => {
        const { result } = renderHook(() =>
            useAIJourneyMessagesSent({
                integrationId,
                userTimezone,
                filters,
                granularity,
                journeyIds: undefined,
            }),
        )

        expect(aiJourneyTotalMessagesQueryFactory).toHaveBeenCalledWith(
            integrationId,
            expect.any(Object),
            userTimezone,
            undefined,
        )
        expect(result.current.value).toBe(500)
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
            useAIJourneyMessagesSent({
                integrationId,
                userTimezone,
                filters,
                granularity,
                journeyIds,
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
