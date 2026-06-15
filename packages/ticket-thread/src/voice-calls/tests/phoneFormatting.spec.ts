import { formatPhoneNumberInternational } from '../models/phoneFormatting'

describe('formatPhoneNumberInternational', () => {
    it('formats a valid US number in international format', () => {
        expect(formatPhoneNumberInternational('+12025551234')).toBe(
            '+1 202 555 1234',
        )
    })

    it('formats a valid French number', () => {
        expect(formatPhoneNumberInternational('+33612345678')).toBe(
            '+33 6 12 34 56 78',
        )
    })

    it('returns empty string for undefined', () => {
        expect(formatPhoneNumberInternational(undefined)).toBe('')
    })

    it('returns empty string for empty string', () => {
        expect(formatPhoneNumberInternational('')).toBe('')
    })

    it('returns the original string for an unparseable value', () => {
        expect(formatPhoneNumberInternational('not-a-phone')).toBe(
            'not-a-phone',
        )
    })
})
