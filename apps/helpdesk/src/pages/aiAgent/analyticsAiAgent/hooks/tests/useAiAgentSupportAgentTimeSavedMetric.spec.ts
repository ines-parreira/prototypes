import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicSupportAgentTimeSavedQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentTimeSaved'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchAiAgentSupportAgentTimeSavedTrend,
    useAiAgentSupportAgentTimeSavedMetric,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentTimeSavedMetric'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock('domains/reporting/hooks/useStatsMetricTrend')

const mockUseAiAgentStatsFilters = assumeMock(useAiAgentStatsFilters)
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000',
        end_datetime: '2024-01-31T23:59:59.999',
    },
}
const timezone = 'UTC'

const mockTrend = {
    isFetching: false,
    isError: false,
    data: { value: 14400, prevValue: 12600 },
}

describe('useAiAgentSupportAgentTimeSavedMetric', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters,
            userTimezone: timezone,
            granularity: ReportingGranularity.Day,
        })
        mockUseStatsMetricTrend.mockReturnValue(mockTrend)
    })

    it('should call useStatsMetricTrend with current and previous period V2 queries', () => {
        renderHook(() => useAiAgentSupportAgentTimeSavedMetric())

        expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
            dynamicSupportAgentTimeSavedQueryFactoryV2({
                filters: statsFilters,
                timezone,
            }),
            dynamicSupportAgentTimeSavedQueryFactoryV2({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            }),
        )
    })

    it('should return trend data with label', () => {
        const { result } = renderHook(() =>
            useAiAgentSupportAgentTimeSavedMetric(),
        )

        expect(result.current).toEqual({
            isFetching: false,
            isError: false,
            data: {
                label: 'Time saved by agents',
                value: 14400,
                prevValue: 12600,
            },
        })
    })

    it('should return null values when data is undefined', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        } as unknown as ReturnType<typeof useStatsMetricTrend>)

        const { result } = renderHook(() =>
            useAiAgentSupportAgentTimeSavedMetric(),
        )

        expect(result.current).toEqual({
            isFetching: false,
            isError: false,
            data: {
                label: 'Time saved by agents',
                value: null,
                prevValue: null,
            },
        })
    })

    it('should propagate isFetching=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAiAgentSupportAgentTimeSavedMetric(),
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should propagate isError=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
            isError: true,
        })

        const { result } = renderHook(() =>
            useAiAgentSupportAgentTimeSavedMetric(),
        )

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchAiAgentSupportAgentTimeSavedTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchStatsMetricTrend.mockResolvedValue(mockTrend)
    })

    it('should call fetchStatsMetricTrend with current and previous period V2 queries', async () => {
        await fetchAiAgentSupportAgentTimeSavedTrend(statsFilters, timezone)

        expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
            dynamicSupportAgentTimeSavedQueryFactoryV2({
                filters: statsFilters,
                timezone,
            }),
            dynamicSupportAgentTimeSavedQueryFactoryV2({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            }),
        )
    })

    it('should return the trend result', async () => {
        const result = await fetchAiAgentSupportAgentTimeSavedTrend(
            statsFilters,
            timezone,
        )

        expect(result).toEqual(mockTrend)
    })
})
