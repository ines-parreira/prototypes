import { screen } from '@testing-library/react'

import { AgentAvailabilityRow } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityRow'
import {
    basicColumnsOrder,
    mockTransformedAgents,
    renderRowWithProviders,
} from 'domains/reporting/pages/support-performance/agents/tests/fixtures'
import type { AgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/utils/transformAvailabilityData'

const mockAgent = mockTransformedAgents[0]

describe('AgentAvailabilityRow', () => {
    const renderRow = (
        agent = mockAgent,
        columnsOrder = basicColumnsOrder,
        isTableScrolled = false,
    ) => {
        return renderRowWithProviders(
            <table>
                <tbody>
                    <AgentAvailabilityRow
                        agent={agent}
                        columnsOrder={columnsOrder}
                        isTableScrolled={isTableScrolled}
                    />
                </tbody>
            </table>,
        )
    }

    it('should render agent name', () => {
        renderRow()

        expect(screen.getByText('Alice Agent')).toBeInTheDocument()
    })

    it('should render duration data in cells', () => {
        const { container } = renderRow()

        expect(screen.getByText('Alice Agent')).toBeInTheDocument()

        const cells = container.querySelectorAll('td')
        expect(cells.length).toBe(4)
    })

    it('should render placeholder for missing values', () => {
        const agentWithMissingData: AgentAvailabilityData = {
            id: 2,
            name: 'Bob Agent',
            email: 'bob@example.com',
            avatarUrl: undefined,
            agent_online_time: undefined,
            agent_status_available: undefined,
            agent_status_unavailable: undefined,
        }

        renderRow(agentWithMissingData)

        expect(screen.getByText('Bob Agent')).toBeInTheDocument()
        const placeholders = screen.getAllByText('-')
        expect(placeholders.length).toBeGreaterThan(0)
    })

    it('should render agent without avatar', () => {
        const agentWithoutAvatar: AgentAvailabilityData = {
            ...mockAgent,
            avatarUrl: undefined,
        }

        renderRow(agentWithoutAvatar)

        expect(screen.getByText('Alice Agent')).toBeInTheDocument()
    })

    it('should render custom status columns', () => {
        const agentWithCustomStatus: AgentAvailabilityData = {
            ...mockAgent,
            'agent_status_custom-123': 900,
        }

        const columnsWithCustom = [
            ...basicColumnsOrder,
            'agent_status_custom-123' as any,
        ]

        const { container } = renderRow(
            agentWithCustomStatus,
            columnsWithCustom,
        )

        expect(screen.getByText('Alice Agent')).toBeInTheDocument()

        const cells = container.querySelectorAll('td')
        expect(cells.length).toBe(5)
    })

    it('should handle zero and null values without crashing', () => {
        const agentWithZeros: AgentAvailabilityData = {
            ...mockAgent,
            agent_online_time: 0,
            agent_status_available: 0,
            agent_status_unavailable: null as any,
        }

        renderRow(agentWithZeros)

        expect(screen.getByText('Alice Agent')).toBeInTheDocument()
    })
})
