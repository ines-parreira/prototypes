import { getMessageViaLabel } from '../MessageHeader/getMessageViaLabel'

describe('getMessageViaLabel', () => {
    it('returns null when channel is null', () => {
        expect(getMessageViaLabel(null)).toBeNull()
    })

    it('returns null when channel is undefined', () => {
        expect(getMessageViaLabel(undefined)).toBeNull()
    })

    it('returns "contact form" for chat-contact-form', () => {
        expect(getMessageViaLabel('chat-contact-form')).toBe('contact form')
    })

    it('returns "offline capture" for chat-offline-capture', () => {
        expect(getMessageViaLabel('chat-offline-capture')).toBe(
            'offline capture',
        )
    })

    it('returns null for other channel types', () => {
        expect(getMessageViaLabel('chat')).toBeNull()
        expect(getMessageViaLabel('email')).toBeNull()
        expect(getMessageViaLabel('api')).toBeNull()
    })
})
