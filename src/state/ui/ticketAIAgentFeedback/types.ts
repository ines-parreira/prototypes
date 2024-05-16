import {PayloadActionCreator} from '@reduxjs/toolkit'
import {TicketAIAgentFeedbackTab} from './constants'

export enum UIActions {
    ChangeActiveTab = 'CHANGE_ACTIVE_TAB',
}

export type ChangeActiveTabAction = PayloadActionCreator<
    string,
    UIActions.ChangeActiveTab
>

export type TicketAIAgentFeedbackState = {
    activeTab: TicketAIAgentFeedbackTab
}
