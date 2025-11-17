import { combineReducers } from 'redux'

import type { StatsState } from 'domains/reporting/state/ui/stats/reducer'
import stats from 'domains/reporting/state/ui/stats/reducer'
import contactForm from 'state/ui/contactForm/reducer'
import type { ContactFormState } from 'state/ui/contactForm/types'
import editor from 'state/ui/editor/reducer'
import type { EditorState } from 'state/ui/editor/types'
import helpCenter from 'state/ui/helpCenter/reducer'
import type { HelpCenterState } from 'state/ui/helpCenter/types'
import ticketAIAgentFeedback from 'state/ui/ticketAIAgentFeedback'
import type { TicketAIAgentFeedbackState } from 'state/ui/ticketAIAgentFeedback/types'
import ticketNavbar from 'state/ui/ticketNavbar/reducer'
import type { TicketNavbarState } from 'state/ui/ticketNavbar/types'
import views from 'state/ui/views/reducer'
import type { ViewsState } from 'state/ui/views/types'

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
