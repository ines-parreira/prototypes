import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { AllAgentsPerformanceByIntentTable } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/AllAgentsPerformanceByIntentTable'
import { ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/columns'
import type { AllAgentsPerformanceByIntentEntityMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByIntentMetrics'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/DownloadAllAgentsPerformanceByIntentButton',
    () => ({
        DownloadAllAgentsPerformanceByIntentButton: () => (
            <div>Download All Agents Performance By Intent</div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByIntentMetrics',
)

jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

const mockUseAllAgentsPerformanceByIntentMetrics = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByIntentMetrics',
).useAllAgentsPerformanceByIntentMetrics as jest.Mock

const defaultLoadingStates = {
    automatedInteractions: false,
    handoverInteractions: false,
    costSaved: false,
    coverageRate: false,
    successRate: false,
    conversionRate: false,
}

const defaultData: AllAgentsPerformanceByIntentEntityMetrics[] = [
    {
        entity: 'Billing :: Refund Request',
        intentL1: 'Billing',
        intentL2: 'Refund Request',
        automatedInteractions: 1500,
        handoverInteractions: 120,
        coverageRate: 0.87,
        successRate: 0.81,
        conversionRate: 0.42,
        costSaved: 800,
    },
    {
        entity: 'Shipping :: Order Status',
        intentL1: 'Shipping',
        intentL2: 'Order Status',
        automatedInteractions: 900,
        handoverInteractions: null,
        coverageRate: 0.93,
        successRate: 0.88,
        conversionRate: null,
        costSaved: 450,
    },
]

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
) => {
    mockUseAllAgentsPerformanceByIntentMetrics.mockReturnValue({
        data,
        loadingStates,
    })
    return render(<AllAgentsPerformanceByIntentTable />)
}

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: AllAgentsPerformanceByIntentEntityMetrics[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        getRowKey: (row: AllAgentsPerformanceByIntentEntityMetrics) => string
        DownloadButton: React.ReactNode
        actionMenu?: React.ReactNode
        nameColumns: { accessor: string; label: string }[]
    }

describe('AllAgentsPerformanceByIntentTable', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes data from useAllAgentsPerformanceByIntentMetrics to ReportingMetricBreakdownTable', () => {
        renderComponent()

        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes loadingStates from the hook', () => {
        renderComponent()

        expect(getLastCallProps().loadingStates).toBe(defaultLoadingStates)
    })

    it('passes ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS as metricColumns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(
            ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS,
        )
    })

    it('passes nameColumns with intentL1 and intentL2 accessors and labels', () => {
        renderComponent()

        const { nameColumns } = getLastCallProps()
        expect(nameColumns).toEqual([
            { accessor: 'intentL1', label: 'Intent L1' },
            { accessor: 'intentL2', label: 'Intent L2' },
        ])
    })

    it('renders DownloadAllAgentsPerformanceByIntentButton as the DownloadButton', () => {
        renderComponent()

        expect(
            screen.getByText('Download All Agents Performance By Intent'),
        ).toBeInTheDocument()
    })

    it('passes actionMenu to ReportingMetricBreakdownTable when chartId is provided', () => {
        mockUseAllAgentsPerformanceByIntentMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <AllAgentsPerformanceByIntentTable chartId="all_agents_performance_by_intent_table" />,
        )

        expect(getLastCallProps().actionMenu).toBeDefined()
    })

    it('does not pass actionMenu to ReportingMetricBreakdownTable when chartId is not provided', () => {
        renderComponent()

        expect(getLastCallProps().actionMenu).toBeUndefined()
    })
})
