import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/columns'
import { SupportAgentsPerformanceByIntentTable } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/SupportAgentsPerformanceByIntentTable'
import type { SupportAgentsPerformanceByIntentEntityMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByIntentMetrics'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/DownloadSupportAgentsPerformanceByIntentButton',
    () => ({
        DownloadSupportAgentsPerformanceByIntentButton: () => (
            <div>Download Support Agents Performance By Intent</div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByIntentMetrics',
)

const mockUseSupportAgentsPerformanceByIntentMetrics = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByIntentMetrics',
).useSupportAgentsPerformanceByIntentMetrics as jest.Mock

const defaultLoadingStates = {
    automatedInteractions: false,
    handoverInteractions: false,
    successRate: false,
    costSaved: false,
    decreaseInFRT: false,
}

const defaultData: SupportAgentsPerformanceByIntentEntityMetrics[] = [
    {
        entity: 'Billing :: Refund Request',
        intentL1: 'Billing',
        intentL2: 'Refund Request',
        automatedInteractions: 1500,
        handoverInteractions: 120,
        successRate: 0.82,
        costSaved: 800,
        decreaseInFRT: 180,
    },
    {
        entity: 'Shipping :: Order Status',
        intentL1: 'Shipping',
        intentL2: 'Order Status',
        automatedInteractions: 900,
        handoverInteractions: null,
        successRate: 0.71,
        costSaved: 450,
        decreaseInFRT: 75,
    },
]

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
) => {
    mockUseSupportAgentsPerformanceByIntentMetrics.mockReturnValue({
        data,
        loadingStates,
    })
    return render(<SupportAgentsPerformanceByIntentTable />)
}

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: SupportAgentsPerformanceByIntentEntityMetrics[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        getRowKey: (
            row: SupportAgentsPerformanceByIntentEntityMetrics,
        ) => string
        DownloadButton: React.ReactNode
        nameColumns: { accessor: string; label: string }[]
    }

describe('SupportAgentsPerformanceByIntentTable', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes data from useSupportAgentsPerformanceByIntentMetrics to ReportingMetricBreakdownTable', () => {
        renderComponent()

        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes loadingStates from the hook', () => {
        renderComponent()

        expect(getLastCallProps().loadingStates).toBe(defaultLoadingStates)
    })

    it('passes SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS as metricColumns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(
            SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS,
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

    it('renders DownloadSupportAgentsPerformanceByIntentButton as the DownloadButton', () => {
        renderComponent()

        expect(
            screen.getByText('Download Support Agents Performance By Intent'),
        ).toBeInTheDocument()
    })

    it('falls back to an empty array when the hook returns no data', () => {
        mockUseSupportAgentsPerformanceByIntentMetrics.mockReturnValue({
            data: undefined,
            loadingStates: defaultLoadingStates,
        })

        render(<SupportAgentsPerformanceByIntentTable />)

        expect(getLastCallProps().data).toEqual([])
    })
})
