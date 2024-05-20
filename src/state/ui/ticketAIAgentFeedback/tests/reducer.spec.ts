import {TicketMessage} from 'models/ticket/types'
import reducer, {initialState} from '../reducer'
import {changeActiveTab, changeTicketMessage} from '../actions'
import {ChangeActiveTabAction} from '../types'
import {TicketAIAgentFeedbackTab} from '../constants'

describe('ticketAIAgentFeedback reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {} as ChangeActiveTabAction)).toEqual(
            initialState
        )
    })

    it('should handle changeActiveTab', () => {
        const newTab = TicketAIAgentFeedbackTab.AIAgent
        const action = changeActiveTab({activeTab: newTab})
        const newState = reducer(initialState, action)

        expect(newState.activeTab).toEqual(newTab)
    })

    it('should handle changeTicketMessage with message', () => {
        const newMessage = {id: '1'} as unknown as TicketMessage
        const action = changeTicketMessage({message: newMessage})
        const newState = reducer(initialState, action)

        expect(newState.message).toEqual(newMessage)
    })
})
