import { calculateRate, infinityNanToZero } from '../utils'

describe('infinityNanToZero', () => {
    it('should return 0 when value is Infinity', () => {
        expect(infinityNanToZero(Infinity)).toBe(0)
    })

    it('should return 0 when value is NaN', () => {
        expect(infinityNanToZero(NaN)).toBe(0)
    })
})

describe('calculateRate', () => {
    it('should return 0 when numerator is null', () => {
        expect(calculateRate(null, 10)).toBe(0)
    })
    it('should return 0 when denominator is null', () => {
        expect(calculateRate(10, null)).toBe(0)
    })
})
