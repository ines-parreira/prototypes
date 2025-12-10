import { describe, expect, it } from 'vitest'

import { toNumberOrUndefined } from '../toNumberOrUndefined'

describe('toNumberOrUndefined', () => {
    it.each([
        { value: null, description: 'null' },
        { value: undefined, description: 'undefined' },
    ])('should return undefined for $description', ({ value }) => {
        expect(toNumberOrUndefined(value)).toBeUndefined()
    })

    it.each([
        { value: 0, expected: 0 },
        { value: 42, expected: 42 },
    ])('should return $expected for number $value', ({ value, expected }) => {
        expect(toNumberOrUndefined(value)).toBe(expected)
    })

    it.each([
        { value: '0', expected: 0 },
        { value: '42', expected: 42 },
    ])('should convert string $value to $expected', ({ value, expected }) => {
        expect(toNumberOrUndefined(value)).toBe(expected)
    })
})
