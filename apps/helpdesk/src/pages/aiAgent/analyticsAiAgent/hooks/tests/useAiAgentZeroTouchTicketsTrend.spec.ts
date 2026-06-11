import { assumeMock, renderHook } from '@repo/testing'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiAgentAllAgentsZeroTouchTicketsQueryV2Factory } from 'domains/reporting/models/scopes/zeroTouchTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchAiAgentZeroTouchTicketsTrend,
    useAiAgentZeroTouchTicketsTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentZeroTouchTicketsTrend'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'

jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
jest.mock('pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter')

const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)
const mockUseAIAgentUserId = assumeMock(useAIAgentUserId)
const mockApplyAiAgentFilter = assumeMock(applyAiAgentFilter)

const AI_AGENT_USER_ID = 42

const timezone = 'UTC'

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000',
        end_datetime: '2024-01-31T23:59:59.999',
    },
}

const agentFilters: StatsFilters = {
    ...statsFilters,
    agents: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [AI_AGENT_USER_ID],
    },
}

describe('useAiAgentZeroTouchTicketsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAIAgentUserId.mockReturnValue(AI_AGENT_USER_ID)
        mockApplyAiAgentFilter.mockReturnValue(agentFilters)
    })

    it('should call useStatsMetricTrend with current and previous period queries built from the AI-agent-filtered filters', () => {
        renderHook(() =>
            useAiAgentZeroTouchTicketsTrend(statsFilters, timezone),
        )

        expect(mockApplyAiAgentFilter).toHaveBeenCalledWith(
            statsFilters,
            AI_AGENT_USER_ID,
        )
        expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
            aiAgentAllAgentsZeroTouchTicketsQueryV2Factory({
                filters: agentFilters,
                timezone,
            }),
            aiAgentAllAgentsZeroTouchTicketsQueryV2Factory({
                filters: {
                    ...agentFilters,
                    period: getPreviousPeriod(agentFilters.period),
                },
                timezone,
            }),
        )
    })

    it('should return data from useStatsMetricTrend', () => {
        const mockTrendResult = {
            data: { value: 80, prevValue: 60 },
            isFetching: false,
            isError: false,
        }
        mockUseStatsMetricTrend.mockReturnValue(mockTrendResult)

        const { result } = renderHook(() =>
            useAiAgentZeroTouchTicketsTrend(statsFilters, timezone),
        )

        expect(result.current).toBe(mockTrendResult)
    })
})

describe('fetchAiAgentZeroTouchTicketsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockApplyAiAgentFilter.mockReturnValue(agentFilters)
    })

    it('should call fetchStatsMetricTrend with current and previous period queries built from the AI-agent-filtered filters', async () => {
        mockFetchStatsMetricTrend.mockResolvedValue({
            isFetching: false,
            isError: false,
        })

        await fetchAiAgentZeroTouchTicketsTrend(
            statsFilters,
            timezone,
            AI_AGENT_USER_ID,
        )

        expect(mockApplyAiAgentFilter).toHaveBeenCalledWith(
            statsFilters,
            AI_AGENT_USER_ID,
        )
        expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
            aiAgentAllAgentsZeroTouchTicketsQueryV2Factory({
                filters: agentFilters,
                timezone,
            }),
            aiAgentAllAgentsZeroTouchTicketsQueryV2Factory({
                filters: {
                    ...agentFilters,
                    period: getPreviousPeriod(agentFilters.period),
                },
                timezone,
            }),
        )
    })

    it('should return data from fetchStatsMetricTrend', async () => {
        const mockTrendResult = {
            data: { value: 80, prevValue: 60 },
            isFetching: false,
            isError: false,
        }
        mockFetchStatsMetricTrend.mockResolvedValue(mockTrendResult)

        const result = await fetchAiAgentZeroTouchTicketsTrend(
            statsFilters,
            timezone,
            AI_AGENT_USER_ID,
        )

        expect(result).toBe(mockTrendResult)
    })
})
