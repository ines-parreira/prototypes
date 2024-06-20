import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit'
import _intersectionBy from 'lodash/intersectionBy'
import {User} from 'config/types/user'
import {ReportingMetricItem} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {agentIdFields} from 'pages/stats/AgentsTableConfig'
import {isMetricForAgent} from 'pages/stats/common/utils'
import {getHumanAndAutomationBotAgentsJS} from 'state/agents/selectors'

import {RootState} from 'state/types'
import {getCleanStatsFilters} from 'state/ui/stats/selectors'
import {AgentsTableColumn} from 'state/ui/stats/types'
import {getSortByName} from 'utils/getSortByName'

type AgentPerformanceSorting = {
    field: AgentsTableColumn
    direction: OrderDirection
}

type MetricData = ReportingMetricItem[]

export type AgentPerformanceState = {
    sorting: AgentPerformanceSorting & {
        isLoading: boolean
        lastSortingMetric: Maybe<MetricData>
    }
    pagination: {
        currentPage: number
        perPage: number
    }
    heatmapMode: boolean
}

export const DEFAULT_SORTING_DIRECTION = OrderDirection.Asc

export const initialState: AgentPerformanceState = {
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
    name: 'agentPerformance',
    initialState,
    reducers: {
        sortingSet(state, action: PayloadAction<AgentPerformanceSorting>) {
            state.sorting.field = action.payload.field
            state.sorting.direction = action.payload.direction
            state.sorting.isLoading = true
            state.pagination.currentPage = 1
        },
        sortingLoading(state) {
            state.sorting.isLoading = true
            state.pagination.currentPage = 1
        },
        sortingLoaded(state, action: PayloadAction<Maybe<MetricData>>) {
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

export const getAgentSorting = (state: RootState) =>
    state.ui[agentPerformanceSlice.name].sorting

export const isSortingMetricLoading = (state: RootState) =>
    state.ui[agentPerformanceSlice.name].sorting.isLoading

export const getAgentsPagination = (state: RootState) =>
    state.ui[agentPerformanceSlice.name].pagination

export const getHeatmapMode = (state: RootState) =>
    state.ui[agentPerformanceSlice.name].heatmapMode

export const getFilteredAgents = createSelector(
    getHumanAndAutomationBotAgentsJS,
    getCleanStatsFilters,
    (agents, filters) =>
        filters !== null && filters?.agents && filters.agents.length > 0
            ? _intersectionBy(
                  agents,
                  filters?.agents.map((agentId: number) => ({id: agentId})),
                  'id'
              )
            : agents
)

export const getSortedAgents = createSelector(
    getFilteredAgents,
    getAgentSorting,
    (agentsList, {direction, field, lastSortingMetric}) => {
        const agents = agentsList
        const metricName = field !== AgentsTableColumn.AgentName ? field : null

        if (metricName && lastSortingMetric) {
            let sortedAgents: User[] = []
            const noDataAgents: User[] = []
            agents.forEach((agent) => {
                const agentIndex = lastSortingMetric.findIndex((metric) =>
                    isMetricForAgent(metric, agent.id, agentIdFields)
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
    }
)

export const getPaginatedAgents = createSelector(
    getSortedAgents,
    getAgentsPagination,
    (agents, {currentPage, perPage}) => {
        const startingItem = (currentPage - 1) * perPage
        const lastItem = Math.min(startingItem + perPage, agents.length)
        return {
            agents: agents.slice(startingItem, lastItem),
            currentPage,
            perPage,
        }
    }
)
