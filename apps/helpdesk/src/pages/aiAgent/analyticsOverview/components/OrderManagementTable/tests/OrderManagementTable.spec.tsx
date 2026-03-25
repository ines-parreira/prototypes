import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render, screen } from '@testing-library/react'

import {
    ENTITY_DISPLAY_NAMES,
    ORDER_MANAGEMENT_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/columns'
import { OrderManagementTable } from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/OrderManagementTable'
import type { OrderManagementEntityMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsOverview/components/OrderManagementTable/DownloadOrderManagementButton',
    () => ({
        DownloadOrderManagementButton: () => (
            <div>Download Order Management</div>
        ),
    }),
)

jest.mock('pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics')

const mockUseOrderManagementMetrics = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics',
).useOrderManagementMetrics as jest.Mock

const defaultLoadingStates = {
    automationRate: false,
    automatedInteractions: false,
    handoverInteractions: false,
    timeSaved: false,
    costSaved: false,
}

const defaultData: OrderManagementEntityMetrics[] = [
    {
        entity: 'cancel_order',
        automationRate: 18,
        automatedInteractions: 2700,
        handoverInteractions: 189,
        costSaved: 1200,
        timeSaved: 9900,
    },
    {
        entity: 'track_order',
        automationRate: 7,
        automatedInteractions: 900,
        handoverInteractions: null,
        costSaved: 500,
        timeSaved: 4500,
    },
]

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
) => {
    mockUseOrderManagementMetrics.mockReturnValue({ data, loadingStates })
    return render(<OrderManagementTable />)
}

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: OrderManagementEntityMetrics[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        getRowKey: (row: OrderManagementEntityMetrics) => string
        DownloadButton: React.ReactNode
        nameColumns: {
            accessor: string
            label: string
            displayNames?: Record<string, string>
        }[]
    }

describe('OrderManagementTable', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes data from useOrderManagementMetrics to ReportingMetricBreakdownTable', () => {
        renderComponent()

        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes loadingStates from the hook', () => {
        renderComponent()

        expect(getLastCallProps().loadingStates).toBe(defaultLoadingStates)
    })

    it('passes ORDER_MANAGEMENT_COLUMNS as metricColumns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(ORDER_MANAGEMENT_COLUMNS)
    })

    it('passes getRowKey that returns the entity value', () => {
        renderComponent()

        const { getRowKey } = getLastCallProps()
        expect(getRowKey(defaultData[0])).toBe('cancel_order')
    })

    it('passes nameColumns with entity accessor, Feature name label, and ENTITY_DISPLAY_NAMES', () => {
        renderComponent()

        expect(getLastCallProps().nameColumns[0]).toEqual({
            accessor: 'entity',
            label: 'Feature name',
            displayNames: ENTITY_DISPLAY_NAMES,
        })
    })

    it('renders DownloadOrderManagementButton as the DownloadButton', () => {
        renderComponent()

        expect(
            screen.getByText('Download Order Management'),
        ).toBeInTheDocument()
    })
})
