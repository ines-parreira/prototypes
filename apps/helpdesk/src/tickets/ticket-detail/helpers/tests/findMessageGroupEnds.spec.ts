import type { TicketElement } from '../../types'
import { findMessageGroupEnds } from '../findMessageGroupEnds'

describe('findMessageGroupEnds', () => {
    it('should return no ends if there are no ticket messages', () => {
        const elements = [{ type: 'event' }] as TicketElement[]
        const ends = findMessageGroupEnds(elements)
        expect(ends).toEqual([])
    })

    it('should returns ends for single messages', () => {
        const elements = [
            { type: 'event' },
            { type: 'message' },
            { type: 'event' },
            { type: 'message' },
            { type: 'event' },
            { type: 'message' },
        ] as TicketElement[]
        const ends = findMessageGroupEnds(elements)
        expect(ends).toEqual([1, 3, 5])
    })

    it('should return ends for grouped messages', () => {
        const elements = [
            { type: 'message' },
            { type: 'message', flags: ['minimal'] },
            { type: 'message', flags: ['minimal'] },
            { type: 'event' },
            { type: 'message' },
            { type: 'message', flags: ['minimal'] },
            { type: 'message' },
        ] as TicketElement[]
        const ends = findMessageGroupEnds(elements)
        expect(ends).toEqual([2, 5, 6])
    })
})
