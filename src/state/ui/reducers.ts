import {combineReducers} from 'redux'
import {
    agentPerformanceSlice,
    AgentPerformanceState,
} from 'state/ui/stats/agentPerformanceSlice'
import {
    ticketInsightsSlice,
    TicketInsightsState,
} from 'state/ui/stats/ticketInsightsSlice'
import {drillDownSlice, DrillDownState} from 'state/ui/stats/drillDownSlice'

import editor from './editor/reducer'
import {EditorState} from './editor/types'
import stats from './stats/reducer'
import {StatsState} from './stats/types'
import ticketNavbar from './ticketNavbar/reducer'
import {TicketNavbarState} from './ticketNavbar/types'
import views from './views/reducer'
import {ViewsState} from './views/types'
import {SelfServiceConfigurationsState} from './selfServiceConfigurations/types'
import selfServiceConfigurations from './selfServiceConfigurations/reducer'
import {HelpCenterState} from './helpCenter/types'
import helpCenter from './helpCenter/reducer'
import {ContactFormState} from './contactForm/types'
import contactForm from './contactForm/reducer'
import ticketAIAgentFeedback from './ticketAIAgentFeedback'
import {TicketAIAgentFeedbackState} from './ticketAIAgentFeedback/types'

const uiReducers = combineReducers<{
    editor: EditorState
    stats: StatsState
    ticketNavbar: TicketNavbarState
    views: ViewsState
    selfServiceConfigurations: SelfServiceConfigurationsState
    helpCenter: HelpCenterState
    contactForm: ContactFormState
    ticketAIAgentFeedback: TicketAIAgentFeedbackState
    [agentPerformanceSlice.name]: AgentPerformanceState
    [ticketInsightsSlice.name]: TicketInsightsState
    [drillDownSlice.name]: DrillDownState
}>({
    editor,
    stats,
    ticketNavbar,
    views,
    selfServiceConfigurations,
    helpCenter,
    contactForm,
    ticketAIAgentFeedback,
    [agentPerformanceSlice.name]: agentPerformanceSlice.reducer,
    [ticketInsightsSlice.name]: ticketInsightsSlice.reducer,
    [drillDownSlice.name]: drillDownSlice.reducer,
})

export default uiReducers

export type UIState = ReturnType<typeof uiReducers>
