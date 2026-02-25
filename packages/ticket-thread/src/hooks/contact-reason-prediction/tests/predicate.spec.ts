import {
    getContactReasonSuggestionCount,
    isContactReasonSuggestion,
} from '../predicate'

describe('contact reason suggestion predicate', () => {
    it('counts every field with prediction.display = true', () => {
        const customFields = {
            a: { prediction: { display: true } },
            b: { prediction: { display: false } },
            c: { prediction: { display: true } },
        }

        expect(getContactReasonSuggestionCount(customFields)).toBe(2)
        expect(isContactReasonSuggestion(customFields)).toBe(true)
    })

    it('returns zero for invalid custom field payloads', () => {
        expect(getContactReasonSuggestionCount(null)).toBe(0)
        expect(isContactReasonSuggestion(null)).toBe(false)
    })
})
