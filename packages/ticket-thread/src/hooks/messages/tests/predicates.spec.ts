import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { isActivePendingMessage, isFailedPendingMessage } from '../predicates'

function createMessage(overrides: Partial<TicketMessage>): TicketMessage {
    return {
        id: 1,
        channel: 'chat',
        from_agent: false,
        via: 'chat',
        created_datetime: '2024-03-21T11:00:00Z',
        sender: {
            id: 10,
            email: 'customer@gorgias.com',
            name: 'Customer',
        },
        public: true,
        body_html: '<p>hello</p>',
        body_text: 'hello',
        source: { type: 'chat' },
        meta: null,
        ...overrides,
    } as TicketMessage
}

describe('pending message predicates', () => {
    it('classifies failed pending messages as failed and not active', () => {
        const pendingMessage = createMessage({
            failed_datetime: '2024-03-21T11:05:00Z',
        } as TicketMessage)

        expect(isFailedPendingMessage(pendingMessage)).toBe(true)
        expect(isActivePendingMessage(pendingMessage)).toBe(false)
    })

    it('classifies non-failed pending messages as active', () => {
        const pendingMessage = createMessage({
            failed_datetime: null,
        } as TicketMessage)

        expect(isFailedPendingMessage(pendingMessage)).toBe(false)
        expect(isActivePendingMessage(pendingMessage)).toBe(true)
    })
})
