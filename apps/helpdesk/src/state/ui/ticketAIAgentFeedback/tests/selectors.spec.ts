import type { StoreState } from 'state/types'

import { getSelectedAIMessage } from '../selectors'

describe('selectors', () => {
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
