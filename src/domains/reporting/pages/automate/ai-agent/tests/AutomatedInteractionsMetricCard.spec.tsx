import { render } from '@testing-library/react'

import { AutomateTrendMetrics } from 'domains/reporting/hooks/automate/types'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { useAutomateMetricsTrend } from 'domains/reporting/hooks/automate/useAutomationDataset'
import { MISSING_AI_AGENT_USER_ID } from 'domains/reporting/hooks/automate/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { FilterKey, StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AutomatedInteractionsMetricCard } from 'domains/reporting/pages/automate/ai-agent/AutomatedInteractionsMetricCard'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/automate/useAutomationDataset')
const useAutomateMetricsTrendMock = assumeMock(useAutomateMetricsTrend)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)

describe('AutomatedInteractionsMetricCard', () => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2024-09-14T00:00:00+00:00',
            end_datetime: '2024-09-20T23:59:59+00:00',
        },
    }
    const userTimezone = 'UTC'
    const aiAgentUserId = 123
    const loadingMetricData = {
        isFetching: true,
        isError: false,
        data: {
            prevValue: null,
            value: null,
        },
    }
    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
        useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
        useAutomateMetricsTrendMock.mockReturnValueOnce({
            [AutomateTrendMetrics.AutomationRate]: loadingMetricData,
            [AutomateTrendMetrics.Interactions]: loadingMetricData,
            [AutomateTrendMetrics.DecreaseInFirstResponseTime]:
                loadingMetricData,
            [AutomateTrendMetrics.DecreaseInResolutionTime]: loadingMetricData,
        })
    })

    it('should pass AI Agent id when the bot is available', () => {
        render(<AutomatedInteractionsMetricCard />)

        expect(useAutomateMetricsTrendMock).toHaveBeenCalledWith(
            {
                ...statsFilters,
                [FilterKey.Agents]: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [aiAgentUserId],
                },
                channels: {
                    values: ['email'],
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            },
            userTimezone,
        )
    })

    it('should pass placeholder AI Agent id when the bot is unavailable', () => {
        useAIAgentUserIdMock.mockReturnValue(undefined)

        render(<AutomatedInteractionsMetricCard />)

        expect(useAutomateMetricsTrendMock).toHaveBeenCalledWith(
            {
                ...statsFilters,
                [FilterKey.Agents]: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [MISSING_AI_AGENT_USER_ID],
                },
                channels: {
                    values: ['email'],
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            },
            userTimezone,
        )
    })
})
