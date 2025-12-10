import { isCustomFieldValueEmpty } from '../isCustomFieldValueEmpty'

describe('isCustomFieldValueEmpty', () => {
    it.each([
        { value: '', expected: true, description: 'empty string' },
        { value: undefined, expected: true, description: 'undefined' },
        { value: ' ', expected: false, description: 'whitespace string' },
        { value: 'a', expected: false, description: 'non-empty string' },
        { value: 0, expected: false, description: 'number 0' },
        { value: 1, expected: false, description: 'number 1' },
    ])('should return $expected for $description', ({ value, expected }) => {
        expect(isCustomFieldValueEmpty(value)).toBe(expected)
    })
})
