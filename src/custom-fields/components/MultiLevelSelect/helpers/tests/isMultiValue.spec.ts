import {isMultiValue} from '../isMultiValue'

describe('isMultiValue', () => {
    test('should return true for arrays', () => {
        expect(isMultiValue([1, 2, 3])).toBe(true)
    })

    test('should return false for non-array values', () => {
        expect(isMultiValue('string')).toBe(false)
        expect(isMultiValue(123)).toBe(false)
        expect(isMultiValue(true)).toBe(false)
        expect(isMultiValue(undefined)).toBe(false)
    })

    test('should return false for empty arrays', () => {
        expect(isMultiValue([])).toBe(false)
    })
})
