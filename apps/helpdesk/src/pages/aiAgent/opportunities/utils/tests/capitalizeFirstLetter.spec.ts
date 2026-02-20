import { capitalizeFirstLetter } from '../capitalizeFirstLetter'

describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a lowercase string', () => {
        expect(capitalizeFirstLetter('hello world')).toBe('Hello world')
    })

    it('should return empty string for empty input', () => {
        expect(capitalizeFirstLetter('')).toBe('')
    })

    it('should handle sentence-like strings', () => {
        expect(capitalizeFirstLetter('how do I access my account?')).toBe(
            'How do I access my account?',
        )
    })

    it('should handle strings with unicode characters', () => {
        expect(capitalizeFirstLetter('über test')).toBe('Über test')
        expect(capitalizeFirstLetter('école française')).toBe('École française')
    })
})
