import React from 'react'

import {User, UserRole} from 'config/types/user'
import {agents} from 'fixtures/agents'
import {useAIAgentUser} from 'hooks/reporting/automate/useAIAgentUserId'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {ReportingGranularity} from 'models/reporting/types'
import {AiAgentTable} from 'pages/stats/automate/ai-agent/AiAgentTable'
import {AgentsTable} from 'pages/stats/support-performance/agents/AgentsTable'
import {AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS} from 'state/agents/constants'
import {defaultStatsFilters} from 'state/stats/statsSlice'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('pages/stats/support-performance/agents/AgentsTable')
const AgentsTableMock = assumeMock(AgentsTable)

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

jest.mock('hooks/reporting/automate/useAIAgentUserId')
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
        isAnalyticsNewFilters: true,
        reportingGranularity: ReportingGranularity.Day,
    }

    beforeEach(() => {
        AgentsTableMock.mockImplementation(() => <div />)
        useAIAgentUserMock.mockReturnValue(aiAgent)
        useNewStatsFiltersMock.mockReturnValue(
            statsFiltersWithUserTimezone as any
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
                withAverageRow: false,
            },
            {}
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
                withAverageRow: false,
            },
            {}
        )
    })
})
