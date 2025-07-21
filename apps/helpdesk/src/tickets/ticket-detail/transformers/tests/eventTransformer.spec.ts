import type { TicketElement } from '../../types'
import { eventTransformer } from '../eventTransformer'

describe('eventTransformer', () => {
    it('should not filter out non-event elements', () => {
        const elements = [{ type: 'message' }] as TicketElement[]

        const result = eventTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should filter out all events', () => {
        const elements = [{ type: 'event' }] as TicketElement[]

        const result = eventTransformer(elements)
        expect(result).toEqual([])
    })
})
