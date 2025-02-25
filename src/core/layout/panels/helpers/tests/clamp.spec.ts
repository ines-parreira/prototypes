import clamp from '../clamp'

describe('clamp', () => {
    it('should throw an error if max is smaller than min', () => {
        const shouldThrow = () => {
            clamp(0, 1, -1)
        }

        expect(shouldThrow).toThrow(
            'Maximum value should be larger than the minimum value',
        )
    })

    it('should clamp a number to the given minimum', () => {
        const result = clamp(5, 10, 15)
        expect(result).toBe(10)
    })

    it('should clamp a number to the given maximum', () => {
        const result = clamp(20, 10, 15)
        expect(result).toBe(15)
    })
})
