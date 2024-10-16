import {isValueInRange} from '../utils'

describe('isValueInRange', () => {
    it('should check if a number is inside the range', () => {
        expect(isValueInRange(5, 0, 10)).toBe(true)
        expect(isValueInRange(-4, -10, 3)).toBe(true)
        expect(isValueInRange(5, 5, 15)).toBe(true)
        expect(isValueInRange(15, 5, 15)).toBe(true)
        expect(isValueInRange(0, 5, 15)).toBe(false)
        expect(isValueInRange(30, 5, 15)).toBe(false)
    })
})
