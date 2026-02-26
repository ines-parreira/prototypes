import { render, screen } from '@testing-library/react'

import { AgentAvailabilitySummaryRow } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilitySummaryRow'
import type { AgentAvailabilityColumn } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants'
import type { AgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/utils/transformAvailabilityData'

const { AGENT_NAME_COLUMN, ONLINE_TIME_COLUMN } = AGENT_AVAILABILITY_COLUMNS

const mockAgents: AgentAvailabilityData[] = [
    {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        agent_online_time: 3600,
        agent_status_available: 1800,
    },
    {
        id: 2,
        name: 'Bob',
        email: 'bob@example.com',
        agent_online_time: 7200,
        agent_status_available: 3600,
    },
    {
        id: 3,
        name: 'Charlie',
        email: 'charlie@example.com',
        agent_online_time: 5400,
        agent_status_available: 2700,
    },
]

const columnsOrder: AgentAvailabilityColumn[] = [
    AGENT_NAME_COLUMN,
    ONLINE_TIME_COLUMN,
    'agent_status_available',
]

const renderRow = (
    props: Partial<
        React.ComponentProps<typeof AgentAvailabilitySummaryRow>
    > = {},
) => {
    const tableBody = document.createElement('tbody')
    document.body.appendChild(tableBody)

    const result = render(
        <AgentAvailabilitySummaryRow
            row="total"
            agents={mockAgents}
            columnsOrder={columnsOrder}
            isTableScrolled={false}
            {...props}
        />,
        { container: tableBody },
    )

    return { ...result, tableBody }
}

describe('AgentAvailabilitySummaryRow', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it.each([
        {
            row: 'total' as const,
            label: 'Total',
            expectedValues: ['4h 30m', '2h 15m'],
        },
        {
            row: 'average' as const,
            label: 'Average',
            expectedValues: ['1h 30m', '45m'],
        },
    ])(
        '$row row shows $label label and aggregated values',
        ({ row, label, expectedValues }) => {
            renderRow({ row })

            expect(screen.getByText(label)).toBeInTheDocument()
            expectedValues.forEach((value) =>
                expect(screen.getByText(value)).toBeInTheDocument(),
            )
        },
    )

    it('shows dash for columns with no data', () => {
        renderRow({ agents: [] })

        expect(screen.getAllByText('-').length).toBeGreaterThan(0)
    })

    it('shows dash for missing column values and formatted duration for present ones', () => {
        const agentsWithPartialData: AgentAvailabilityData[] = [
            {
                id: 1,
                name: 'Alice',
                email: 'alice@example.com',
                agent_online_time: 3600,
            },
        ]

        renderRow({ agents: agentsWithPartialData })

        expect(screen.getByText('1h')).toBeInTheDocument()
        expect(screen.getByText('-')).toBeInTheDocument()
    })
})
