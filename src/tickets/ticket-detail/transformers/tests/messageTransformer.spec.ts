import type { TicketElement } from '../../types'
import { messageTransformer } from '../messageTransformer'

describe('messageTransformer', () => {
    it('should filter out any messages that are hidden', () => {
        const elements = [
            { type: 'event' },
            { type: 'message', data: { meta: {} } },
            { type: 'message', data: { meta: { hidden: true } } },
        ] as TicketElement[]

        const result = messageTransformer(elements)
        expect(result).toEqual([
            { type: 'event' },
            { type: 'message', data: { meta: {} } },
        ])
    })
})
