import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import _intersectionBy from 'lodash/intersectionBy'

import { User } from 'config/types/user'
import { ReportingMetricItem } from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { isMetricForAgent } from 'pages/stats/common/utils'
import { agentIdFields } from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { getHumanAndAutomationBotAgentsJS } from 'state/agents/selectors'
import { statsFiltersWithLogicalOperatorsFromSavedFilters } from 'state/stats/utils'
import { RootState } from 'state/types'
import { AGENT_PERFORMANCE_SLICE_NAME } from 'state/ui/stats/constants'
import {
    getIsSavedFilterApplied,
    getSavedFilterDraft,
} from 'state/ui/stats/filtersSlice'
import { getCleanStatsFilters } from 'state/ui/stats/selectors'
import { AgentsTableColumn } from 'state/ui/stats/types'
import { getSortByName } from 'utils/getSortByName'

export type AgentPerformanceSorting<T> = {
    field: T
    direction: OrderDirection
}

export type AgentPerformanceState<T> = {
    sorting: AgentPerformanceSorting<T> & {
        isLoading: boolean
        lastSortingMetric: Maybe<ReportingMetricItem[]>
    }
    pagination: {
        currentPage: number
        perPage: number
    }
    heatmapMode: boolean
}

export const DEFAULT_SORTING_DIRECTION = OrderDirection.Asc

export const initialState: AgentPerformanceState<AgentsTableColumn> = {
    sorting: {
        field: AgentsTableColumn.ClosedTickets,
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

export const agentPerformanceSlice = createSlice({
    name: AGENT_PERFORMANCE_SLICE_NAME,
    initialState,
    reducers: {
        sortingSet(
            state,
            action: PayloadAction<AgentPerformanceSorting<AgentsTableColumn>>,
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
} = agentPerformanceSlice.actions

const getSliceState = (state: RootState) =>
    state.ui.stats.statsTables[agentPerformanceSlice.name]

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
    getSavedFilterDraft,
    getIsSavedFilterApplied,
    (agents, filters, savedFilters, isSavedFilterApplied) => {
        const effectiveFilters = isSavedFilterApplied
            ? statsFiltersWithLogicalOperatorsFromSavedFilters(
                  savedFilters?.filter_group,
              )
            : filters
        if (
            effectiveFilters !== null &&
            effectiveFilters?.agents &&
            effectiveFilters.agents.values.length > 0
        ) {
            if (
                effectiveFilters.agents.operator ===
                LogicalOperatorEnum.NOT_ONE_OF
            ) {
                return agents.filter(
                    (agent) =>
                        !effectiveFilters.agents?.values.includes(agent.id),
                )
            }
            return _intersectionBy(
                agents,
                effectiveFilters.agents.values.map((agentId: number) => ({
                    id: agentId,
                })),
                'id',
            )
        }
        return agents
    },
)

export const getSortedAgents = createSelector(
    getFilteredAgents,
    getAgentSorting,
    (agentsList, { direction, field, lastSortingMetric }) => {
        const agents = agentsList
        const metricName = field !== AgentsTableColumn.AgentName ? field : null

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

export const getPaginatedAgents = createSelector(
    getSortedAgents,
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
