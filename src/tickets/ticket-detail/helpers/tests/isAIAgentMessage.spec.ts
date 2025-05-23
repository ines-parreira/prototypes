import type { TicketMessage } from '@gorgias/helpdesk-types'

import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'

import { isAIAgentMessage } from '../isAIAgentMessage'

jest.mock('state/agents/constants', () => ({
    AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS: ['a-eye-agent@gorgias.com'],
}))

describe('isAIAgentMessage', () => {
    it('should return false if there is no sender email', () => {
        const msg = { sender: {} } as TicketMessage
        const result = isAIAgentMessage(msg)
        expect(result).toBe(false)
    })

    it('should return false if the sender email is not an AI Agent one', () => {
        const msg = {
            sender: { email: 'john.doe@example.com' },
        } as TicketMessage
        const result = isAIAgentMessage(msg)
        expect(result).toBe(false)
    })

    it('should return true if the sender email is an AI Agent one', () => {
        const msg = {
            sender: { email: AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS[0] },
        } as TicketMessage
        const result = isAIAgentMessage(msg)
        expect(result).toBe(true)
    })
})
