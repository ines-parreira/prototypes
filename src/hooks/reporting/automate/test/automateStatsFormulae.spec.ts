import {
    automationRate,
    decreaseInFirstResponseTime,
    averageResolutionTimeWithAutomation,
    decreaseInResolutionTime,
    workflowAutomatedInteractions,
    workflowDropoff,
    workflowTicketCreated,
    workflowAutomationRate,
    workflowStepViewRate,
    workflowStepDropoffRate,
    workflowEndStepDropoff,
    workflowEndStepDropoffRate,
    workflowEndStepAutomatedInteractions,
    workflowEndSteTicketsCreatedRate,
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
        it('workflowAutomatedInteractions should correctly calculate total interactions', () => {
            expect(workflowAutomatedInteractions(10, 5)).toBe(15)
            expect(workflowAutomatedInteractions(20, 30)).toBe(50)
        })

        it('workflowAutomatedInteractions should return sum even if parameters are 0', () => {
            expect(workflowAutomatedInteractions(0, 0)).toBe(0)
        })

        it('workflowDropoff should correctly calculate dropoff', () => {
            expect(workflowDropoff(100, 50, 25, 10)).toBe(15)
            expect(workflowDropoff(80, 30, 20, 5)).toBe(25)
        })

        it('workflowDropoff should return 0 if any parameter is null', () => {
            expect(workflowDropoff(null, 10, 5, 5)).toBe(0)
            expect(workflowDropoff(10, null, 5, 5)).toBe(0)
            expect(workflowDropoff(10, 20, null, 5)).toBe(0)
            expect(workflowDropoff(10, 20, 5, null)).toBe(0)
        })

        it('workflowTicketCreated should correctly calculate tickets created after handover', () => {
            expect(workflowTicketCreated(50, 20)).toBe(30)
            expect(workflowTicketCreated(40, 10)).toBe(30)
        })

        it('workflowTicketCreated should return 0 if any parameter is null', () => {
            expect(workflowTicketCreated(null, 10)).toBe(0)
            expect(workflowTicketCreated(10, null)).toBe(0)
        })

        it('workflowAutomationRate should correctly calculate automation rate', () => {
            expect(workflowAutomationRate(100, 50, 25)).toBeCloseTo(0.5714, 4)
            expect(workflowAutomationRate(80, 10, 10)).toBeCloseTo(0.8, 1)
        })

        it('workflowAutomationRate should return 0 if any parameter is null', () => {
            expect(workflowAutomationRate(null, 10, 5)).toBe(0)
            expect(workflowAutomationRate(10, null, 5)).toBe(0)
            expect(workflowAutomationRate(10, 20, null)).toBe(0)
        })

        it('workflowStepViewRate should correctly calculate step view rate', () => {
            expect(workflowStepViewRate(1000, 800)).toBeCloseTo(0.8, 1)
            expect(workflowStepViewRate(500, 250)).toBeCloseTo(0.5, 1)
        })

        it('workflowStepViewRate should return 0 if any parameter is null', () => {
            expect(workflowStepViewRate(null, 10)).toBe(0)
            expect(workflowStepViewRate(10, null)).toBe(0)
        })

        it('workflowStepDropoffRate should correctly calculate step dropoff rate', () => {
            expect(workflowStepDropoffRate(800, 200)).toBeCloseTo(0.25, 2)
            expect(workflowStepDropoffRate(600, 150)).toBeCloseTo(0.25, 2)
        })

        it('workflowStepDropoffRate should return 0 if any parameter is null', () => {
            expect(workflowStepDropoffRate(null, 10)).toBe(0)
            expect(workflowStepDropoffRate(10, null)).toBe(0)
        })

        it('workflowEndStepDropoff should correctly calculate end step dropoff', () => {
            expect(workflowEndStepDropoff(100, 50)).toBe(50)
            expect(workflowEndStepDropoff(75, 25)).toBe(50)
        })

        it('workflowEndStepDropoff should return 0 if any parameter is null', () => {
            expect(workflowEndStepDropoff(null, 10)).toBe(0)
            expect(workflowEndStepDropoff(10, null)).toBe(0)
        })

        it('workflowEndStepDropoffRate should correctly calculate end step dropoff rate', () => {
            expect(workflowEndStepDropoffRate(100, 50, 25)).toBeCloseTo(
                0.2857,
                4
            )
            expect(workflowEndStepDropoffRate(80, 20, 10)).toBeCloseTo(0.2, 1)
        })

        it('workflowEndStepDropoffRate should return 0 if any parameter is null', () => {
            expect(workflowEndStepDropoffRate(null, 10, 5)).toBe(0)
            expect(workflowEndStepDropoffRate(10, null, 5)).toBe(0)
            expect(workflowEndStepDropoffRate(10, 20, null)).toBe(0)
        })

        it('workflowEndStepAutomatedInteractions should correctly calculate end step automated interactions', () => {
            expect(workflowEndStepAutomatedInteractions(150, 50, 25)).toBe(75)
            expect(workflowEndStepAutomatedInteractions(120, 20, 30)).toBe(70)
        })

        it('workflowEndStepAutomatedInteractions should return 0 if any parameter is null', () => {
            expect(workflowEndStepAutomatedInteractions(null, 10, 5)).toBe(0)
            expect(workflowEndStepAutomatedInteractions(10, null, 5)).toBe(0)
            expect(workflowEndStepAutomatedInteractions(10, 20, null)).toBe(0)
        })

        it('workflowEndSteTicketsCreatedRate should correctly calculate end step tickets created rate', () => {
            expect(workflowEndSteTicketsCreatedRate(100, 50, 25)).toBeCloseTo(
                0.1429,
                4
            )
            expect(workflowEndSteTicketsCreatedRate(80, 10, 10)).toBeCloseTo(
                0.1,
                1
            )
        })

        it('workflowEndSteTicketsCreatedRate should return 0 if any parameter is null', () => {
            expect(workflowEndSteTicketsCreatedRate(null, 10, 5)).toBe(0)
            expect(workflowEndSteTicketsCreatedRate(10, null, 5)).toBe(0)
            expect(workflowEndSteTicketsCreatedRate(10, 20, null)).toBe(0)
        })
    })
})
