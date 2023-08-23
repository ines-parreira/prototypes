import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit'
import _intersectionBy from 'lodash/intersectionBy'
import {User} from 'config/types/user'
import {OrderDirection} from 'models/api/types'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import {getAgentsJS} from 'state/agents/selectors'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'

import {RootState} from 'state/types'
import {getCleanStatsFilters} from 'state/ui/stats/selectors'
import {TableColumn} from 'state/ui/stats/types'
import {getSortByName} from 'utils/getSortByName'
import {isMetricForAgent} from 'pages/stats/common/utils'
import {ReportingMetricItem} from 'hooks/reporting/useMetricPerDimension'

type AgentPerformanceSorting = {
    field: TableColumn
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
}

export const DEFAULT_SORTING_DIRECTION = OrderDirection.Asc

export const initialState: AgentPerformanceState = {
    sorting: {
        field: TableColumn.AgentName,
        direction: DEFAULT_SORTING_DIRECTION,
        isLoading: false,
        lastSortingMetric: null,
    },
    pagination: {
        currentPage: 1,
        perPage: 10,
    },
}

export const agentPerformanceSlice = createSlice({
    name: 'agentPerformance',
    initialState,
    reducers: {
        sortingSet(state, action: PayloadAction<AgentPerformanceSorting>) {
            state.sorting.field = action.payload.field
            state.sorting.direction = action.payload.direction
            state.sorting.isLoading = true
        },
        sortingLoaded(state, action: PayloadAction<Maybe<MetricData>>) {
            state.sorting.isLoading = false
            state.sorting.lastSortingMetric = action.payload
        },
        pageSet(state, action: PayloadAction<number>) {
            if (action.payload < 1) {
                state.pagination.currentPage = 1
            } else {
                state.pagination.currentPage = action.payload
            }
        },
    },
})

export const {sortingSet, sortingLoaded, pageSet} =
    agentPerformanceSlice.actions

export const getAgentSorting = (state: RootState) =>
    state.ui[agentPerformanceSlice.name].sorting

export const isSortingMetricLoading = (state: RootState) =>
    state.ui[agentPerformanceSlice.name].sorting.isLoading

export const getAgentsPagination = (state: RootState) =>
    state.ui[agentPerformanceSlice.name].pagination

export const getFilteredAgents = createSelector(
    getAgentsJS,
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
        const metricName = field !== TableColumn.AgentName ? field : null

        if (metricName && lastSortingMetric) {
            let sortedAgents: User[] = []
            const noDataAgents: User[] = []
            agents.forEach((agent) => {
                const agentIndex = lastSortingMetric.findIndex((metric) =>
                    isMetricForAgent(metric, agent.id)
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

export const getCleanStatsFiltersWithTimezone = createSelector(
    getCleanStatsFilters,
    getPageStatsFilters,
    getTimezone,
    (cleanStatsFilters, pageStatsFilters, timezone) => {
        return {
            userTimezone: timezone || DEFAULT_TIMEZONE,
            cleanStatsFilters: cleanStatsFilters || pageStatsFilters,
        }
    }
)
