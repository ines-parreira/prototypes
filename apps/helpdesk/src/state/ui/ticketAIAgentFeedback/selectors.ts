import { createSelector } from 'reselect'

import type { StoreState } from 'state/types'

import type { TicketAIAgentFeedbackState } from './types'

const getTicketAIAgentFeedbackState = (
    state: StoreState,
): TicketAIAgentFeedbackState => state.ui.ticketAIAgentFeedback

export const getSelectedAIMessage = createSelector(
    getTicketAIAgentFeedbackState,
    (state) => state.feedback.message,
)
