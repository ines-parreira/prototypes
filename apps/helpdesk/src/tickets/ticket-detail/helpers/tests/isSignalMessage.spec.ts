import type { TicketMessage } from '@gorgias/helpdesk-types'

import { MessageMetadataType } from 'models/ticket/types'

import { isSignalMessage } from '../isSignalMessage'

describe('isSignalMessage', () => {
    it('should return false if the message has no meta information', () => {
        const msg = {} as TicketMessage
        const result = isSignalMessage(msg)
        expect(result).toBe(false)
    })

    it('should return false if the message is not a signal message', () => {
        const msg = { meta: { type: 'unknown' } } as TicketMessage
        const result = isSignalMessage(msg)
        expect(result).toBe(false)
    })

    it('should return true if the message is a signal message', () => {
        const msg = {
            meta: { type: MessageMetadataType.Signal },
        } as TicketMessage
        const result = isSignalMessage(msg)
        expect(result).toBe(true)
    })
})
