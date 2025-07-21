import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'

import type { TicketElement } from '../../types'
import { aiMessageTransformer } from '../aiMessageTransformer'

describe('aiMessageTransformer', () => {
    it('should not transform non-message elements', () => {
        const elements = [{ type: 'event' }] as TicketElement[]

        const result = aiMessageTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not transform non-AI agent messages', () => {
        const elements = [
            { type: 'message', data: { sender: {} } },
        ] as TicketElement[]

        const result = aiMessageTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should transform AI agent messages', () => {
        const elements = [
            {
                type: 'message',
                data: {
                    sender: {
                        email: AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS[0],
                    },
                },
            },
        ] as TicketElement[]

        const result = aiMessageTransformer(elements)
        expect(result).toEqual([
            {
                type: 'message',
                data: elements[0].data,
                flags: ['ai'],
            },
        ])
    })
})
