import type { ReactNode } from 'react'

import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import type { ColumnConfig } from '@gorgias/helpdesk-types'

import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import type { DashboardChartSchema } from 'domains/reporting/pages/dashboards/types'
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
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

jest.mock(
    'pages/aiAgent/analyticsOverview/components/OrderManagementTable/DownloadOrderManagementButton',
    () => ({
        DownloadOrderManagementButton: () => (
            <div>Download Order Management</div>
        ),
        useDownloadOrderManagementAction: () => ({
            onClick: jest.fn(),
            isLoading: false,
        }),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsOverview/components/OrderManagementTable/drillDowns/ReturnOrdersDrillDown',
    () => ({
        ReturnOrdersDrillDown: () => <div>Return Orders Drill Down</div>,
    }),
)

jest.mock(
    'pages/aiAgent/analyticsOverview/components/OrderManagementTable/drillDowns/TopReportedIssuesDrillDown',
    () => ({
        TopReportedIssuesDrillDown: () => (
            <div>Top Reported Issues Drill Down</div>
        ),
    }),
)

jest.mock('pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics')

jest.mock('domains/reporting/hooks/dashboards/useCustomDashboardTableColumns')

const mockUseOrderManagementMetrics = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics',
).useOrderManagementMetrics as jest.Mock

const mockUseCustomDashboardTableColumns = jest.requireMock(
    'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns',
).useCustomDashboardTableColumns as jest.Mock

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
        decreaseInResolutionTime: null,
        decreaseInFirstResponseTime: null,
    },
    {
        entity: 'track_order',
        automationRate: 7,
        automatedInteractions: 900,
        handoverInteractions: null,
        costSaved: 500,
        timeSaved: 4500,
        decreaseInResolutionTime: null,
        decreaseInFirstResponseTime: null,
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
        DownloadButton: ReactNode
        actionMenu?: ReactNode
        customDashboardChartSchema?: unknown
        onSaveColumns?: (columns: ColumnConfig[]) => void
        name?: string
        nameColumns: {
            accessor: string
            label: string
            displayNames?: Record<string, string>
            renderDrilldown?: (value: string) => ReactNode
        }[]
    }

describe('OrderManagementTable', () => {
    beforeEach(() => {
        mockUseCustomDashboardTableColumns.mockReturnValue({
            onSaveColumns: undefined,
        })
    })

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

    it('passes nameColumns with entity accessor, Feature name label, and ENTITY_DISPLAY_NAMES', () => {
        renderComponent()

        expect(getLastCallProps().nameColumns[0]).toEqual({
            accessor: 'entity',
            label: 'Feature name',
            displayNames: ENTITY_DISPLAY_NAMES,
            renderDrilldown: expect.any(Function),
        })
    })

    it('renders ReturnOrdersDrillDown when renderDrilldown is called with loop_returns_started', () => {
        renderComponent()

        const { renderDrilldown } = getLastCallProps().nameColumns[0] as {
            renderDrilldown: (value: string) => ReactNode
        }
        render(<>{renderDrilldown('loop_returns_started')}</>)

        expect(screen.getByText('Return Orders Drill Down')).toBeInTheDocument()
    })

    it('renders TopReportedIssuesDrillDown when renderDrilldown is called with automated_response_started', () => {
        renderComponent()

        const { renderDrilldown } = getLastCallProps().nameColumns[0] as {
            renderDrilldown: (value: string) => ReactNode
        }
        render(<>{renderDrilldown('automated_response_started')}</>)

        expect(
            screen.getByText('Top Reported Issues Drill Down'),
        ).toBeInTheDocument()
    })

    it('renders nothing when renderDrilldown is called with any other entity value', () => {
        renderComponent()

        const { renderDrilldown } = getLastCallProps().nameColumns[0] as {
            renderDrilldown: (value: string) => ReactNode
        }

        expect(renderDrilldown('cancel_order')).toBeNull()
    })

    it('renders DownloadOrderManagementButton as the DownloadButton', () => {
        renderComponent()

        expect(
            screen.getByText('Download Order Management'),
        ).toBeInTheDocument()
    })

    it('passes actionMenu to ReportingMetricBreakdownTable when chartId and withChartMenu are provided', () => {
        mockUseOrderManagementMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <OrderManagementTable
                chartId="order_management_table"
                withChartMenu
            />,
        )

        expect(getLastCallProps().actionMenu).toBeDefined()
    })

    it('does not pass actionMenu to ReportingMetricBreakdownTable when chartId is not provided', () => {
        renderComponent()

        expect(getLastCallProps().actionMenu).toBeUndefined()
    })

    it('does not pass actionMenu to ReportingMetricBreakdownTable when chartId is provided but withChartMenu is false', () => {
        mockUseOrderManagementMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <OrderManagementTable
                chartId="order_management_table"
                withChartMenu={false}
            />,
        )

        expect(getLastCallProps().actionMenu).toBeUndefined()
    })

    it('passes dashboard prop to ChartsActionMenu when provided', () => {
        mockUseOrderManagementMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        const dashboard = {
            id: 1,
            name: 'My Dashboard',
            children: [],
            emoji: null,
            analytics_filter_id: null,
        }

        render(
            <OrderManagementTable
                chartId="order_management_table"
                withChartMenu
                dashboard={dashboard}
            />,
        )

        expect(
            (getLastCallProps().actionMenu as React.ReactElement).props
                .dashboard,
        ).toBe(dashboard)
    })

    it('passes name from chartConfig.label to ReportingMetricBreakdownTable', () => {
        mockUseOrderManagementMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(<OrderManagementTable chartConfig={{ label: 'Order type' }} />)

        expect(getLastCallProps().name).toBe('Order type')
    })

    it('passes customDashboardChartSchema to ReportingMetricBreakdownTable', () => {
        mockUseOrderManagementMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        const customDashboardChartSchema: DashboardChartSchema = {
            config_id: 'chart-1',
            type: DashboardChildType.Chart,
        }

        render(
            <OrderManagementTable
                customDashboardChartSchema={customDashboardChartSchema}
            />,
        )

        expect(getLastCallProps().customDashboardChartSchema).toBe(
            customDashboardChartSchema,
        )
    })

    it('passes onSaveColumns from useCustomDashboardTableColumns to ReportingMetricBreakdownTable', () => {
        mockUseOrderManagementMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        const onSaveColumns = jest.fn()
        mockUseCustomDashboardTableColumns.mockReturnValue({ onSaveColumns })

        render(
            <OrderManagementTable
                dashboard={{
                    id: 1,
                    name: 'My Dashboard',
                    children: [],
                    emoji: null,
                    analytics_filter_id: null,
                }}
            />,
        )

        expect(getLastCallProps().onSaveColumns).toBe(onSaveColumns)
    })
})
