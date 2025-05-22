import { PHONE_EVENTS } from 'constants/event'

import type { TicketElement } from '../../types'
import { phoneEventTransformer } from '../phoneEventTransformer'

describe('phoneEventTransformer', () => {
    it('should not transform non-event elements', () => {
        const elements = [{ type: 'message' }] as TicketElement[]

        const result = phoneEventTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not transform non-phone events', () => {
        const elements = [
            { type: 'event', data: { type: 'unknown' } },
        ] as TicketElement[]

        const result = phoneEventTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should transform phone events', () => {
        const elements = [
            { type: 'event', data: { type: PHONE_EVENTS[0] } },
        ] as TicketElement[]

        const result = phoneEventTransformer(elements)
        expect(result).toEqual([
            { type: 'phone-event', data: elements[0].data },
        ])
    })
})
