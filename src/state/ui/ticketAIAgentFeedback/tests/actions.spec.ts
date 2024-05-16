import {changeActiveTab} from '../actions'
import {TicketAIAgentFeedbackTab} from '../constants'
import {UIActions} from '../types'

describe('changeActiveTab', () => {
    it('should create an action to change the active tab', () => {
        const tab: TicketAIAgentFeedbackTab = TicketAIAgentFeedbackTab.AIAgent
        const expectedAction = {
            type: UIActions.ChangeActiveTab,
            payload: tab,
        }
        expect(changeActiveTab(tab)).toEqual(expectedAction)
    })
})
