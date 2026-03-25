import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render, screen } from '@testing-library/react'

import { FLOWS_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/FlowsTable/columns'
import { FlowsTable } from 'pages/aiAgent/analyticsOverview/components/FlowsTable/FlowsTable'
import type { FlowsEntityMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useFlowsMetrics'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsOverview/components/FlowsTable/DownloadFlowsButton',
    () => ({
        DownloadFlowsButton: () => <div>Download Flows</div>,
    }),
)

jest.mock('pages/aiAgent/analyticsOverview/hooks/useFlowsMetrics')

const mockUseFlowsMetrics = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useFlowsMetrics',
).useFlowsMetrics as jest.Mock

const defaultLoadingStates: MetricLoadingStates = {
    automationRate: false,
    automatedInteractions: false,
    handoverInteractions: false,
    timeSaved: false,
    costSaved: false,
}

const defaultDisplayNames: Record<string, string> = {
    'flow-seed-10': 'Product availability',
    'flow-seed-9': 'Repairs',
}

const defaultData: FlowsEntityMetrics[] = [
    {
        entity: 'flow-seed-10',
        automationRate: 42,
        automatedInteractions: 1200,
        handoverInteractions: 80,
        costSaved: 500,
        timeSaved: 3600,
    },
    {
        entity: 'flow-seed-9',
        automationRate: 18,
        automatedInteractions: 300,
        handoverInteractions: 45,
        costSaved: 120,
        timeSaved: 900,
    },
]

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
    displayNames = defaultDisplayNames,
) => {
    mockUseFlowsMetrics.mockReturnValue({ data, loadingStates, displayNames })
    return render(<FlowsTable />)
}

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: FlowsEntityMetrics[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        getRowKey: (row: FlowsEntityMetrics) => string
        DownloadButton: React.ReactNode
        nameColumns: {
            accessor: string
            label: string
            displayNames?: Record<string, string>
        }[]
    }

describe('FlowsTable', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes data from useFlowsMetrics to ReportingMetricBreakdownTable', () => {
        renderComponent()

        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes loadingStates from the hook', () => {
        renderComponent()

        expect(getLastCallProps().loadingStates).toBe(defaultLoadingStates)
    })

    it('passes FLOWS_COLUMNS as metricColumns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(FLOWS_COLUMNS)
    })

    it('passes getRowKey that returns the entity value', () => {
        renderComponent()

        const { getRowKey } = getLastCallProps()
        expect(getRowKey(defaultData[0])).toBe('flow-seed-10')
    })

    it('passes nameColumns with entity accessor, Flows label, and displayNames from the hook', () => {
        renderComponent()

        expect(getLastCallProps().nameColumns[0]).toEqual({
            accessor: 'entity',
            label: 'Flows',
            displayNames: defaultDisplayNames,
        })
    })

    it('renders DownloadFlowsButton as the DownloadButton', () => {
        renderComponent()

        expect(screen.getByText('Download Flows')).toBeInTheDocument()
    })
})
