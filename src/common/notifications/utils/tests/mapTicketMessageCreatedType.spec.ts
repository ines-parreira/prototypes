import {TicketChannel} from 'business/types/ticket'

import type {Notification} from '../../types'
import mapTicketMessageCreatedType from '../mapTicketMessageCreatedType'

describe('mapTicketMessageCreatedType', () => {
    it('should map to a channel-specific type if available', () => {
        const result = mapTicketMessageCreatedType({
            payload: {ticket: {channel: TicketChannel.Aircall}},
        } as Notification)
        expect(result).toBe('ticket-message.created.aircall')
    })

    it('should not map if the channel does not have a workflow defined', () => {
        const result = mapTicketMessageCreatedType({
            type: 'ticket-message.created',
            payload: {ticket: {channel: 'api'}},
        } as Notification)
        expect(result).toBe('ticket-message.created')
    })
})
