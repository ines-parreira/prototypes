import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {User} from 'config/types/user'
import {OrderDirection} from 'models/api/types'
import {ReportingMeasure, TicketMember} from 'models/reporting/types'
import {getSortByName} from 'utils/getSortByName'
import {getAgentsJS} from 'state/agents/selectors'

import {RootState} from 'state/types'
import {TableColumn} from 'state/ui/stats/types'

type AgentPerformanceSorting = {
    field: TableColumn
    direction: OrderDirection
}

type MetricData = {
    [key in ReportingMeasure | TicketMember.AssigneeUserId]?: string
}[]

export type AgentPerformanceState = {
    sorting: AgentPerformanceSorting & {isLoading: boolean}
    lastSortingMetric: null | MetricData
}

export const initialState: AgentPerformanceState = {
    sorting: {
        field: TableColumn.AgentName,
        direction: OrderDirection.Asc,
        isLoading: false,
    },
    lastSortingMetric: null,
}

export const agentPerformanceSlice = createSlice({
    name: 'agentPerformance',
    initialState,
    reducers: {
        sortingSet(state, action: PayloadAction<AgentPerformanceSorting>) {
            state.sorting = {...action.payload, isLoading: true}
        },
        sortingLoaded(state, action: PayloadAction<MetricData | null>) {
            state.sorting.isLoading = false
            state.lastSortingMetric = action.payload
        },
    },
})

export const {sortingSet, sortingLoaded} = agentPerformanceSlice.actions

export const selectAgentPerformance = (state: RootState) =>
    state.ui[agentPerformanceSlice.name]

export const selectAgentSorting = (state: RootState) =>
    state.ui[agentPerformanceSlice.name].sorting

export const selectSortingMetricIsLoading = (state: RootState) =>
    state.ui[agentPerformanceSlice.name].sorting.isLoading

export const selectSortedAgents = createSelector(
    getAgentsJS,
    selectAgentPerformance,
    (agentsList, {sorting, lastSortingMetric}) => {
        const agents = agentsList
        const metricName =
            sorting.field !== TableColumn.AgentName ? sorting.field : null

        if (metricName && lastSortingMetric) {
            const sortedAgents: User[] = []
            const noDataAgents: User[] = []
            agents.forEach((agent) => {
                const agentIndex = lastSortingMetric.findIndex(
                    (metric) =>
                        metric[TicketMember.AssigneeUserId] === String(agent.id)
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
        return sorting.direction === OrderDirection.Asc
            ? sortedAgents
            : [...sortedAgents].reverse()
    }
)
