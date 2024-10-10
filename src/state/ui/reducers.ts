import {combineReducers} from 'redux'
import contactForm from 'state/ui/contactForm/reducer'
import {ContactFormState} from 'state/ui/contactForm/types'

import editor from 'state/ui/editor/reducer'
import {EditorState} from 'state/ui/editor/types'
import helpCenter from 'state/ui/helpCenter/reducer'
import {HelpCenterState} from 'state/ui/helpCenter/types'
import {
    busiestTimesSlice,
    BusiestTimesState,
} from 'state/ui/stats/busiestTimesSlice'
import {ChannelsSlice, channelsSlice} from 'state/ui/stats/channelsSlice'
import {drillDownSlice, DrillDownState} from 'state/ui/stats/drillDownSlice'
import stats from 'state/ui/stats/reducer'
import {statsTablesReducer} from 'state/ui/stats/statsTablesReducer'
import {tagsReportSlice, TagsReportState} from 'state/ui/stats/tagsReportSlice'
import {
    ticketInsightsSlice,
    TicketInsightsState,
} from 'state/ui/stats/ticketInsightsSlice'
import {StatsState, StatsTablesState} from 'state/ui/stats/types'
import ticketAIAgentFeedback from 'state/ui/ticketAIAgentFeedback'
import {TicketAIAgentFeedbackState} from 'state/ui/ticketAIAgentFeedback/types'
import ticketNavbar from 'state/ui/ticketNavbar/reducer'
import {TicketNavbarState} from 'state/ui/ticketNavbar/types'
import views from 'state/ui/views/reducer'
import {ViewsState} from 'state/ui/views/types'

const uiReducers = combineReducers<{
    editor: EditorState
    stats: StatsState
    ticketNavbar: TicketNavbarState
    views: ViewsState
    helpCenter: HelpCenterState
    contactForm: ContactFormState
    ticketAIAgentFeedback: TicketAIAgentFeedbackState
    statsTables: StatsTablesState
    [channelsSlice.name]: ChannelsSlice
    [tagsReportSlice.name]: TagsReportState
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
    statsTables: statsTablesReducer,
    [busiestTimesSlice.name]: busiestTimesSlice.reducer,
    [channelsSlice.name]: channelsSlice.reducer,
    [tagsReportSlice.name]: tagsReportSlice.reducer,
    [ticketInsightsSlice.name]: ticketInsightsSlice.reducer,
    [drillDownSlice.name]: drillDownSlice.reducer,
})

export default uiReducers

export type UIState = ReturnType<typeof uiReducers>
