import type { Event } from '@gorgias/helpdesk-types'

import { PHONE_EVENTS } from 'constants/event'

import { isPhoneEvent } from '../isPhoneEvent'

jest.mock('constants/event', () => ({
    PHONE_EVENTS: ['call-ringing'],
}))

describe('isPhoneEvent', () => {
    it('should return false if there is no event type', () => {
        const e = {} as Event
        const result = isPhoneEvent(e)
        expect(result).toBe(false)
    })

    it('should return false if the event is not a phone event', () => {
        const e = { type: 'unknown' } as Event
        const result = isPhoneEvent(e)
        expect(result).toBe(false)
    })

    it('should return true if the event is a phone event', () => {
        const e = { type: PHONE_EVENTS[0] } as Event
        const result = isPhoneEvent(e)
        expect(result).toBe(true)
    })
})
