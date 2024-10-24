import {createAction} from '@reduxjs/toolkit'

import {TicketMessage} from 'models/ticket/types'

import {TicketAIAgentFeedbackTab} from './constants'
import {UIActions} from './types'

export const changeTicketMessage = createAction<{
    message?: TicketMessage
}>(UIActions.ChangeTicketMessage)

export const changeActiveTab = createAction<{
    activeTab: TicketAIAgentFeedbackTab
}>(UIActions.ChangeActiveTab)
