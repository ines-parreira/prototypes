import {combineReducers} from 'redux'
import {
    agentPerformanceSlice,
    AgentPerformanceState,
} from 'state/ui/stats/agentPerformanceSlice'
import {
    busiestTimesSlice,
    BusiestTimesState,
} from 'state/ui/stats/busiestTimesSlice'
import {ChannelsSlice, channelsSlice} from 'state/ui/stats/channelsSlice'
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
    helpCenter: HelpCenterState
    contactForm: ContactFormState
    ticketAIAgentFeedback: TicketAIAgentFeedbackState
    [agentPerformanceSlice.name]: AgentPerformanceState
    [channelsSlice.name]: ChannelsSlice
    [ticketInsightsSlice.name]: TicketInsightsState
    [drillDownSlice.name]: DrillDownState
    [busiestTimesSlice.name]: BusiestTimesState
}>({
    editor,
    stats,
    ticketNavbar,
    views,
    helpCenter,
    contactForm,
    ticketAIAgentFeedback,
    [agentPerformanceSlice.name]: agentPerformanceSlice.reducer,
    [busiestTimesSlice.name]: busiestTimesSlice.reducer,
    [channelsSlice.name]: channelsSlice.reducer,
    [ticketInsightsSlice.name]: ticketInsightsSlice.reducer,
    [drillDownSlice.name]: drillDownSlice.reducer,
})

export default uiReducers

export type UIState = ReturnType<typeof uiReducers>
