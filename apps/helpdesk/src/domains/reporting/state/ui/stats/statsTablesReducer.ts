import { combineReducers } from 'redux'

import {
    initialState as agentAvailabilityInitialState,
    agentAvailabilitySlice,
} from 'domains/reporting/state/ui/stats/agentAvailabilitySlice'
import {
    agentPerformanceSlice,
    initialState as agentsPerformanceInitialState,
} from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import {
    autoQAAgentPerformanceSlice,
    initialState as autoQAAgentsPerformanceInitialState,
} from 'domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice'
import {
    AGENT_AVAILABILITY_SLICE_NAME,
    AGENT_PERFORMANCE_SLICE_NAME,
    AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME,
    INTENT_SLICE_NAME,
    PRODUCT_INSIGHTS_SLICE_NAME,
    PRODUCTS_PER_TICKET_SLICE_NAME,
    VOICE_AGENTS_PERFORMANCE_SLICE_NAME,
} from 'domains/reporting/state/ui/stats/constants'
import {
    initialState as intentInitialState,
    intentSlice,
} from 'domains/reporting/state/ui/stats/insightsSlice'
import {
    initialState as productInsightsInitialState,
    productInsightsSlice,
} from 'domains/reporting/state/ui/stats/productInsightsSlice'
import {
    initialState as productsPerTicketInitialState,
    productsPerTicketSlice,
} from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import {
    initialState as voiceAgentsPerformanceInitialState,
    voiceAgentsPerformanceSlice,
} from 'domains/reporting/state/ui/stats/voiceAgentsPerformanceSlice'

export const initialState = {
    [AGENT_PERFORMANCE_SLICE_NAME]: agentsPerformanceInitialState,
    [AGENT_AVAILABILITY_SLICE_NAME]: agentAvailabilityInitialState,
    [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: autoQAAgentsPerformanceInitialState,
    [INTENT_SLICE_NAME]: intentInitialState,
    [PRODUCTS_PER_TICKET_SLICE_NAME]: productsPerTicketInitialState,
    [VOICE_AGENTS_PERFORMANCE_SLICE_NAME]: voiceAgentsPerformanceInitialState,
    [PRODUCT_INSIGHTS_SLICE_NAME]: productInsightsInitialState,
}

export const statsTablesReducer = combineReducers({
    [AGENT_PERFORMANCE_SLICE_NAME]: agentPerformanceSlice.reducer,
    [AGENT_AVAILABILITY_SLICE_NAME]: agentAvailabilitySlice.reducer,
    [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: autoQAAgentPerformanceSlice.reducer,
    [INTENT_SLICE_NAME]: intentSlice.reducer,
    [PRODUCTS_PER_TICKET_SLICE_NAME]: productsPerTicketSlice.reducer,
    [VOICE_AGENTS_PERFORMANCE_SLICE_NAME]: voiceAgentsPerformanceSlice.reducer,
    [PRODUCT_INSIGHTS_SLICE_NAME]: productInsightsSlice.reducer,
})
