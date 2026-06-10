import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import type { ColumnConfig } from '@gorgias/helpdesk-types'

import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import type { DashboardChartSchema } from 'domains/reporting/pages/dashboards/types'
import { PERFORMANCE_BREAKDOWN_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'
import { PerformanceBreakdownTable } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/PerformanceBreakdownTable'
import type { FeatureMetrics } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/DownloadPerformanceBreakdownButton',
    () => ({
        DownloadPerformanceBreakdownButton: () => (
            <div>Download Performance Breakdown</div>
        ),
        useDownloadPerformanceBreakdownAction: () => ({
            onClick: jest.fn(),
            isLoading: false,
        }),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature',
)

jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

jest.mock('domains/reporting/hooks/dashboards/useCustomDashboardTableColumns')

const mockUsePerformanceMetricsPerFeature = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature',
).usePerformanceMetricsPerFeature as jest.Mock

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

const defaultData: FeatureMetrics[] = [
    {
        feature: 'AI Agent',
        automationRate: 18,
        automatedInteractions: 2700,
        handoverInteractions: 189,
        costSaved: 1200,
        timeSaved: 9900,
    },
    {
        feature: 'Flows',
        automationRate: 7,
        automatedInteractions: 900,
        handoverInteractions: 63,
        costSaved: 500,
        timeSaved: 4500,
    },
]

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
) => {
    mockUsePerformanceMetricsPerFeature.mockReturnValue({
        data,
        loadingStates,
    })
    return render(<PerformanceBreakdownTable />)
}

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: FeatureMetrics[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        getRowKey: (row: FeatureMetrics) => string
        DownloadButton: React.ReactNode
        actionMenu?: React.ReactNode
        customDashboardChartSchema?: unknown
        onSaveColumns?: (columns: ColumnConfig[]) => void
        name?: string
        nameColumns: { accessor: string; label: string }[]
    }

describe('PerformanceBreakdownTable', () => {
    beforeEach(() => {
        mockUseCustomDashboardTableColumns.mockReturnValue({
            onSaveColumns: undefined,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes data from usePerformanceMetricsPerFeature to ReportingMetricBreakdownTable', () => {
        renderComponent()

        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes loadingStates from the hook', () => {
        renderComponent()

        expect(getLastCallProps().loadingStates).toBe(defaultLoadingStates)
    })

    it('passes PERFORMANCE_BREAKDOWN_COLUMNS as metricColumns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(
            PERFORMANCE_BREAKDOWN_COLUMNS,
        )
    })

    it('passes nameColumns with feature accessor and Feature label', () => {
        renderComponent()

        expect(getLastCallProps().nameColumns[0]).toEqual({
            accessor: 'feature',
            label: 'Feature',
        })
    })

    it('renders DownloadPerformanceBreakdownButton as the DownloadButton', () => {
        renderComponent()

        expect(
            screen.getByText('Download Performance Breakdown'),
        ).toBeInTheDocument()
    })

    it('defaults data to empty array when hook returns undefined data', () => {
        mockUsePerformanceMetricsPerFeature.mockReturnValue({
            data: undefined,
            loadingStates: defaultLoadingStates,
        })
        render(<PerformanceBreakdownTable />)

        expect(getLastCallProps().data).toEqual([])
    })

    it('passes actionMenu to ReportingMetricBreakdownTable when chartId and withChartMenu are provided', () => {
        mockUsePerformanceMetricsPerFeature.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <PerformanceBreakdownTable
                chartId="performance_breakdown_table"
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
        mockUsePerformanceMetricsPerFeature.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <PerformanceBreakdownTable
                chartId="performance_breakdown_table"
                withChartMenu={false}
            />,
        )

        expect(getLastCallProps().actionMenu).toBeUndefined()
    })

    it('passes dashboard prop to ChartsActionMenu when provided', () => {
        mockUsePerformanceMetricsPerFeature.mockReturnValue({
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
            <PerformanceBreakdownTable
                chartId="performance_breakdown_table"
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
        mockUsePerformanceMetricsPerFeature.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(<PerformanceBreakdownTable chartConfig={{ label: 'Feature' }} />)

        expect(getLastCallProps().name).toBe('Feature')
    })

    it('passes customDashboardChartSchema to ReportingMetricBreakdownTable', () => {
        mockUsePerformanceMetricsPerFeature.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        const customDashboardChartSchema: DashboardChartSchema = {
            config_id: 'chart-1',
            type: DashboardChildType.Chart,
        }

        render(
            <PerformanceBreakdownTable
                customDashboardChartSchema={customDashboardChartSchema}
            />,
        )

        expect(getLastCallProps().customDashboardChartSchema).toBe(
            customDashboardChartSchema,
        )
    })

    it('passes onSaveColumns from useCustomDashboardTableColumns to ReportingMetricBreakdownTable', () => {
        mockUsePerformanceMetricsPerFeature.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        const onSaveColumns = jest.fn()
        mockUseCustomDashboardTableColumns.mockReturnValue({ onSaveColumns })

        render(
            <PerformanceBreakdownTable
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
