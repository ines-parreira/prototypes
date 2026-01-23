import { assumeMock } from '@repo/testing'

import type { User } from 'config/types/user'
import { UserRole } from 'config/types/user'
import { useAIAgentUser } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
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

jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
const useAutomateFiltersMock = assumeMock(useAutomateFilters)

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
        statsFilters: defaultStatsFilters,
        userTimezone: 'UTC',
        granularity: ReportingGranularity.Day,
    }

    beforeEach(() => {
        AgentsTableMock.mockImplementation(() => <div />)
        useAIAgentUserMock.mockReturnValue(aiAgent)
        useAutomateFiltersMock.mockReturnValue(
            statsFiltersWithUserTimezone as ReturnType<
                typeof useAutomateFilters
            >,
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
                        ...statsFiltersWithUserTimezone.statsFilters,
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
                        ...statsFiltersWithUserTimezone.statsFilters,
                        agents: withDefaultLogicalOperator([aiAgent.id]),
                    },
                },
                withAggregateRows: false,
            },
            {},
        )
    })
})
