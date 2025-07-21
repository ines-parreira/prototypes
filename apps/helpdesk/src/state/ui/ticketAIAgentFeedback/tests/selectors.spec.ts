import { StoreState } from 'state/types'

import { TicketAIAgentFeedbackTab } from '../constants'
import { getActiveTab, getSelectedAIMessage } from '../selectors'

describe('getActiveTab', () => {
    it('should return the active tab from the ticketAIAgentFeedback state', () => {
        const state: Partial<StoreState> = {
            ui: {
                ticketAIAgentFeedback: {
                    feedback: {
                        activeTab: TicketAIAgentFeedbackTab.AIAgent,
                    },
                },
            } as any,
        }

        expect(getActiveTab(state as StoreState)).toEqual(
            TicketAIAgentFeedbackTab.AIAgent,
        )
    })

    it('should return the selected AI message from the ticketAIAgentFeedback state', () => {
        const state: Partial<StoreState> = {
            ui: {
                ticketAIAgentFeedback: {
                    feedback: {
                        message: {
                            id: '1',
                        },
                    },
                },
            } as any,
        }

        expect(getSelectedAIMessage(state as StoreState)).toEqual({
            id: '1',
        })
    })
})
