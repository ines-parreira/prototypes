import {StoreState} from 'state/types'
import {getActiveTab} from '../selectors'
import {TicketAIAgentFeedbackTab} from '../constants'

describe('getActiveTab', () => {
    it('should return the active tab from the ticketAIAgentFeedback state', () => {
        const state: Partial<StoreState> = {
            ui: {
                ticketAIAgentFeedback: {
                    activeTab: TicketAIAgentFeedbackTab.AIAgent,
                },
            } as any,
        }

        expect(getActiveTab(state as StoreState)).toEqual(
            TicketAIAgentFeedbackTab.AIAgent
        )
    })
})
