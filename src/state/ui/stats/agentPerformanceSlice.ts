import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit'
import _intersectionBy from 'lodash/intersectionBy'
import {User} from 'config/types/user'
import {OrderDirection} from 'models/api/types'
import {
    ReportingMeasure,
    TicketMember,
    HelpdeskMessageMember,
} from 'models/reporting/types'
import {getPageStatsFilters} from 'state/stats/selectors'
import {getSortByName} from 'utils/getSortByName'
import {getAgentsJS} from 'state/agents/selectors'

import {RootState} from 'state/types'
import {TableColumn} from 'state/ui/stats/types'

type AgentPerformanceSorting = {
    field: TableColumn
    direction: OrderDirection
}

type MetricData = {
    [key in
        | ReportingMeasure
        | TicketMember.AssigneeUserId
        | TicketMember.FirstHelpdeskMessageUserId
        | HelpdeskMessageMember.SenderId]?: string
}[]

export type AgentPerformanceState = {
    sorting: AgentPerformanceSorting & {
        isLoading: boolean
        lastSortingMetric: null | MetricData
    }
    pagination: {
        currentPage: number
        perPage: number
    }
}

export const initialState: AgentPerformanceState = {
    sorting: {
        field: TableColumn.AgentName,
        direction: OrderDirection.Asc,
        isLoading: false,
        lastSortingMetric: null,
    },
    pagination: {
        currentPage: 1,
        perPage: 25,
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
        sortingLoaded(state, action: PayloadAction<MetricData | null>) {
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
    getPageStatsFilters,
    (agents, filters) =>
        filters?.agents
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
            const sortedAgents: User[] = []
            const noDataAgents: User[] = []
            agents.forEach((agent) => {
                const agentIndex = lastSortingMetric.findIndex(
                    (metric) =>
                        metric[TicketMember.AssigneeUserId] ===
                            String(agent.id) ||
                        metric[TicketMember.FirstHelpdeskMessageUserId] ===
                            String(agent.id) ||
                        metric[HelpdeskMessageMember.SenderId] ===
                            String(agent.id)
                )
                if (agentIndex >= 0) {
                    sortedAgents[agentIndex] = agent
                } else {
                    noDataAgents.push(agent)
                }
            })
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
