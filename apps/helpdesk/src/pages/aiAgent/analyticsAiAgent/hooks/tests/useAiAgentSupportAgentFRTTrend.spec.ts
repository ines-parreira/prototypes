import { assumeMock, renderHook } from '@repo/testing'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiAgentSupportAgentDecreaseInFRTQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchAiAgentSupportAgentFRTTrend,
    useAiAgentSupportAgentFRTTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentFRTTrend'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'

jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter')
jest.mock(
    'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime',
    () => ({
        aiAgentSupportAgentDecreaseInFRTQueryV2Factory: jest.fn(),
    }),
)

const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)
const useStatsMetricTrendMock = assumeMock(useStatsMetricTrend)
const fetchStatsMetricTrendMock = assumeMock(fetchStatsMetricTrend)
const applyAiAgentFilterMock = assumeMock(applyAiAgentFilter)
const aiAgentSupportAgentDecreaseInFRTQueryV2FactoryMock = assumeMock(
    aiAgentSupportAgentDecreaseInFRTQueryV2Factory,
)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000',
        end_datetime: '2024-01-31T23:59:59.999',
    },
}
const timezone = 'UTC'
const aiAgentUserId = 42

const mockFilteredFilters: StatsFilters = {
    ...statsFilters,
    agents: { values: [aiAgentUserId], operator: 'eq' },
} as unknown as StatsFilters

const mockTrendResult = {
    data: { value: 2800, prevValue: 3500 },
    isFetching: false,
    isError: false,
}

const mockBuiltQuery = {
    measures: ['medianDecreaseInFirstResponseTime'],
    filters: [],
    metricName: 'test-metric',
} as any

describe('useAiAgentSupportAgentFRTTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
        applyAiAgentFilterMock.mockReturnValue(mockFilteredFilters)
        useStatsMetricTrendMock.mockReturnValue(mockTrendResult)
        aiAgentSupportAgentDecreaseInFRTQueryV2FactoryMock.mockReturnValue(
            mockBuiltQuery,
        )
    })

    it('should apply AI agent filter with the correct userId', () => {
        renderHook(() => useAiAgentSupportAgentFRTTrend(statsFilters, timezone))

        expect(applyAiAgentFilterMock).toHaveBeenCalledWith(
            statsFilters,
            aiAgentUserId,
        )
    })

    it('should call useStatsMetricTrend with current and previous period V2 queries using filtered filters', () => {
        renderHook(() => useAiAgentSupportAgentFRTTrend(statsFilters, timezone))

        expect(
            aiAgentSupportAgentDecreaseInFRTQueryV2FactoryMock,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                filters: mockFilteredFilters,
            }),
        )
        expect(
            aiAgentSupportAgentDecreaseInFRTQueryV2FactoryMock,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                filters: {
                    ...mockFilteredFilters,
                    period: getPreviousPeriod(mockFilteredFilters.period),
                },
            }),
        )
    })

    it('should return the trend result', () => {
        const { result } = renderHook(() =>
            useAiAgentSupportAgentFRTTrend(statsFilters, timezone),
        )

        expect(result.current).toBe(mockTrendResult)
    })

    it('should handle undefined aiAgentUserId', () => {
        useAIAgentUserIdMock.mockReturnValue(undefined)

        renderHook(() => useAiAgentSupportAgentFRTTrend(statsFilters, timezone))

        expect(applyAiAgentFilterMock).toHaveBeenCalledWith(
            statsFilters,
            undefined,
        )
    })
})

describe('fetchAiAgentSupportAgentFRTTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        applyAiAgentFilterMock.mockReturnValue(mockFilteredFilters)
        fetchStatsMetricTrendMock.mockResolvedValue(mockTrendResult)
        aiAgentSupportAgentDecreaseInFRTQueryV2FactoryMock.mockReturnValue(
            mockBuiltQuery,
        )
    })

    it('should apply AI agent filter with the correct userId', async () => {
        await fetchAiAgentSupportAgentFRTTrend(
            statsFilters,
            timezone,
            aiAgentUserId,
        )

        expect(applyAiAgentFilterMock).toHaveBeenCalledWith(
            statsFilters,
            aiAgentUserId,
        )
    })

    it('should call fetchStatsMetricTrend with V2 factory queries', async () => {
        await fetchAiAgentSupportAgentFRTTrend(
            statsFilters,
            timezone,
            aiAgentUserId,
        )

        expect(fetchStatsMetricTrendMock).toHaveBeenCalled()
        expect(
            aiAgentSupportAgentDecreaseInFRTQueryV2FactoryMock,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                filters: mockFilteredFilters,
            }),
        )
        expect(
            aiAgentSupportAgentDecreaseInFRTQueryV2FactoryMock,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                filters: {
                    ...mockFilteredFilters,
                    period: getPreviousPeriod(mockFilteredFilters.period),
                },
            }),
        )
    })

    it('should return the trend result', async () => {
        const result = await fetchAiAgentSupportAgentFRTTrend(
            statsFilters,
            timezone,
            aiAgentUserId,
        )

        expect(result).toBe(mockTrendResult)
    })

    it('should handle undefined aiAgentUserId', async () => {
        await fetchAiAgentSupportAgentFRTTrend(
            statsFilters,
            timezone,
            undefined,
        )

        expect(applyAiAgentFilterMock).toHaveBeenCalledWith(
            statsFilters,
            undefined,
        )
    })
})
