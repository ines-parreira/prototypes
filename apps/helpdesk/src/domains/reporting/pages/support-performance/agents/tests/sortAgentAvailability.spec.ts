import { sortAgentAvailability } from 'domains/reporting/pages/support-performance/agents/sortAgentAvailability'
import { mockTransformedAgents } from 'domains/reporting/pages/support-performance/agents/tests/fixtures'
import { OrderDirection } from 'models/api/types'

describe('sortAgentAvailability', () => {
    it('should return agents unchanged when no sorting field', () => {
        const result = sortAgentAvailability(mockTransformedAgents, null)

        expect(result).toBe(mockTransformedAgents)
    })

    it('should return empty array when agents list is empty', () => {
        const result = sortAgentAvailability([], {
            field: 'agent_status_available',
            direction: OrderDirection.Desc,
        })

        expect(result).toEqual([])
    })

    describe('server-side sorting (agent_online_time)', () => {
        it('should order agents by lastSortingMetric position', () => {
            const result = sortAgentAvailability(mockTransformedAgents, {
                field: 'agent_online_time',
                direction: OrderDirection.Desc,
                lastSortingMetric: [{ agentId: '2' }, { agentId: '1' }],
            })

            expect(result[0].id).toBe(2)
            expect(result[1].id).toBe(1)
            expect(result[2].id).toBe(3)
        })

        it('should push agents missing from lastSortingMetric to the end', () => {
            const result = sortAgentAvailability(mockTransformedAgents, {
                field: 'agent_online_time',
                direction: OrderDirection.Desc,
                lastSortingMetric: [{ agentId: '3' }],
            })

            expect(result[0].id).toBe(3)
            expect(result[1].id).toBe(1)
            expect(result[2].id).toBe(2)
        })

        it('should fall back to client-side sorting when lastSortingMetric is absent', () => {
            const result = sortAgentAvailability(mockTransformedAgents, {
                field: 'agent_online_time',
                direction: OrderDirection.Asc,
            })

            expect(result[0].id).toBe(1)
            expect(result[1].id).toBe(3)
            expect(result[2].id).toBe(2)
        })
    })

    describe('client-side sorting (status columns)', () => {
        it('should sort by status total ascending', () => {
            const result = sortAgentAvailability(mockTransformedAgents, {
                field: 'agent_status_available',
                direction: OrderDirection.Asc,
            })

            expect(result[0].id).toBe(1)
            expect(result[1].id).toBe(3)
            expect(result[2].id).toBe(2)
        })

        it('should sort by status total descending', () => {
            const result = sortAgentAvailability(mockTransformedAgents, {
                field: 'agent_status_available',
                direction: OrderDirection.Desc,
            })

            expect(result[0].id).toBe(2)
            expect(result[1].id).toBe(3)
            expect(result[2].id).toBe(1)
        })

        it('should handle undefined values by treating them as 0', () => {
            const agentsWithUndefined = [
                {
                    ...mockTransformedAgents[0],
                    agent_status_available: undefined,
                },
                mockTransformedAgents[1],
            ]

            const result = sortAgentAvailability(agentsWithUndefined, {
                field: 'agent_status_available',
                direction: OrderDirection.Desc,
            })

            expect(result[0].id).toBe(2) // Has value
            expect(result[1].id).toBe(1) // undefined treated as 0
        })

        it('should handle null total in StatusBreakdown by treating as 0', () => {
            const agentsWithNullTotal = [
                {
                    ...mockTransformedAgents[0],
                    agent_status_available: {
                        total: null as any,
                        online: 0,
                        offline: 0,
                    },
                },
                mockTransformedAgents[1],
            ]

            const result = sortAgentAvailability(agentsWithNullTotal, {
                field: 'agent_status_available',
                direction: OrderDirection.Desc,
            })

            expect(result[0].id).toBe(2) // Has value
            expect(result[1].id).toBe(1) // null total treated as 0
        })

        it('should handle equal values correctly', () => {
            const agentsWithEqualValues = [
                {
                    ...mockTransformedAgents[0],
                    agent_status_available: {
                        total: 100,
                        online: 0,
                        offline: 0,
                    },
                },
                {
                    ...mockTransformedAgents[1],
                    agent_status_available: {
                        total: 100,
                        online: 0,
                        offline: 0,
                    },
                },
            ]

            const result = sortAgentAvailability(agentsWithEqualValues, {
                field: 'agent_status_available',
                direction: OrderDirection.Asc,
            })

            // Order should be stable when values are equal
            expect(result).toHaveLength(2)
        })
    })
})
