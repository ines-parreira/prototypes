import {createReducer} from '@reduxjs/toolkit'

import {TicketAIAgentFeedbackState} from './types'

import {changeActiveTab, changeTicketMessage} from './actions'
import {TicketAIAgentFeedbackTab} from './constants'

export const initialState: TicketAIAgentFeedbackState = {
    activeTab: TicketAIAgentFeedbackTab.CustomerInformation,
}

export default createReducer<TicketAIAgentFeedbackState>(
    initialState,
    (builder) =>
        builder
            .addCase(changeActiveTab, (state, {payload}) => {
                state.activeTab = payload.activeTab
            })
            .addCase(changeTicketMessage, (state, {payload}) => {
                state.message = payload.message
            })
)
