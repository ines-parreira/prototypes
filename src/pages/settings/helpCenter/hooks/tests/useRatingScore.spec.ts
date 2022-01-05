import {calculateRatingScore} from '../useRatingScore'

describe('useRating', () => {
    it('should correctly calculate ratings', () => {
        expect(calculateRatingScore({up: 0, down: 0})).toBe(0)
        expect(calculateRatingScore({up: 1, down: 0})).toBe(100)
        expect(calculateRatingScore({up: 8, down: 0})).toBe(100)
        expect(calculateRatingScore({up: 0, down: 1})).toBe(-100)
        expect(calculateRatingScore({up: 0, down: 8})).toBe(-100)
        expect(calculateRatingScore({up: 2, down: 2})).toBe(0)
        expect(calculateRatingScore({up: 3, down: 2})).toBe(20)
        expect(calculateRatingScore({up: 2, down: 3})).toBe(-20)
        expect(calculateRatingScore(undefined)).toBe(0)
    })
})
