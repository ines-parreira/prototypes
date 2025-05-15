import { Slice } from '@reduxjs/toolkit'

import { agentIdFields } from 'pages/stats/voice/components/VoiceAgentsTable/VoiceAgentsTableConfig'
import { VOICE_AGENTS_PERFORMANCE_SLICE_NAME } from 'state/ui/stats/constants'
import {
    AgentPerformanceState,
    createTableSlice,
} from 'state/ui/stats/createTableSlice'
import { VoiceAgentsTableColumn } from 'state/ui/stats/types'

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
