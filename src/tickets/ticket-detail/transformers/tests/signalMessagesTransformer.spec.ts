import { MessageMetadataType } from 'models/ticket/types'

import type { TicketElement } from '../../types'
import { signalMessagesTransformer } from '../signalMessagesTransformer'

describe('signalMessagesTransformer', () => {
    it('should not filter non-message elements', () => {
        const elements = [{ type: 'event' }] as TicketElement[]

        const result = signalMessagesTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not filter non-signal messages', () => {
        const elements = [{ type: 'message', data: {} }] as TicketElement[]

        const result = signalMessagesTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should filter out signal messages', () => {
        const elements = [
            {
                type: 'message',
                data: { meta: { type: MessageMetadataType.Signal } },
            },
        ] as TicketElement[]

        const result = signalMessagesTransformer(elements)
        expect(result).toEqual([])
    })
})
