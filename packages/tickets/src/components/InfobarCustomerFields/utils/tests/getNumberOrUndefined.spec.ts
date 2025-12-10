import { getNumberOrUndefined } from '../getNumberOrUndefined'

describe('getNumberOrUndefined', () => {
    it.each([
        { value: undefined, description: 'undefined' },
        { value: '', description: 'empty string' },
    ])('should return undefined for $description', ({ value }) => {
        expect(getNumberOrUndefined(value)).toBeUndefined()
    })

    it.each([
        { value: true, description: 'boolean true' },
        { value: false, description: 'boolean false' },
    ])('should return undefined for $description', ({ value }) => {
        expect(getNumberOrUndefined(value)).toBeUndefined()
    })

    it.each([
        { value: 1, expected: 1 },
        { value: 0, expected: 0 },
        { value: '1', expected: 1 },
        { value: 'ah', expected: NaN },
    ])('should return $expected for $value', ({ value, expected }) => {
        expect(getNumberOrUndefined(value)).toBe(expected)
    })
})
