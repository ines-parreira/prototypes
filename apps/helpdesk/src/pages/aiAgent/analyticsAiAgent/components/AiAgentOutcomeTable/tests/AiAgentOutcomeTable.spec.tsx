import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'
import { AiAgentOutcomeTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/AiAgentOutcomeTable'
import { AI_AGENT_OUTCOME_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/columns'
import {
    DownloadAiAgentOutcomeButton,
    useDownloadAiAgentOutcomeAction,
} from 'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/DownloadAiAgentOutcomeButton'
import { useAiAgentOutcomeMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentOutcomeMetrics'
import type { AiAgentOutcomeEntityMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentOutcomeMetrics'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/DownloadAiAgentOutcomeButton',
    () => ({
        DownloadAiAgentOutcomeButton: jest.fn(),
        useDownloadAiAgentOutcomeAction: jest.fn(),
    }),
)

jest.mock('pages/aiAgent/analyticsAiAgent/hooks/useAiAgentOutcomeMetrics')

jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

jest.mock('domains/reporting/hooks/dashboards/useCustomDashboardTableColumns')

const mockDownloadAiAgentOutcomeButton = assumeMock(
    DownloadAiAgentOutcomeButton,
)
const mockUseDownloadAiAgentOutcomeAction = assumeMock(
    useDownloadAiAgentOutcomeAction,
)
const mockUseCustomDashboardTableColumns = assumeMock(
    useCustomDashboardTableColumns,
)
const mockUseAiAgentOutcomeMetrics = assumeMock(useAiAgentOutcomeMetrics)

const defaultData: AiAgentOutcomeEntityMetrics[] = [
    {
        entity: 'Close::With message',
        allAgents: 140,
        supportAgent: 100,
        shoppingAssistant: 40,
    },
    {
        entity: 'Handover::With message',
        allAgents: 10,
        supportAgent: 10,
        shoppingAssistant: null,
    },
]

const renderComponent = () => render(<AiAgentOutcomeTable />)

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: AiAgentOutcomeEntityMetrics[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        DownloadButton: React.ReactNode
        actionMenu?: React.ReactNode
        name?: string
        nameColumns: {
            accessor: string
            label: string
            formatName?: (value: string) => string
        }[]
    }

describe('AiAgentOutcomeTable', () => {
    beforeEach(() => {
        mockDownloadAiAgentOutcomeButton.mockReturnValue(
            <div>Download AI Agent Outcome</div>,
        )
        mockUseDownloadAiAgentOutcomeAction.mockReturnValue({
            onClick: jest.fn(),
            isLoading: false,
        })
        mockUseCustomDashboardTableColumns.mockReturnValue({
            onSaveColumns: undefined,
        })
        mockUseAiAgentOutcomeMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: { ticketCount: false },
            isLoading: false,
            isError: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes pivoted data from useAiAgentOutcomeMetrics to the table', () => {
        renderComponent()

        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes the three role columns as metricColumns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(AI_AGENT_OUTCOME_COLUMNS)
        expect(
            getLastCallProps().metricColumns.map((col) => col.label),
        ).toEqual([
            'All AI Agents',
            'AI Support Agent',
            'AI Shopping assistant',
        ])
    })

    it('uses an "AI Agent outcome" name column', () => {
        renderComponent()

        expect(getLastCallProps().nameColumns).toEqual([
            expect.objectContaining({
                accessor: 'entity',
                label: 'AI Agent outcome',
            }),
        ])
    })

    it('renders the standalone download button outside of dashboard mode', () => {
        renderComponent()

        expect(
            screen.getByText('Download AI Agent Outcome'),
        ).toBeInTheDocument()
    })

    it('passes an action menu when chartId and withChartMenu are provided', () => {
        render(
            <AiAgentOutcomeTable
                chartId="ai_agent_outcome_table"
                withChartMenu
            />,
        )

        expect(getLastCallProps().actionMenu).toBeDefined()
        expect(getLastCallProps().DownloadButton).toBeUndefined()
    })

    it('does not pass an action menu without a chartId', () => {
        renderComponent()

        expect(getLastCallProps().actionMenu).toBeUndefined()
    })

    it('passes name from chartConfig.label to the table', () => {
        render(
            <AiAgentOutcomeTable chartConfig={{ label: 'AI Agent Outcome' }} />,
        )

        expect(getLastCallProps().name).toBe('AI Agent Outcome')
    })
})
