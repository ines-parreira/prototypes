import { PHONE_EVENTS } from 'constants/event'

import type { TicketElement } from '../../types'
import { eventTransformer } from '../eventTransformer'

describe('eventTransformer', () => {
    it('should not filter out non-event elements', () => {
        const elements = [{ type: 'message' }] as TicketElement[]

        const result = eventTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not filter out phone events', () => {
        const elements = [
            { type: 'event', data: { type: PHONE_EVENTS[0] } },
        ] as TicketElement[]

        const result = eventTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should filter out events that are not phone events', () => {
        const elements = [
            { type: 'event', data: { type: 'unknown' } },
        ] as TicketElement[]

        const result = eventTransformer(elements)
        expect(result).toEqual([])
    })
})
