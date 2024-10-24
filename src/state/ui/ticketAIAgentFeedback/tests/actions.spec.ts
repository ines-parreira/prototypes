import {TicketMessage} from 'models/ticket/types'

import {changeActiveTab, changeTicketMessage} from '../actions'
import {TicketAIAgentFeedbackTab} from '../constants'
import {UIActions} from '../types'

describe('changeActiveTab', () => {
    it('should create an action to change the active tab', () => {
        const tab: TicketAIAgentFeedbackTab = TicketAIAgentFeedbackTab.AIAgent
        const expectedAction = {
            type: UIActions.ChangeActiveTab,
            payload: {activeTab: tab},
        }
        expect(changeActiveTab({activeTab: tab})).toEqual(expectedAction)
    })
})

describe('changeTicketMessage', () => {
    it('should create an action to change the active tab with a message', () => {
        const message = {id: '1'} as unknown as TicketMessage
        const expectedAction = {
            type: UIActions.ChangeTicketMessage,
            payload: {message},
        }
        expect(changeTicketMessage({message})).toEqual(expectedAction)
    })
})
