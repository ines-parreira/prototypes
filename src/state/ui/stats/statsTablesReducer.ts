import {combineReducers} from 'redux'

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
} from 'state/ui/stats/constants'
import {
    intentSlice,
    initialState as intentInitialState,
} from 'state/ui/stats/insightsSlice'

export const initialState = {
    [AGENT_PERFORMANCE_SLICE_NAME]: agentsPerformanceInitialState,
    [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: autoQAAgentsPerformanceInitialState,
    [INTENT_SLICE_NAME]: intentInitialState,
}

export const statsTablesReducer = combineReducers({
    [AGENT_PERFORMANCE_SLICE_NAME]: agentPerformanceSlice.reducer,
    [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: autoQAAgentPerformanceSlice.reducer,
    [INTENT_SLICE_NAME]: intentSlice.reducer,
})
