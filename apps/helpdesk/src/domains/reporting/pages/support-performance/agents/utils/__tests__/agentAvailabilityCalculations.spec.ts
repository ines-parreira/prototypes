import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants'
import {
    calculateAverage,
    calculateTotal,
} from 'domains/reporting/pages/support-performance/agents/utils/agentAvailabilityCalculations'
import type { StatusBreakdown } from 'domains/reporting/pages/support-performance/agents/utils/transformAvailabilityData'

type AgentAvailabilityData = {
    id: number
    name: string
    [key: string]: number | string | StatusBreakdown | undefined
}

const {
    AGENT_NAME_COLUMN,
    ONLINE_TIME_COLUMN,
    AVAILABLE_STATUS_COLUMN,
    UNAVAILABLE_STATUS_COLUMN,
} = AGENT_AVAILABILITY_COLUMNS
describe('agentAvailabilityCalculations', () => {
    const mockAgents: AgentAvailabilityData[] = [
        {
            id: 1,
            name: 'Alice',
            agent_online_time: 3600, // 1 hour in seconds
            agent_status_available: { total: 1800, online: 1200, offline: 600 },
        },
        {
            id: 2,
            name: 'Bob',
            agent_online_time: 7200, // 2 hours in seconds
            agent_status_available: {
                total: 3600,
                online: 2400,
                offline: 1200,
            },
        },
        {
            id: 3,
            name: 'Charlie',
            agent_online_time: 5400, // 1.5 hours in seconds
            agent_status_available: { total: 2700, online: 1800, offline: 900 },
        },
    ]

    describe('calculateTotal', () => {
        describe('with valid numeric data', () => {
            it('should calculate total for online time across multiple agents', () => {
                // 3600 + 7200 + 5400 = 16200
                const result = calculateTotal(mockAgents, ONLINE_TIME_COLUMN)
                expect(result).toBe(16200)
            })

            it('should calculate total for Available column using online time only', () => {
                // Uses online values: 1200 + 2400 + 1800 = 5400
                const result = calculateTotal(
                    mockAgents,
                    AVAILABLE_STATUS_COLUMN,
                )
                expect(result).toBe(5400)
            })

            it('should calculate total for non-Available status columns using total time', () => {
                const agentsWithUnavailable: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_status_unavailable: {
                            total: 1000,
                            online: 600,
                            offline: 400,
                        },
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_status_unavailable: {
                            total: 2000,
                            online: 1200,
                            offline: 800,
                        },
                    },
                ]
                // Uses total values: 1000 + 2000 = 3000
                const result = calculateTotal(
                    agentsWithUnavailable,
                    UNAVAILABLE_STATUS_COLUMN,
                )
                expect(result).toBe(3000)
            })

            it('should calculate total for custom status columns', () => {
                const agentsWithCustomStatus = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_status_custom_break: 600,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_status_custom_break: 900,
                    },
                ]

                const result = calculateTotal(
                    agentsWithCustomStatus,
                    'agent_status_custom_break',
                )
                expect(result).toBe(1500)
            })
        })

        describe('with agent_name column', () => {
            it('should return 0 for agent_name column', () => {
                const result = calculateTotal(mockAgents, AGENT_NAME_COLUMN)
                expect(result).toBe(0)
            })
        })

        describe('with missing column data (undefined values)', () => {
            it('should skip undefined values in calculation', () => {
                const agentsWithMissingData: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 3600,
                        // agent_status_available is missing
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_online_time: 7200,
                        agent_status_available: {
                            total: 3600,
                            online: 2400,
                            offline: 1200,
                        },
                    },
                    {
                        id: 3,
                        name: 'Charlie',
                        // agent_online_time is missing
                        agent_status_available: {
                            total: 2700,
                            online: 1800,
                            offline: 900,
                        },
                    },
                ]

                const onlineTimeTotal = calculateTotal(
                    agentsWithMissingData,
                    ONLINE_TIME_COLUMN,
                )
                // 3600 + 7200 + 0 (undefined treated as 0) = 10800
                expect(onlineTimeTotal).toBe(10800)

                const availableTotal = calculateTotal(
                    agentsWithMissingData,
                    AVAILABLE_STATUS_COLUMN,
                )
                // Uses online values: 0 (undefined) + 2400 + 1800 = 4200
                expect(availableTotal).toBe(4200)
            })

            it('should return 0 when column does not exist on any agent', () => {
                const result = calculateTotal(
                    mockAgents,
                    'agent_status_nonexistent',
                )
                expect(result).toBe(0)
            })
        })

        describe('with mixed valid/invalid data', () => {
            it('should treat string values as 0 and sum only numeric values', () => {
                const agentsWithMixedData: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 3600,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_online_time: 'invalid' as any, // String value
                    },
                    {
                        id: 3,
                        name: 'Charlie',
                        agent_online_time: 5400,
                    },
                ]

                const result = calculateTotal(
                    agentsWithMixedData,
                    ONLINE_TIME_COLUMN,
                )
                // 3600 + 0 (string treated as 0) + 5400 = 9000
                expect(result).toBe(9000)
            })

            it('should treat null values as 0', () => {
                const agentsWithNullData: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 3600,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_online_time: null as any,
                    },
                    {
                        id: 3,
                        name: 'Charlie',
                        agent_online_time: 5400,
                    },
                ]

                const result = calculateTotal(
                    agentsWithNullData,
                    ONLINE_TIME_COLUMN,
                )
                // 3600 + 0 (null treated as 0) + 5400 = 9000
                expect(result).toBe(9000)
            })
        })

        describe('with empty agents array', () => {
            it('should return 0 for empty agents array', () => {
                const result = calculateTotal([], ONLINE_TIME_COLUMN)
                expect(result).toBe(0)
            })
        })

        describe('with zero values', () => {
            it('should correctly sum when all values are zero', () => {
                const agentsWithZeroValues: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 0,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_online_time: 0,
                    },
                ]

                const result = calculateTotal(
                    agentsWithZeroValues,
                    ONLINE_TIME_COLUMN,
                )
                expect(result).toBe(0)
            })

            it('should correctly sum mix of zero and non-zero values', () => {
                const agentsWithMixedZeros: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 0,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_online_time: 3600,
                    },
                    {
                        id: 3,
                        name: 'Charlie',
                        agent_online_time: 0,
                    },
                ]

                const result = calculateTotal(
                    agentsWithMixedZeros,
                    ONLINE_TIME_COLUMN,
                )
                expect(result).toBe(3600)
            })
        })

        describe('with negative values', () => {
            it('should handle negative values in calculation', () => {
                const agentsWithNegativeValues: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 3600,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_online_time: -1000,
                    },
                    {
                        id: 3,
                        name: 'Charlie',
                        agent_online_time: 5400,
                    },
                ]

                const result = calculateTotal(
                    agentsWithNegativeValues,
                    ONLINE_TIME_COLUMN,
                )
                // 3600 + (-1000) + 5400 = 8000
                expect(result).toBe(8000)
            })
        })

        describe('with decimal values', () => {
            it('should handle decimal values correctly', () => {
                const agentsWithDecimalValues: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 3600.5,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_online_time: 7200.75,
                    },
                ]

                const result = calculateTotal(
                    agentsWithDecimalValues,
                    ONLINE_TIME_COLUMN,
                )
                // 3600.5 + 7200.75 = 10801.25
                expect(result).toBe(10801.25)
            })
        })
    })

    describe('calculateAverage', () => {
        describe('with valid numeric data', () => {
            it('should calculate average for online time across agents', () => {
                // (3600 + 7200 + 5400) / 3 = 5400
                const result = calculateAverage(mockAgents, ONLINE_TIME_COLUMN)
                expect(result).toBe(5400)
            })

            it('should calculate average for Available column using online time only', () => {
                // Uses online values: (1200 + 2400 + 1800) / 3 = 1800
                const result = calculateAverage(
                    mockAgents,
                    AVAILABLE_STATUS_COLUMN,
                )
                expect(result).toBe(1800)
            })

            it('should handle decimal averages correctly', () => {
                const agentsWithOddTotal: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 1000,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_online_time: 2000,
                    },
                    {
                        id: 3,
                        name: 'Charlie',
                        agent_online_time: 3000,
                    },
                ]

                const result = calculateAverage(
                    agentsWithOddTotal,
                    ONLINE_TIME_COLUMN,
                )
                // (1000 + 2000 + 3000) / 3 = 2000
                expect(result).toBe(2000)
            })

            it('should return fractional average when total is not evenly divisible', () => {
                const agentsWithUnevenTotal: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 100,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_online_time: 200,
                    },
                ]

                const result = calculateAverage(
                    agentsWithUnevenTotal,
                    ONLINE_TIME_COLUMN,
                )
                // (100 + 200) / 2 = 150
                expect(result).toBe(150)
            })
        })

        describe('with agent_name column', () => {
            it('should return 0 for agent_name column', () => {
                const result = calculateAverage(mockAgents, AGENT_NAME_COLUMN)
                expect(result).toBe(0)
            })
        })

        describe('with zero agents', () => {
            it('should return 0 when agents array is empty (should not crash)', () => {
                const result = calculateAverage([], ONLINE_TIME_COLUMN)
                expect(result).toBe(0)
            })

            it('should not throw division by zero error', () => {
                expect(() => {
                    calculateAverage([], ONLINE_TIME_COLUMN)
                }).not.toThrow()
            })
        })

        describe('with missing column data', () => {
            it('should calculate average treating undefined as 0', () => {
                const agentsWithMissingData: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 3600,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        // agent_online_time is missing
                    },
                    {
                        id: 3,
                        name: 'Charlie',
                        agent_online_time: 5400,
                    },
                ]

                const result = calculateAverage(
                    agentsWithMissingData,
                    ONLINE_TIME_COLUMN,
                )
                // (3600 + 0 + 5400) / 3 = 3000
                expect(result).toBe(3000)
            })

            it('should return 0 when column does not exist on any agent', () => {
                const result = calculateAverage(
                    mockAgents,
                    'agent_status_nonexistent',
                )
                expect(result).toBe(0)
            })
        })

        describe('with single agent', () => {
            it('should return the value itself when only one agent', () => {
                const singleAgent: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 3600,
                    },
                ]

                const result = calculateAverage(singleAgent, ONLINE_TIME_COLUMN)
                expect(result).toBe(3600)
            })
        })

        describe('should divide total by agents.length correctly', () => {
            it('should use agents.length as divisor, not count of non-zero values', () => {
                const agentsWithSomeZeros: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 0,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_online_time: 0,
                    },
                    {
                        id: 3,
                        name: 'Charlie',
                        agent_online_time: 3000,
                    },
                ]

                const result = calculateAverage(
                    agentsWithSomeZeros,
                    ONLINE_TIME_COLUMN,
                )
                // Total = 3000, Count = 3, Average = 1000 (not 3000)
                expect(result).toBe(1000)
            })

            it('should use agents.length even when some values are undefined', () => {
                const agentsWithUndefined: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 6000,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        // agent_online_time is undefined
                    },
                    {
                        id: 3,
                        name: 'Charlie',
                        // agent_online_time is undefined
                    },
                ]

                const result = calculateAverage(
                    agentsWithUndefined,
                    ONLINE_TIME_COLUMN,
                )
                // Total = 6000, Count = 3, Average = 2000 (not 6000)
                expect(result).toBe(2000)
            })

            it('should correctly calculate average with large number of agents', () => {
                const manyAgents: AgentAvailabilityData[] = Array.from(
                    { length: 100 },
                    (_, i) => ({
                        id: i + 1,
                        name: `Agent ${i + 1}`,
                        agent_online_time: 1000,
                    }),
                )

                const result = calculateAverage(manyAgents, ONLINE_TIME_COLUMN)
                // (1000 * 100) / 100 = 1000
                expect(result).toBe(1000)
            })
        })

        describe('with zero values', () => {
            it('should return 0 when all values are zero', () => {
                const agentsWithZeroValues: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 0,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_online_time: 0,
                    },
                ]

                const result = calculateAverage(
                    agentsWithZeroValues,
                    ONLINE_TIME_COLUMN,
                )
                expect(result).toBe(0)
            })
        })

        describe('with mixed valid/invalid data', () => {
            it('should treat non-numeric values as 0 when calculating average', () => {
                const agentsWithMixedData: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 3600,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_online_time: 'invalid' as any,
                    },
                    {
                        id: 3,
                        name: 'Charlie',
                        agent_online_time: 5400,
                    },
                ]

                const result = calculateAverage(
                    agentsWithMixedData,
                    ONLINE_TIME_COLUMN,
                )
                // (3600 + 0 + 5400) / 3 = 3000
                expect(result).toBe(3000)
            })
        })

        describe('with negative values', () => {
            it('should handle negative values in average calculation', () => {
                const agentsWithNegativeValues: AgentAvailabilityData[] = [
                    {
                        id: 1,
                        name: 'Alice',
                        agent_online_time: 3600,
                    },
                    {
                        id: 2,
                        name: 'Bob',
                        agent_online_time: -1200,
                    },
                    {
                        id: 3,
                        name: 'Charlie',
                        agent_online_time: 5400,
                    },
                ]

                const result = calculateAverage(
                    agentsWithNegativeValues,
                    ONLINE_TIME_COLUMN,
                )
                // (3600 + (-1200) + 5400) / 3 = 2600
                expect(result).toBe(2600)
            })
        })
    })

    describe('integration between calculateTotal and calculateAverage', () => {
        it('should have calculateAverage use calculateTotal internally', () => {
            const agents: AgentAvailabilityData[] = [
                {
                    id: 1,
                    name: 'Alice',
                    agent_online_time: 2000,
                },
                {
                    id: 2,
                    name: 'Bob',
                    agent_online_time: 4000,
                },
            ]

            const total = calculateTotal(agents, ONLINE_TIME_COLUMN)
            const average = calculateAverage(agents, ONLINE_TIME_COLUMN)

            expect(average).toBe(total / agents.length)
            expect(average).toBe(3000)
        })

        it('should maintain consistency between total and average calculations', () => {
            const total = calculateTotal(mockAgents, AVAILABLE_STATUS_COLUMN)
            const average = calculateAverage(
                mockAgents,
                AVAILABLE_STATUS_COLUMN,
            )

            // Uses online values: 1200 + 2400 + 1800 = 5400 total, 1800 average
            expect(total).toBe(5400)
            expect(average).toBe(1800)
            expect(average * mockAgents.length).toBe(total)
        })
    })
})
