import { createSelector } from 'reselect'

import { StoreState } from 'state/types'

import { TicketAIAgentFeedbackState } from './types'

const getTicketAIAgentFeedbackState = (
    state: StoreState,
): TicketAIAgentFeedbackState => state.ui.ticketAIAgentFeedback

export const getSelectedAIMessage = createSelector(
    getTicketAIAgentFeedbackState,
    (state) => state.feedback.message,
)
