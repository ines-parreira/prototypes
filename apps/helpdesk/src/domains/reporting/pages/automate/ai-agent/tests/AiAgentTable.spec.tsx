import { assumeMock } from '@repo/testing'

import { User, UserRole } from 'config/types/user'
import { useAIAgentUser } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AiAgentTable } from 'domains/reporting/pages/automate/ai-agent/AiAgentTable'
import { AgentsTable } from 'domains/reporting/pages/support-performance/agents/AgentsTable'
import { defaultStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import { agents } from 'fixtures/agents'
import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'
import { renderWithStore } from 'utils/testing'

jest.mock('domains/reporting/pages/support-performance/agents/AgentsTable')
const AgentsTableMock = assumeMock(AgentsTable)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
const useAIAgentUserMock = assumeMock(useAIAgentUser)

describe('AiAgentTable', () => {
    const aiAgent: User = {
        ...agents[0],
        role: {
            name: UserRole.Bot,
        },
        email: AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS[0],
    }
    const statsFiltersWithUserTimezone = {
        cleanStatsFilters: defaultStatsFilters,
        userTimezone: 'UTC',
        granularity: ReportingGranularity.Day,
    }

    beforeEach(() => {
        AgentsTableMock.mockImplementation(() => <div />)
        useAIAgentUserMock.mockReturnValue(aiAgent)
        useStatsFiltersMock.mockReturnValue(
            statsFiltersWithUserTimezone as ReturnType<typeof useStatsFilters>,
        )
    })

    it('should pass no Agents if there is no iAgent', () => {
        useAIAgentUserMock.mockReturnValue(undefined)

        renderWithStore(<AiAgentTable />, {})

        expect(AgentsTableMock).toHaveBeenCalledWith(
            {
                isHeatmapMode: false,
                paginatedAgents: {
                    agents: [],
                    allAgents: [],
                    currentPage: 1,
                    perPage: 1,
                },
                statsFilters: {
                    ...statsFiltersWithUserTimezone,
                    cleanStatsFilters: {
                        ...statsFiltersWithUserTimezone.cleanStatsFilters,
                        agents: withDefaultLogicalOperator([]),
                    },
                },
                withAggregateRows: false,
            },
            {},
        )
    })

    it('should pass paginated agents and filters with AiAgent', () => {
        renderWithStore(<AiAgentTable />, {})

        expect(AgentsTableMock).toHaveBeenCalledWith(
            {
                isHeatmapMode: false,
                paginatedAgents: {
                    agents: [aiAgent],
                    allAgents: [aiAgent],
                    currentPage: 1,
                    perPage: 1,
                },
                statsFilters: {
                    ...statsFiltersWithUserTimezone,
                    cleanStatsFilters: {
                        ...statsFiltersWithUserTimezone.cleanStatsFilters,
                        agents: withDefaultLogicalOperator([aiAgent.id]),
                    },
                },
                withAggregateRows: false,
            },
            {},
        )
    })
})
