import {
    automationRate,
    decreaseInFirstResponseTime,
    averageResolutionTimeWithAutomation,
    decreaseInResolutionTime,
    workflowEndStepDropoff,
    workflowEndStepAutomatedInteractions,
    calculateRate,
    calculateSumOfAutomatedInteractions,
    calculateSumOfDropoff,
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
            expect(decreaseInFirstResponseTime(null, 10, 5, 5)).toBe(0)
            expect(decreaseInFirstResponseTime(10, null, 5, 5)).toBe(0)
            expect(decreaseInFirstResponseTime(10, 20, null, 5)).toBe(0)
            expect(decreaseInFirstResponseTime(10, 20, 5, null)).toBe(0)
        })

        it('should return 0 if all parameters are null', () => {
            expect(decreaseInFirstResponseTime(null, null, null, null)).toBe(0)
        })

        it('should calculate decrease in first response time correctly', () => {
            expect(decreaseInFirstResponseTime(10, 5, 200, 200)).toBeCloseTo(
                26.666,
                2
            )
            expect(decreaseInFirstResponseTime(0, 2, 5, 5)).toBe(0)
            expect(decreaseInFirstResponseTime(0, 0, 0, 0)).toBeCloseTo(0)
        })

        it('caps decrease in first response time to 0 if it is negative', () => {
            expect(decreaseInFirstResponseTime(10, 10, 10, 1000)).toEqual(0)
        })
    })

    describe('resolutionTime Function', () => {
        it('should calculate resolution time correctly', () => {
            expect(
                averageResolutionTimeWithAutomation(100, 5, 50, 0)
            ).toBeCloseTo(1.818, 3)
            expect(
                averageResolutionTimeWithAutomation(100, 5, 0, 0)
            ).toBeCloseTo(20)
        })
    })

    describe('decreaseInResolutionTime Function', () => {
        it('should return 0 if any parameter is null', () => {
            expect(decreaseInResolutionTime(null, 10, 5, 5)).toBe(0)
            expect(decreaseInResolutionTime(10, null, 5, 5)).toBe(0)
            expect(decreaseInResolutionTime(10, 20, null, 5)).toBe(0)
        })

        it('should return 0 if all parameters are null', () => {
            expect(decreaseInResolutionTime(null, null, null, null)).toBe(0)
        })

        it('should calculate decrease in resolution time correctly', () => {
            expect(decreaseInResolutionTime(10, 5, 500, 0)).toBeCloseTo(
                66.6666,
                3
            )
            expect(decreaseInResolutionTime(0, 5, 500, 0)).toBeCloseTo(0)
            expect(decreaseInResolutionTime(0, 0, 0, 0)).toBeCloseTo(0)
        })

        it('calculates decrease in resolution time correctly when totalResolutionTimeResolvedByAIAgent is 0', () => {
            expect(decreaseInResolutionTime(10, 5, 500, null)).toBeCloseTo(
                66.6666,
                3
            )
        })

        it('caps decrease in resolution time to 0 if it is negative', () => {
            expect(decreaseInResolutionTime(10, 10, 10, 1000)).toEqual(0)
        })
    })

    describe('worflow Functions', () => {
        it('calculateRate should correctly calculate step view rate', () => {
            expect(calculateRate(800, 1000)).toBeCloseTo(0.8, 1)
            expect(calculateRate(250, 500)).toBeCloseTo(0.5, 1)
        })

        it('calculateRate should return 0 if any parameter is null', () => {
            expect(calculateRate(10, null)).toBe(0)
            expect(calculateRate(null, 10)).toBe(0)
        })

        it('workflowEndStepDropoff should correctly calculate end step dropoff', () => {
            expect(workflowEndStepDropoff(0, 100, 50)).toBe(50)
            expect(workflowEndStepDropoff(0, 75, 25)).toBe(50)
        })

        it('workflowEndStepDropoff should return 0 if any parameter is null', () => {
            expect(workflowEndStepDropoff(0, null, 10)).toBe(0)
            expect(workflowEndStepDropoff(0, 10, null)).toBe(0)
        })

        it('workflowEndStepAutomatedInteractions should correctly calculate end step automated interactions', () => {
            expect(workflowEndStepAutomatedInteractions(150, 25)).toBe(125)
            expect(workflowEndStepAutomatedInteractions(120, 30)).toBe(90)
        })

        it('workflowEndStepAutomatedInteractions should return 0 if any parameter is null', () => {
            expect(workflowEndStepAutomatedInteractions(null, 5)).toBe(0)
            expect(workflowEndStepAutomatedInteractions(10, null)).toBe(0)
        })

        it('should calculate sum of dropoff', () => {
            expect(
                calculateSumOfDropoff({
                    '1': {dropoff: 2} as any,
                    '2': {dropoff: 6} as any,
                    '3': {dropoff: 2} as any,
                    '4': {dropoff: undefined} as any,
                    '5': {dropoff: null} as any,
                    '6': {} as any,
                })
            ).toBe(10)
        })

        it('should calculate sum of automated interactions', () => {
            expect(
                calculateSumOfAutomatedInteractions({
                    '1': {automatedInteractions: 2} as any,
                    '2': {automatedInteractions: 6} as any,
                    '3': {automatedInteractions: 2} as any,
                    '4': {automatedInteractions: undefined} as any,
                    '5': {automatedInteractions: null} as any,
                    '6': {} as any,
                })
            ).toBe(10)
        })
    })
})
