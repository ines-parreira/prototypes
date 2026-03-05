import { assumeMock, renderHook } from '@repo/testing'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { closedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchAiAgentClosedTicketsTrend,
    useAiAgentClosedTicketsTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentClosedTicketsTrend'

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

describe('useAiAgentClosedTicketsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('useAiAgentClosedTicketsTrend', () => {
        it('should pass query factories with agent filter when aiAgentUserId is defined', () => {
            useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
            renderHook(() =>
                useAiAgentClosedTicketsTrend(statsFilters, timezone),
            )

            const filteredFilters = {
                ...statsFilters,
                [FilterKey.Agents]: withDefaultLogicalOperator([aiAgentUserId]),
            }

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                {
                    ...closedTicketsQueryFactory(filteredFilters, timezone),
                    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CLOSED_TICKETS,
                },
                {
                    ...closedTicketsQueryFactory(
                        {
                            ...filteredFilters,
                            period: getPreviousPeriod(filteredFilters.period),
                        },
                        timezone,
                    ),
                    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CLOSED_TICKETS,
                },
            )
        })

        it('should pass empty agents filter when aiAgentUserId is undefined', () => {
            useAIAgentUserIdMock.mockReturnValue(undefined)
            renderHook(() =>
                useAiAgentClosedTicketsTrend(statsFilters, timezone),
            )

            const filteredFilters = {
                ...statsFilters,
                [FilterKey.Agents]: withDefaultLogicalOperator([]),
            }

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                {
                    ...closedTicketsQueryFactory(filteredFilters, timezone),
                    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CLOSED_TICKETS,
                },
                {
                    ...closedTicketsQueryFactory(
                        {
                            ...filteredFilters,
                            period: getPreviousPeriod(filteredFilters.period),
                        },
                        timezone,
                    ),
                    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CLOSED_TICKETS,
                },
            )
        })

        it('should return the result from useMetricTrend', () => {
            useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
            const mockTrendResult = {
                data: { value: 150, prevValue: 120 },
                isFetching: false,
                isError: false,
            }
            useMetricTrendMock.mockReturnValue(mockTrendResult)

            const { result } = renderHook(() =>
                useAiAgentClosedTicketsTrend(statsFilters, timezone),
            )

            expect(result.current).toBe(mockTrendResult)
        })
    })

    describe('fetchAiAgentClosedTicketsTrend', () => {
        it('should pass query factories with agent filter when aiAgentUserId is defined', async () => {
            await fetchAiAgentClosedTicketsTrend(
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
                    ...closedTicketsQueryFactory(filteredFilters, timezone),
                    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CLOSED_TICKETS,
                },
                {
                    ...closedTicketsQueryFactory(
                        {
                            ...filteredFilters,
                            period: getPreviousPeriod(filteredFilters.period),
                        },
                        timezone,
                    ),
                    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CLOSED_TICKETS,
                },
            )
        })

        it('should pass empty agents filter when aiAgentUserId is undefined', async () => {
            await fetchAiAgentClosedTicketsTrend(
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
                    ...closedTicketsQueryFactory(filteredFilters, timezone),
                    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CLOSED_TICKETS,
                },
                {
                    ...closedTicketsQueryFactory(
                        {
                            ...filteredFilters,
                            period: getPreviousPeriod(filteredFilters.period),
                        },
                        timezone,
                    ),
                    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CLOSED_TICKETS,
                },
            )
        })

        it('should return the result from fetchMetricTrend', async () => {
            const mockTrendResult = {
                data: { value: 150, prevValue: 120 },
                isFetching: false,
                isError: false,
            }
            fetchMetricTrendMock.mockResolvedValue(mockTrendResult)

            const result = await fetchAiAgentClosedTicketsTrend(
                statsFilters,
                timezone,
                aiAgentUserId,
            )

            expect(result).toBe(mockTrendResult)
        })
    })
})
