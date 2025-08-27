import { isTimedeltaOperator } from '../types'

describe('isTimedeltaOperator function', () => {
    it('should return true for valid timedelta operators', () => {
        expect(isTimedeltaOperator('gteTimedelta')).toBe(true)
        expect(isTimedeltaOperator('lteTimedelta')).toBe(true)
    })

    it('should return false for invalid operators', () => {
        expect(isTimedeltaOperator('eq')).toBe(false)
        expect(isTimedeltaOperator('papapap')).toBe(false)
    })
})
