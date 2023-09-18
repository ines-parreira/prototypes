import {combineReducers} from 'redux'
import {
    agentPerformanceSlice,
    AgentPerformanceState,
} from 'state/ui/stats/agentPerformanceSlice'
import {
    ticketInsightsSlice,
    TicketInsightsState,
} from 'state/ui/stats/ticketInsightsSlice'

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

const uiReducers = combineReducers<{
    editor: EditorState
    stats: StatsState
    ticketNavbar: TicketNavbarState
    views: ViewsState
    selfServiceConfigurations: SelfServiceConfigurationsState
    helpCenter: HelpCenterState
    contactForm: ContactFormState
    [agentPerformanceSlice.name]: AgentPerformanceState
    [ticketInsightsSlice.name]: TicketInsightsState
}>({
    editor,
    stats,
    ticketNavbar,
    views,
    selfServiceConfigurations,
    helpCenter,
    contactForm,
    [agentPerformanceSlice.name]: agentPerformanceSlice.reducer,
    [ticketInsightsSlice.name]: ticketInsightsSlice.reducer,
})

export default uiReducers

export type UIState = ReturnType<typeof uiReducers>
