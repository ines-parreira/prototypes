import { Slice } from '@reduxjs/toolkit'

import { agentIdFields } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { AGENT_PERFORMANCE_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import {
    AgentPerformanceState,
    createTableSlice,
} from 'domains/reporting/state/ui/stats/createTableSlice'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'

export const agentPerformance = createTableSlice<AgentsTableColumn>({
    sliceName: AGENT_PERFORMANCE_SLICE_NAME,
    defaultSortingField: AgentsTableColumn.ClosedTickets,
    agentIdFields,
})

export const agentPerformanceSlice: Slice<
    AgentPerformanceState<AgentsTableColumn>
> = agentPerformance.slice
export const initialState = agentPerformanceSlice.getInitialState()

export type {
    AgentPerformanceSorting,
    AgentPerformanceState,
} from 'domains/reporting/state/ui/stats/createTableSlice'
export { DEFAULT_SORTING_DIRECTION } from 'domains/reporting/state/ui/stats/createTableSlice'

export const {
    sortingSet,
    sortingLoading,
    sortingLoaded,
    pageSet,
    toggleHeatmapMode,
} = agentPerformance.actions

export const {
    getAgentSorting,
    isSortingMetricLoading,
    getAgentsPagination,
    getHeatmapMode,
    getFilteredAgents,
    getSortedAgents,
    getPaginatedAgents,
} = agentPerformance.selectors
