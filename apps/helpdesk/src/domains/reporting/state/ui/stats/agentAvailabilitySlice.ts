import type { Slice } from '@reduxjs/toolkit'

import type { AgentAvailabilityColumn } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants/agentAvailability'
import { AGENT_AVAILABILITY_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import type { AgentPerformanceState } from 'domains/reporting/state/ui/stats/createTableSlice'
import { createTableSlice } from 'domains/reporting/state/ui/stats/createTableSlice'

export const agentAvailability = createTableSlice<AgentAvailabilityColumn>({
    sliceName: AGENT_AVAILABILITY_SLICE_NAME,
    defaultSortingField: AGENT_AVAILABILITY_COLUMNS.AGENT_NAME_COLUMN,
    agentIdFields: ['agentId'],
})

export const agentAvailabilitySlice: Slice<
    AgentPerformanceState<AgentAvailabilityColumn>
> = agentAvailability.slice
export const initialState = agentAvailabilitySlice.getInitialState()

export const {
    sortingSet,
    sortingLoading,
    sortingLoaded,
    pageSet,
    toggleHeatmapMode,
} = agentAvailability.actions

export const {
    getAgentSorting,
    isSortingMetricLoading,
    getAgentsPagination,
    getFilteredAgents,
    getSortedAgents,
    getPaginatedAgents,
} = agentAvailability.selectors
