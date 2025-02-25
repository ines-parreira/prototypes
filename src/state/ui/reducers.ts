import { combineReducers } from 'redux'

import contactForm from 'state/ui/contactForm/reducer'
import { ContactFormState } from 'state/ui/contactForm/types'
import editor from 'state/ui/editor/reducer'
import { EditorState } from 'state/ui/editor/types'
import helpCenter from 'state/ui/helpCenter/reducer'
import { HelpCenterState } from 'state/ui/helpCenter/types'
import stats, { StatsState } from 'state/ui/stats/reducer'
import ticketAIAgentFeedback from 'state/ui/ticketAIAgentFeedback'
import { TicketAIAgentFeedbackState } from 'state/ui/ticketAIAgentFeedback/types'
import ticketNavbar from 'state/ui/ticketNavbar/reducer'
import { TicketNavbarState } from 'state/ui/ticketNavbar/types'
import views from 'state/ui/views/reducer'
import { ViewsState } from 'state/ui/views/types'

const uiReducers = combineReducers<{
    editor: EditorState
    stats: StatsState
    ticketNavbar: TicketNavbarState
    views: ViewsState
    helpCenter: HelpCenterState
    contactForm: ContactFormState
    ticketAIAgentFeedback: TicketAIAgentFeedbackState
}>({
    editor,
    stats,
    ticketNavbar,
    views,
    helpCenter,
    contactForm,
    ticketAIAgentFeedback,
})

export default uiReducers

export type UIState = ReturnType<typeof uiReducers>
