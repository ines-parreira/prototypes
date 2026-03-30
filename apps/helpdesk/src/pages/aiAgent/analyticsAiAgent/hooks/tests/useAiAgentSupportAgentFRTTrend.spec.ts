import { assumeMock, renderHook } from '@repo/testing'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    fetchDecreaseInFirstResponseTimeTrend,
    useDecreaseInFirstResponseTimeTrend,
} from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { aiAgentSupportAgentDecreaseInFRTQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime'
import { APIOnlyFilterKey } from 'domains/reporting/models/stat/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import {
    fetchAiAgentSupportAgentFRTTrend,
    useAiAgentSupportAgentFRTTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentFRTTrend'

jest.mock(
    'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend',
)
jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock(
    'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime',
    () => ({
        aiAgentSupportAgentDecreaseInFRTQueryV2Factory: jest.fn(),
    }),
)
jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')

const useDecreaseInFirstResponseTimeTrendMock = assumeMock(
    useDecreaseInFirstResponseTimeTrend,
)
const fetchDecreaseInFirstResponseTimeTrendMock = assumeMock(
    fetchDecreaseInFirstResponseTimeTrend,
)
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)
const useStatsMetricTrendMock = assumeMock(useStatsMetricTrend)
const fetchStatsMetricTrendMock = assumeMock(fetchStatsMetricTrend)
const useGetNewStatsFeatureFlagMigrationMock = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)
const getNewStatsFeatureFlagMigrationMock = assumeMock(
    getNewStatsFeatureFlagMigration,
)
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

const buildExpectedV1Filters = (agentsFilter: number[]) => ({
    ...statsFilters,
    agents: withDefaultLogicalOperator(agentsFilter),
    [APIOnlyFilterKey.AiAgentRole]: withDefaultLogicalOperator([
        AIAgentSkills.AIAgentSupport,
    ]),
})

const buildExpectedV2Filters = (agentsFilter: number[]) => ({
    ...statsFilters,
    agents: withDefaultLogicalOperator(agentsFilter),
})

const mockV1TrendResult = {
    data: { value: 3600, prevValue: 4200 },
    isFetching: false,
    isError: false,
}

const mockV2TrendResult = {
    data: { value: 2800, prevValue: 3500 },
    isFetching: false,
    isError: false,
}

describe('useAiAgentSupportAgentFRTTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useGetNewStatsFeatureFlagMigrationMock.mockReturnValue('off')
        useDecreaseInFirstResponseTimeTrendMock.mockReturnValue(
            mockV1TrendResult,
        )
        useStatsMetricTrendMock.mockReturnValue(mockV2TrendResult)
    })

    describe('useAiAgentSupportAgentFRTTrend', () => {
        it('should call useDecreaseInFirstResponseTimeTrend with agent-filtered filters and support agent skill when aiAgentUserId is defined', () => {
            useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
            renderHook(() =>
                useAiAgentSupportAgentFRTTrend(statsFilters, timezone),
            )

            expect(
                useDecreaseInFirstResponseTimeTrendMock,
            ).toHaveBeenCalledWith(
                buildExpectedV1Filters([aiAgentUserId]),
                timezone,
                true,
            )
        })

        it('should call useDecreaseInFirstResponseTimeTrend with empty agents filter and support agent skill when aiAgentUserId is undefined', () => {
            useAIAgentUserIdMock.mockReturnValue(undefined)
            renderHook(() =>
                useAiAgentSupportAgentFRTTrend(statsFilters, timezone),
            )

            expect(
                useDecreaseInFirstResponseTimeTrendMock,
            ).toHaveBeenCalledWith(buildExpectedV1Filters([]), timezone, true)
        })

        it('should return the result from useDecreaseInFirstResponseTimeTrend when migration stage is off', () => {
            useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)

            const { result } = renderHook(() =>
                useAiAgentSupportAgentFRTTrend(statsFilters, timezone),
            )

            expect(result.current).toBe(mockV1TrendResult)
        })

        it('should return v2 trend when migration stage is live', () => {
            useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
            useGetNewStatsFeatureFlagMigrationMock.mockReturnValue('live')

            const { result } = renderHook(() =>
                useAiAgentSupportAgentFRTTrend(statsFilters, timezone),
            )

            expect(result.current).toBe(mockV2TrendResult)
        })

        it('should return v2 trend when migration stage is complete', () => {
            useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
            useGetNewStatsFeatureFlagMigrationMock.mockReturnValue('complete')

            const { result } = renderHook(() =>
                useAiAgentSupportAgentFRTTrend(statsFilters, timezone),
            )

            expect(result.current).toBe(mockV2TrendResult)
        })

        it('should call useDecreaseInFirstResponseTimeTrend with enabled=false when migration stage is live', () => {
            useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
            useGetNewStatsFeatureFlagMigrationMock.mockReturnValue('live')

            renderHook(() =>
                useAiAgentSupportAgentFRTTrend(statsFilters, timezone),
            )

            expect(
                useDecreaseInFirstResponseTimeTrendMock,
            ).toHaveBeenCalledWith(expect.any(Object), timezone, false)
        })

        it('should call v2 factory without aiAgentRole in filters to avoid duplicate filter', () => {
            useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
            useGetNewStatsFeatureFlagMigrationMock.mockReturnValue('live')

            renderHook(() =>
                useAiAgentSupportAgentFRTTrend(statsFilters, timezone),
            )

            expect(
                aiAgentSupportAgentDecreaseInFRTQueryV2FactoryMock,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    filters: buildExpectedV2Filters([aiAgentUserId]),
                }),
            )
        })
    })

    describe('fetchAiAgentSupportAgentFRTTrend', () => {
        beforeEach(() => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('off')
            fetchDecreaseInFirstResponseTimeTrendMock.mockResolvedValue(
                mockV1TrendResult,
            )
            fetchStatsMetricTrendMock.mockResolvedValue(mockV2TrendResult)
        })

        it('should call fetchDecreaseInFirstResponseTimeTrend with agent-filtered filters and support agent skill when aiAgentUserId is defined', async () => {
            await fetchAiAgentSupportAgentFRTTrend(
                statsFilters,
                timezone,
                aiAgentUserId,
            )

            expect(
                fetchDecreaseInFirstResponseTimeTrendMock,
            ).toHaveBeenCalledWith(
                buildExpectedV1Filters([aiAgentUserId]),
                timezone,
                aiAgentUserId,
            )
        })

        it('should call fetchDecreaseInFirstResponseTimeTrend with empty agents filter and support agent skill when aiAgentUserId is undefined', async () => {
            await fetchAiAgentSupportAgentFRTTrend(
                statsFilters,
                timezone,
                undefined,
            )

            expect(
                fetchDecreaseInFirstResponseTimeTrendMock,
            ).toHaveBeenCalledWith(
                buildExpectedV1Filters([]),
                timezone,
                undefined,
            )
        })

        it('should return the result from fetchDecreaseInFirstResponseTimeTrend when migration stage is off', async () => {
            const result = await fetchAiAgentSupportAgentFRTTrend(
                statsFilters,
                timezone,
                aiAgentUserId,
            )

            expect(result).toBe(mockV1TrendResult)
        })

        it('should call fetchStatsMetricTrend when migration stage is live', async () => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('live')

            const result = await fetchAiAgentSupportAgentFRTTrend(
                statsFilters,
                timezone,
                aiAgentUserId,
            )

            expect(fetchStatsMetricTrendMock).toHaveBeenCalled()
            expect(
                fetchDecreaseInFirstResponseTimeTrendMock,
            ).not.toHaveBeenCalled()
            expect(result).toBe(mockV2TrendResult)
        })

        it('should call fetchStatsMetricTrend when migration stage is complete', async () => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('complete')

            const result = await fetchAiAgentSupportAgentFRTTrend(
                statsFilters,
                timezone,
                aiAgentUserId,
            )

            expect(fetchStatsMetricTrendMock).toHaveBeenCalled()
            expect(
                fetchDecreaseInFirstResponseTimeTrendMock,
            ).not.toHaveBeenCalled()
            expect(result).toBe(mockV2TrendResult)
        })
    })
})
