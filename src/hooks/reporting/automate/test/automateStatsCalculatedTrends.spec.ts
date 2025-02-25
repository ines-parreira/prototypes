import {
    getAiAgentCoverageRate,
    getAiAgentSuccessRate,
    getAutomationRateTrend,
    getAutomationRateUnfilteredDenominatorTrend,
    getDecreaseInFirstResponseTimeTrend,
    getDecreaseInResolutionTimeTrend,
} from '../automateStatsCalculatedTrends'

describe('Wrapper Functions for Trends Calculation', () => {
    const interactions = { value: 100, prevValue: 200 }
    const billableTickets = { value: 20, prevValue: 15 }
    const interactionsByAutoResponders = { value: 30, prevValue: 50 }
    const totalFirstResponseTimeExcludingAIAgent = {
        value: 300,
        prevValue: 500,
    }
    const totalFirstResponseTimeIncludingAIAgent = {
        value: 300,
        prevValue: 500,
    }
    const totalResolutionTimeExcludingAIAgent = { value: 5000, prevValue: 4000 }
    const totalResolutionTimeResolvedByAIAgent = { value: 0, prevValue: 0 }
    const aiAgentTicketsAutomatedTickets = { value: 5, prevValue: 1 }
    const aiAgentTickets = { value: 10, prevValue: 5 }
    const allTickets = { value: 20, prevValue: 10 }

    describe('getAutomationRateTrend Function', () => {
        it('should calculate automation rate trend correctly', () => {
            const result = getAutomationRateTrend(
                false,
                false,
                interactions,
                billableTickets,
                interactionsByAutoResponders,
            )
            expect(result.data.value).toBeCloseTo(1.1111, 3)
            expect(result.data.prevValue).toBeCloseTo(1.212121, 3)
        })
        it('should return 0 for both current and previous values when any input value is null', () => {
            const result = getAutomationRateTrend(
                false,
                false,
                { value: null, prevValue: null },
                billableTickets,
                interactionsByAutoResponders,
            )
            expect(result.data.value).toBe(0)
            expect(result.data.prevValue).toBe(0)
        })
    })

    describe('getAutomationRateUnfilteredDenominatorTrend', () => {
        it('calculates automation rate with unfiltered denominator values', () => {
            const result = getAutomationRateUnfilteredDenominatorTrend({
                isFetching: false,
                isError: false,
                filteredAutomatedInteractions: interactions,
                billableTicketsCount: billableTickets,
                allAutomatedInteractions: { value: 50, prevValue: 100 },
                allAutomatedInteractionsByAutoResponders:
                    interactionsByAutoResponders,
            })
            expect(result.data.value).toBeCloseTo(2.5, 3)
            expect(result.data.prevValue).toBeCloseTo(3.08, 2)
        })
    })

    describe('getDecreaseInFirstResponseTimeTrend Function', () => {
        it('should calculate decrease in first response time trend correctly', () => {
            const result = getDecreaseInFirstResponseTimeTrend(
                false,
                false,
                interactions,
                billableTickets,
                totalFirstResponseTimeExcludingAIAgent,
                totalFirstResponseTimeIncludingAIAgent,
            )
            expect(result.data.value).toBeCloseTo(12.5, 1)
            expect(result.data.prevValue).toBeCloseTo(31.0, 1)
        })
        it('should return 0 for both current and previous values when any input value is null', () => {
            const result = getDecreaseInFirstResponseTimeTrend(
                false,
                false,
                { value: null, prevValue: null },
                billableTickets,
                totalFirstResponseTimeExcludingAIAgent,
                totalFirstResponseTimeIncludingAIAgent,
            )
            expect(result.data.value).toBe(0)
            expect(result.data.prevValue).toBe(0)
        })
    })

    describe('getDecreaseInResolutionTimeTrend Function', () => {
        it('should calculate decrease in resolution time trend correctly', () => {
            const result = getDecreaseInResolutionTimeTrend(
                false,
                false,
                interactions,
                billableTickets,
                totalResolutionTimeExcludingAIAgent,
                totalResolutionTimeResolvedByAIAgent,
            )
            expect(result.data.value).toBeCloseTo(208.3333, 1)
            expect(result.data.prevValue).toBeCloseTo(248.062, 1)
        })
        it('should return 0 for both current and previous values when any input value is null', () => {
            const result = getDecreaseInResolutionTimeTrend(
                false,
                false,
                { value: null, prevValue: null },
                billableTickets,
                { value: 100, prevValue: 100 },
                { value: 100, prevValue: 100 },
            )
            expect(result.data.value).toBe(0)
            expect(result.data.prevValue).toBe(0)
        })
    })

    describe('getAiAgentSuccessRate', () => {
        it('calculates success rate for ai agent tickets', () => {
            const result = getAiAgentSuccessRate({
                isFetching: false,
                isError: false,
                aiAgentAutomatedInteractions: aiAgentTicketsAutomatedTickets,
                aiAgentTickets,
            })
            expect(result.data.value).toBeCloseTo(0.5, 2)
            expect(result.data.prevValue).toBeCloseTo(0.2, 2.8)
        })
    })

    describe('getAiAgentCoverageRate', () => {
        it('calculates coverage rate for ai agent tickets', () => {
            const result = getAiAgentCoverageRate({
                isFetching: false,
                isError: false,
                aiAgentTickets,
                allTickets,
            })
            expect(result.data.value).toBeCloseTo(0.5, 2)
            expect(result.data.prevValue).toBeCloseTo(0.5, 2)
        })
    })
})
