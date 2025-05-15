import { combineReducers } from 'redux'

import {
    agentPerformanceSlice,
    initialState as agentsPerformanceInitialState,
} from 'state/ui/stats/agentPerformanceSlice'
import {
    autoQAAgentPerformanceSlice,
    initialState as autoQAAgentsPerformanceInitialState,
} from 'state/ui/stats/autoQAAgentPerformanceSlice'
import {
    AGENT_PERFORMANCE_SLICE_NAME,
    AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME,
    INTENT_SLICE_NAME,
    VOICE_AGENTS_PERFORMANCE_SLICE_NAME,
} from 'state/ui/stats/constants'
import {
    initialState as intentInitialState,
    intentSlice,
} from 'state/ui/stats/insightsSlice'
import {
    initialState as voiceAgentsPerformanceInitialState,
    voiceAgentsPerformanceSlice,
} from 'state/ui/stats/voiceAgentsPerformanceSlice'

export const initialState = {
    [AGENT_PERFORMANCE_SLICE_NAME]: agentsPerformanceInitialState,
    [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: autoQAAgentsPerformanceInitialState,
    [INTENT_SLICE_NAME]: intentInitialState,
    [VOICE_AGENTS_PERFORMANCE_SLICE_NAME]: voiceAgentsPerformanceInitialState,
}

export const statsTablesReducer = combineReducers({
    [AGENT_PERFORMANCE_SLICE_NAME]: agentPerformanceSlice.reducer,
    [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: autoQAAgentPerformanceSlice.reducer,
    [INTENT_SLICE_NAME]: intentSlice.reducer,
    [VOICE_AGENTS_PERFORMANCE_SLICE_NAME]: voiceAgentsPerformanceSlice.reducer,
})
