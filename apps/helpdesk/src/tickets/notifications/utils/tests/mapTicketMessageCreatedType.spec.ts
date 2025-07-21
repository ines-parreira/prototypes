import { TicketChannel } from 'business/types/ticket'
import type { Notification } from 'common/notifications'

import type { TicketPayload } from '../../types'
import mapTicketMessageCreatedType from '../mapTicketMessageCreatedType'

describe('mapTicketMessageCreatedType', () => {
    it('should map to a channel-specific type if available', () => {
        const result = mapTicketMessageCreatedType({
            payload: { ticket: { channel: TicketChannel.Aircall } },
        } as Notification<TicketPayload>)
        expect(result).toBe('ticket-message.created.aircall')
    })

    it.each([
        TicketChannel.Chat,
        TicketChannel.FacebookMessenger,
        TicketChannel.InstagramDirectMessage,
        TicketChannel.Sms,
        TicketChannel.WhatsApp,
    ])(
        'should map to ticket-message.created.chat.unassigned if the channel is %s and other conditions are met',
        (channel) => {
            const result = mapTicketMessageCreatedType({
                type: 'ticket-message.created',
                payload: { ticket: { channel, assignee_user_id: null } },
            } as Notification<TicketPayload>)
            expect(result).toBe('ticket-message.created.chat.unassigned')
        },
    )

    it('should not map if the channel does not have a workflow defined', () => {
        const result = mapTicketMessageCreatedType({
            type: 'ticket-message.created',
            payload: { ticket: { channel: 'api' } },
        } as Notification<TicketPayload>)
        expect(result).toBe('ticket-message.created')
    })
})
