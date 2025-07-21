import {
    calculateMetricPerHour,
    secondsToHours,
} from 'domains/reporting/hooks/metricCalculations'

describe('metricCalculations', () => {
    describe('secondsToHours', () => {
        it('should convert seconds to hours correctly', () => {
            expect(secondsToHours(3600)).toBe(1)
            expect(secondsToHours(1800)).toBe(0.5)
            expect(secondsToHours(7200)).toBe(2)
            expect(secondsToHours(0)).toBe(0)
        })

        it('should handle decimal seconds', () => {
            expect(secondsToHours(3600.5)).toBe(1.0001388888888888)
            expect(secondsToHours(1800.25)).toBe(0.5000694444444444)
        })
    })

    describe('calculateMetricPerHour', () => {
        it('should calculate metrics per hour correctly', () => {
            expect(calculateMetricPerHour(10, 3600)).toBe(10)

            expect(calculateMetricPerHour(5, 1800)).toBe(10)

            expect(calculateMetricPerHour(20, 7200)).toBe(10)
        })

        it('should return 0 when seconds is 0', () => {
            expect(calculateMetricPerHour(10, 0)).toBe(0)
            expect(calculateMetricPerHour(0, 0)).toBe(0)
        })

        it('should handle decimal values', () => {
            expect(calculateMetricPerHour(5, 2700)).toBe(6.666666666666667)

            expect(calculateMetricPerHour(7.5, 5400)).toBe(5)
        })

        it('should handle edge cases', () => {
            expect(calculateMetricPerHour(1, 1)).toBe(3600)

            expect(calculateMetricPerHour(100, 86400)).toBe(4.166666666666667)
        })
    })
})
