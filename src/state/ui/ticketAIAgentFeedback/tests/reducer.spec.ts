import reducer, {initialState} from '../reducer'
import {changeActiveTab} from '../actions'
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
        const action = changeActiveTab(newTab)
        const newState = reducer(initialState, action)

        expect(newState.activeTab).toEqual(newTab)
    })
})
