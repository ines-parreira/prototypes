import type { PayloadAction } from '@reduxjs/toolkit'
import { createSelector, createSlice } from '@reduxjs/toolkit'
import { getSortByName } from '@repo/utils'
import _intersectionBy from 'lodash/intersectionBy'

import type { User } from 'config/types/user'
import type { ReportingMetricItem } from 'domains/reporting/hooks/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { isMetricForAgent } from 'domains/reporting/pages/common/utils'
import { agentIdFields } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { AutoQAAgentsTableColumn } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import type { AgentPerformanceState } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import { getCleanStatsFilters } from 'domains/reporting/state/ui/stats/selectors'
import type { ColumnSorting } from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'
import { getHumanAndAutomationBotAgentsJS } from 'state/agents/selectors'
import type { RootState } from 'state/types'

export const initialState: AgentPerformanceState<AutoQAAgentsTableColumn> = {
    sorting: {
        field: AutoQAAgentsTableColumn.ReviewedClosedTickets,
        direction: OrderDirection.Desc,
        isLoading: false,
        lastSortingMetric: null,
    },
    pagination: {
        currentPage: 1,
        perPage: 10,
    },
    heatmapMode: false,
}

export const autoQAAgentPerformanceSlice = createSlice({
    name: AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME,
    initialState,
    reducers: {
        sortingSet(
            state,
            action: PayloadAction<ColumnSorting<AutoQAAgentsTableColumn>>,
        ) {
            state.sorting.field = action.payload.field
            state.sorting.direction = action.payload.direction
            state.sorting.isLoading = true
            state.pagination.currentPage = 1
        },
        sortingLoading(state) {
            state.sorting.isLoading = true
            state.pagination.currentPage = 1
        },
        sortingLoaded(
            state,
            action: PayloadAction<Maybe<ReportingMetricItem[]>>,
        ) {
            state.sorting.isLoading = false
            state.sorting.lastSortingMetric = action.payload
            state.pagination.currentPage = 1
        },
        pageSet(state, action: PayloadAction<number>) {
            if (action.payload < 1) {
                state.pagination.currentPage = 1
            } else {
                state.pagination.currentPage = action.payload
            }
        },
        toggleHeatmapMode(state) {
            state.heatmapMode = !state.heatmapMode
        },
    },
})

export const {
    sortingSet,
    sortingLoading,
    sortingLoaded,
    pageSet,
    toggleHeatmapMode,
} = autoQAAgentPerformanceSlice.actions

const getSliceState = (state: RootState) =>
    state.ui.stats.statsTables[autoQAAgentPerformanceSlice.name]

export const getAgentSorting = createSelector(
    getSliceState,
    (state) => state.sorting,
)

export const isSortingMetricLoading = createSelector(
    getSliceState,
    (state) => state.sorting.isLoading,
)

export const getAgentsPagination = createSelector(
    getSliceState,
    (state) => state.pagination,
)

export const getHeatmapMode = createSelector(
    getSliceState,
    (state) => state.heatmapMode,
)

export const getFilteredAgents = createSelector(
    getHumanAndAutomationBotAgentsJS,
    getCleanStatsFilters,
    (agents, filters) => {
        if (
            filters !== null &&
            filters?.agents &&
            filters.agents.values.length > 0
        ) {
            if (filters.agents.operator === LogicalOperatorEnum.NOT_ONE_OF) {
                return agents.filter(
                    (agent) => !filters.agents?.values.includes(agent.id),
                )
            }
            return _intersectionBy(
                agents,
                filters.agents.values.map((agentId: number) => ({
                    id: agentId,
                })),
                'id',
            )
        }
        return agents
    },
)

export const getSortedAutoQAAgents = createSelector(
    getFilteredAgents,
    getAgentSorting,
    (agentsList, { direction, field, lastSortingMetric }) => {
        const agents = agentsList
        const metricName =
            field !== AutoQAAgentsTableColumn.AgentName ? field : null

        if (metricName && lastSortingMetric) {
            let sortedAgents: User[] = []
            const noDataAgents: User[] = []
            agents.forEach((agent) => {
                const agentIndex = lastSortingMetric.findIndex((metric) =>
                    isMetricForAgent(metric, agent.id, agentIdFields),
                )
                if (agentIndex >= 0) {
                    sortedAgents[agentIndex] = agent
                } else {
                    noDataAgents.push(agent)
                }
            })

            sortedAgents = sortedAgents.filter(Boolean)

            return [...sortedAgents, ...noDataAgents]
        }
        const sortedAgents = agents.sort(getSortByName)
        return direction === OrderDirection.Asc
            ? sortedAgents
            : [...sortedAgents].reverse()
    },
)

export const getPaginatedAutoQAAgents = createSelector(
    getSortedAutoQAAgents,
    getAgentsPagination,
    (agents, { currentPage, perPage }) => {
        const startingItem = (currentPage - 1) * perPage
        const lastItem = Math.min(startingItem + perPage, agents.length)
        return {
            agents: agents.slice(startingItem, lastItem),
            allAgents: agents,
            currentPage,
            perPage,
        }
    },
)
