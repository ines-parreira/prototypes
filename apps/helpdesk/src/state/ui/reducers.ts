import { combineReducers } from 'redux'

import type { StatsState } from 'domains/reporting/state/ui/stats/reducer'
import { statsReducer as stats } from 'domains/reporting/state/ui/stats/reducer'
import { DefaultExportReducer as contactForm } from 'state/ui/contactForm/reducer'
import type { ContactFormState } from 'state/ui/contactForm/types'
import { DefaultExportReducer as editor } from 'state/ui/editor/reducer'
import type { EditorState } from 'state/ui/editor/types'
import { DefaultExportReducer as helpCenter } from 'state/ui/helpCenter/reducer'
import type { HelpCenterState } from 'state/ui/helpCenter/types'
import { DefaultExportReducer as ticketAIAgentFeedback } from 'state/ui/ticketAIAgentFeedback'
import type { TicketAIAgentFeedbackState } from 'state/ui/ticketAIAgentFeedback/types'
import { ViewsReducer as ticketNavbar } from 'state/ui/ticketNavbar/reducer'
import type { TicketNavbarState } from 'state/ui/ticketNavbar/types'
import { ViewsReducer as views } from 'state/ui/views/reducer'
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

export { uiReducers }

export type UIState = ReturnType<typeof uiReducers>
