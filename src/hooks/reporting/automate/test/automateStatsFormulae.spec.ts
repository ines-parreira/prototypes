import {
    automationRate,
    decreaseInFirstResponseTime,
    resolutionTime,
    decreaseInResolutionTime,
} from '../automateStatsFormulae'

describe('Metrics Calculation Functions', () => {
    describe('automationRate Function', () => {
        it('should return 0 if any parameter is null', () => {
            expect(automationRate(null, 10, 5)).toBe(0)
            expect(automationRate(10, null, 5)).toBe(0)
            expect(automationRate(10, 20, null)).toBe(0)
        })

        it('should return 0 if all parameters are null', () => {
            expect(automationRate(null, null, null)).toBe(0)
        })

        it('should calculate automation rate correctly', () => {
            expect(automationRate(9, 5, 2)).toBeCloseTo(0.75, 3)
        })

        it('should return 0 not NaN if all parameters are 0', () => {
            expect(automationRate(0, 0, 0)).toBe(0)
        })
        it('should return 0 not Infinity if all parameters are 1 ,0 1', () => {
            expect(automationRate(1, 0, 1)).toBe(1)
        })
    })

    describe('decreaseInFirstResponseTime Function', () => {
        it('should return 0 if any parameter is null', () => {
            expect(decreaseInFirstResponseTime(null, 10, 5)).toBe(0)
            expect(decreaseInFirstResponseTime(10, null, 5)).toBe(0)
            expect(decreaseInFirstResponseTime(10, 20, null)).toBe(0)
        })

        it('should return 0 if all parameters are null', () => {
            expect(decreaseInFirstResponseTime(null, null, null)).toBe(0)
        })

        it('should calculate decrease in first response time correctly', () => {
            expect(decreaseInFirstResponseTime(10, 5, 200)).toBeCloseTo(
                39.25,
                3
            )
            expect(decreaseInFirstResponseTime(0, 2, 5)).toBe(2.5)
            expect(decreaseInFirstResponseTime(0, 0, 0)).toBeCloseTo(0)
        })
    })

    describe('resolutionTime Function', () => {
        it('should return 0 if any parameter is null', () => {
            expect(resolutionTime(null, 10, 5)).toBe(0)
            expect(resolutionTime(10, null, 5)).toBe(0)
            expect(resolutionTime(10, 20, null)).toBe(0)
        })

        it('should return 0 if all parameters are null', () => {
            expect(resolutionTime(null, null, null)).toBe(0)
        })

        it('should calculate resolution time correctly', () => {
            expect(resolutionTime(100, 5, 50)).toBeCloseTo(1.818, 3)
            expect(resolutionTime(100, 5, 0)).toBeCloseTo(20)
            expect(decreaseInResolutionTime(0, 0, 0)).toBeCloseTo(0)
            expect(decreaseInResolutionTime(1, 0, 0)).toBeCloseTo(0)
        })
    })

    describe('decreaseInResolutionTime Function', () => {
        it('should return 0 if any parameter is null', () => {
            expect(decreaseInResolutionTime(null, 10, 5)).toBe(0)
            expect(decreaseInResolutionTime(10, null, 5)).toBe(0)
            expect(decreaseInResolutionTime(10, 20, null)).toBe(0)
        })

        it('should return 0 if all parameters are null', () => {
            expect(decreaseInResolutionTime(null, null, null)).toBe(0)
        })

        it('should calculate decrease in resolution time correctly', () => {
            expect(decreaseInResolutionTime(10, 5, 500)).toBeCloseTo(66.6666, 3)
            expect(decreaseInResolutionTime(0, 5, 500)).toBeCloseTo(0)
            expect(decreaseInResolutionTime(0, 0, 0)).toBeCloseTo(0)
        })
    })
})
