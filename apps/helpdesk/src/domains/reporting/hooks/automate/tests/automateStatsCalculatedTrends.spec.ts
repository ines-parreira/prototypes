import {
    getAIAgentAutomationRateTrend,
    getAIAgentAutomationRateUnfilteredDenominatorTrend,
} from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'

describe('automateStatsCalculatedTrends', () => {
    describe('getAIAgentAutomationRateTrend', () => {
        it('should calculate automation rate correctly', () => {
            const aiAgentAutomatedInteractions = {
                value: 50,
                prevValue: 40,
            }
            const billableTicketsExcludingAIAgent = {
                value: 100,
                prevValue: 80,
            }

            const result = getAIAgentAutomationRateTrend(
                false,
                false,
                aiAgentAutomatedInteractions,
                billableTicketsExcludingAIAgent,
            )

            expect(result).toEqual({
                isFetching: false,
                isError: false,
                data: {
                    value: 0.3333333333333333, // 50 / (50 + 100 - 0)
                    prevValue: 0.3333333333333333, // 40 / (40 + 80 - 0)
                },
            })
        })

        it('should handle null values', () => {
            const aiAgentAutomatedInteractions = {
                value: null,
                prevValue: null,
            }
            const billableTicketsExcludingAIAgent = {
                value: null,
                prevValue: null,
            }

            const result = getAIAgentAutomationRateTrend(
                false,
                false,
                aiAgentAutomatedInteractions,
                billableTicketsExcludingAIAgent,
            )

            expect(result).toEqual({
                isFetching: false,
                isError: false,
                data: {
                    value: 0,
                    prevValue: 0,
                },
            })
        })

        it('should handle zero denominator', () => {
            const aiAgentAutomatedInteractions = {
                value: 50,
                prevValue: 40,
            }
            const billableTicketsExcludingAIAgent = {
                value: 0,
                prevValue: 0,
            }

            const result = getAIAgentAutomationRateTrend(
                false,
                false,
                aiAgentAutomatedInteractions,
                billableTicketsExcludingAIAgent,
            )

            expect(result).toEqual({
                isFetching: false,
                isError: false,
                data: {
                    value: 1, // When denominator is 0 but numerator > 0, return 1
                    prevValue: 1,
                },
            })
        })

        it('should pass through loading and error states', () => {
            const aiAgentAutomatedInteractions = {
                value: 50,
                prevValue: 40,
            }
            const billableTicketsExcludingAIAgent = {
                value: 100,
                prevValue: 80,
            }

            const result = getAIAgentAutomationRateTrend(
                true,
                true,
                aiAgentAutomatedInteractions,
                billableTicketsExcludingAIAgent,
            )

            expect(result.isFetching).toBe(true)
            expect(result.isError).toBe(true)
        })
    })

    describe('getAIAgentAutomationRateUnfilteredDenominatorTrend', () => {
        it('should calculate unfiltered automation rate correctly', () => {
            const params = {
                isFetching: false,
                isError: false,
                aiAgentAutomatedInteractions: {
                    value: 30,
                    prevValue: 25,
                },
                allAutomatedInteractions: {
                    value: 100,
                    prevValue: 80,
                },
                allAutomatedInteractionsByAutoResponders: {
                    value: 20,
                    prevValue: 15,
                },
                billableTicketsCount: {
                    value: 200,
                    prevValue: 150,
                },
            }

            const result =
                getAIAgentAutomationRateUnfilteredDenominatorTrend(params)

            expect(result).toEqual({
                isFetching: false,
                isError: false,
                data: {
                    value: expect.any(Number),
                    prevValue: expect.any(Number),
                },
            })
        })

        it('should handle null values', () => {
            const params = {
                isFetching: false,
                isError: false,
                aiAgentAutomatedInteractions: {
                    value: null,
                    prevValue: null,
                },
                allAutomatedInteractions: {
                    value: null,
                    prevValue: null,
                },
                allAutomatedInteractionsByAutoResponders: {
                    value: null,
                    prevValue: null,
                },
                billableTicketsCount: {
                    value: null,
                    prevValue: null,
                },
            }

            const result =
                getAIAgentAutomationRateUnfilteredDenominatorTrend(params)

            expect(result).toEqual({
                isFetching: false,
                isError: false,
                data: {
                    value: 0,
                    prevValue: 0,
                },
            })
        })

        it('should pass through loading and error states', () => {
            const params = {
                isFetching: true,
                isError: true,
                aiAgentAutomatedInteractions: {
                    value: 30,
                    prevValue: 25,
                },
                allAutomatedInteractions: {
                    value: 100,
                    prevValue: 80,
                },
                allAutomatedInteractionsByAutoResponders: {
                    value: 20,
                    prevValue: 15,
                },
                billableTicketsCount: {
                    value: 200,
                    prevValue: 150,
                },
            }

            const result =
                getAIAgentAutomationRateUnfilteredDenominatorTrend(params)

            expect(result.isFetching).toBe(true)
            expect(result.isError).toBe(true)
        })
    })
})
