import {createAction} from '@reduxjs/toolkit'

import {UIActions} from './types'
import {TicketAIAgentFeedbackTab} from './constants'

export const changeActiveTab = createAction<TicketAIAgentFeedbackTab>(
    UIActions.ChangeActiveTab
)
