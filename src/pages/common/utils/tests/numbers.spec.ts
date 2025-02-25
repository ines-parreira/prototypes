import { formatPercentage } from '../numbers'

describe('formatPercentage', () => {
    it('should format a number as a percentage', () => {
        expect(formatPercentage(50)).toBe('50%')
        expect(formatPercentage(0.251)).toBe('0.25%')
        expect(formatPercentage(75.2)).toBe('75.2%')
    })

    it('should format a number as a percentage with a custom maximumFractionDigits', () => {
        expect(formatPercentage(50, { maximumFractionDigits: 0 })).toBe('50%')
        expect(formatPercentage(0.251, { maximumFractionDigits: 0 })).toBe('0%')
        expect(formatPercentage(75.2, { maximumFractionDigits: 0 })).toBe('75%')
    })
})
