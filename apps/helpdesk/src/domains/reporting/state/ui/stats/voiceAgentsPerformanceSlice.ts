import type { Slice } from '@reduxjs/toolkit'

import { agentIdFields } from 'domains/reporting/pages/voice/components/VoiceAgentsTable/VoiceAgentsTableConfig'
import { VOICE_AGENTS_PERFORMANCE_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import type { AgentPerformanceState } from 'domains/reporting/state/ui/stats/createTableSlice'
import { createTableSlice } from 'domains/reporting/state/ui/stats/createTableSlice'
import { VoiceAgentsTableColumn } from 'domains/reporting/state/ui/stats/types'

export const voiceAgentsPerformance = createTableSlice<VoiceAgentsTableColumn>({
    sliceName: VOICE_AGENTS_PERFORMANCE_SLICE_NAME,
    defaultSortingField: VoiceAgentsTableColumn.TotalCalls,
    agentIdFields: agentIdFields,
})

export const voiceAgentsPerformanceSlice: Slice<
    AgentPerformanceState<VoiceAgentsTableColumn>
> = voiceAgentsPerformance.slice
export const initialState = voiceAgentsPerformanceSlice.getInitialState()
export const {
    sortingSet,
    sortingLoading,
    sortingLoaded,
    pageSet,
    toggleHeatmapMode,
} = voiceAgentsPerformance.actions

export const {
    getAgentSorting,
    isSortingMetricLoading,
    getAgentsPagination,
    getHeatmapMode,
    getFilteredAgents,
    getSortedAgents,
    getPaginatedAgents,
} = voiceAgentsPerformance.selectors
