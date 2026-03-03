import { assumeMock, renderHook } from '@repo/testing'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { averageScoreQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/averageScoreQueryFactory'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchAiAgentSupportAgentCsatTrend,
    useAiAgentSupportAgentCsatTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentCsatTrend'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')

const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000',
        end_datetime: '2024-01-31T23:59:59.999',
    },
}
const timezone = 'UTC'
const aiAgentUserId = 42

describe('useAiAgentSupportAgentCsatTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('useAiAgentSupportAgentCsatTrend', () => {
        it('should pass query factories with agent filter when aiAgentUserId is defined', () => {
            useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
            renderHook(() =>
                useAiAgentSupportAgentCsatTrend(statsFilters, timezone),
            )

            const filteredFilters = {
                ...statsFilters,
                [FilterKey.Agents]: withDefaultLogicalOperator([aiAgentUserId]),
            }

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                {
                    ...averageScoreQueryFactory(filteredFilters, timezone),
                    metricName: METRIC_NAMES.AI_AGENT_CSAT_AVERAGE_SCORE,
                },
                {
                    ...averageScoreQueryFactory(
                        {
                            ...filteredFilters,
                            period: getPreviousPeriod(filteredFilters.period),
                        },
                        timezone,
                    ),
                    metricName: METRIC_NAMES.AI_AGENT_CSAT_AVERAGE_SCORE,
                },
            )
        })

        it('should pass empty agents filter when aiAgentUserId is undefined', () => {
            useAIAgentUserIdMock.mockReturnValue(undefined)
            renderHook(() =>
                useAiAgentSupportAgentCsatTrend(statsFilters, timezone),
            )

            const filteredFilters = {
                ...statsFilters,
                [FilterKey.Agents]: withDefaultLogicalOperator([]),
            }

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                {
                    ...averageScoreQueryFactory(filteredFilters, timezone),
                    metricName: METRIC_NAMES.AI_AGENT_CSAT_AVERAGE_SCORE,
                },
                {
                    ...averageScoreQueryFactory(
                        {
                            ...filteredFilters,
                            period: getPreviousPeriod(filteredFilters.period),
                        },
                        timezone,
                    ),
                    metricName: METRIC_NAMES.AI_AGENT_CSAT_AVERAGE_SCORE,
                },
            )
        })

        it('should return the result from useMetricTrend', () => {
            useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
            const mockTrendResult = {
                data: { value: 4.5, prevValue: 4.0 },
                isFetching: false,
                isError: false,
            }
            useMetricTrendMock.mockReturnValue(mockTrendResult)

            const { result } = renderHook(() =>
                useAiAgentSupportAgentCsatTrend(statsFilters, timezone),
            )

            expect(result.current).toBe(mockTrendResult)
        })
    })

    describe('fetchAiAgentSupportAgentCsatTrend', () => {
        it('should pass query factories with agent filter when aiAgentUserId is defined', async () => {
            await fetchAiAgentSupportAgentCsatTrend(
                statsFilters,
                timezone,
                aiAgentUserId,
            )

            const filteredFilters = {
                ...statsFilters,
                [FilterKey.Agents]: withDefaultLogicalOperator([aiAgentUserId]),
            }

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                {
                    ...averageScoreQueryFactory(filteredFilters, timezone),
                    metricName: METRIC_NAMES.AI_AGENT_CSAT_AVERAGE_SCORE,
                },
                {
                    ...averageScoreQueryFactory(
                        {
                            ...filteredFilters,
                            period: getPreviousPeriod(filteredFilters.period),
                        },
                        timezone,
                    ),
                    metricName: METRIC_NAMES.AI_AGENT_CSAT_AVERAGE_SCORE,
                },
            )
        })

        it('should pass empty agents filter when aiAgentUserId is undefined', async () => {
            await fetchAiAgentSupportAgentCsatTrend(
                statsFilters,
                timezone,
                undefined,
            )

            const filteredFilters = {
                ...statsFilters,
                [FilterKey.Agents]: withDefaultLogicalOperator([]),
            }

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                {
                    ...averageScoreQueryFactory(filteredFilters, timezone),
                    metricName: METRIC_NAMES.AI_AGENT_CSAT_AVERAGE_SCORE,
                },
                {
                    ...averageScoreQueryFactory(
                        {
                            ...filteredFilters,
                            period: getPreviousPeriod(filteredFilters.period),
                        },
                        timezone,
                    ),
                    metricName: METRIC_NAMES.AI_AGENT_CSAT_AVERAGE_SCORE,
                },
            )
        })

        it('should return the result from fetchMetricTrend', async () => {
            const mockTrendResult = {
                data: { value: 4.5, prevValue: 4.0 },
                isFetching: false,
                isError: false,
            }
            fetchMetricTrendMock.mockResolvedValue(mockTrendResult)

            const result = await fetchAiAgentSupportAgentCsatTrend(
                statsFilters,
                timezone,
                aiAgentUserId,
            )

            expect(result).toBe(mockTrendResult)
        })
    })
})
