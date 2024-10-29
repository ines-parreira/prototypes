import {computeTextSimilarityScore} from '../computeTextSimilarityScore'

describe('computeTextSimilarityScore', () => {
    it('should return 0 for identical strings', () => {
        expect(computeTextSimilarityScore('test', 'test')).toBe(0)
    })

    it('should return 1 for completely different strings', () => {
        expect(computeTextSimilarityScore('abc', 'xyz')).toBe(1)
    })

    it('should return a value between 0 and 1 for partially matching strings', () => {
        expect(computeTextSimilarityScore('kitten', 'sitting')).toBeCloseTo(
            3 / 7,
            5
        )
    })

    it('should handle empty strings correctly', () => {
        expect(computeTextSimilarityScore('', '')).toBe(0)
        expect(computeTextSimilarityScore('abc', '')).toBe(1)
        expect(computeTextSimilarityScore('', 'abc')).toBe(1)
    })

    it('should handle strings with different lengths', () => {
        expect(computeTextSimilarityScore('a', 'ab')).toBe(1 / 2)
        expect(computeTextSimilarityScore('abc', 'a')).toBe(2 / 3)
    })

    it('should handle strings with special characters', () => {
        expect(computeTextSimilarityScore('hello!', 'hello')).toBe(1 / 6)
        expect(computeTextSimilarityScore('hello', 'hello!')).toBe(1 / 6)
    })

    it('should handle wrong input', () => {
        // @ts-ignore-next-line Wrong input on purpose
        expect(computeTextSimilarityScore(NaN, 'hello')).toBe(1)
    })
})
