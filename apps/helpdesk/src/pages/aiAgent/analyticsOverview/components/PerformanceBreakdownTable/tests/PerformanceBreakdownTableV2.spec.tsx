import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { PERFORMANCE_BREAKDOWN_COLUMNS_V2 } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'
import { PerformanceBreakdownTableV2 } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/PerformanceBreakdownTableV2'
import type { FeatureMetrics } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/DownloadPerformanceBreakdownV2Button',
    () => ({
        DownloadPerformanceBreakdownV2Button: () => (
            <div>Download Performance Breakdown V2</div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeatureV2',
)

jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

const mockUsePerformanceMetricsPerFeatureV2 = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeatureV2',
).usePerformanceMetricsPerFeatureV2 as jest.Mock

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
    mockUsePerformanceMetricsPerFeatureV2.mockReturnValue({
        data,
        loadingStates,
    })
    return render(<PerformanceBreakdownTableV2 />)
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
        nameColumns: { accessor: string; label: string }[]
    }

describe('PerformanceBreakdownTableV2', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes data from usePerformanceMetricsPerFeatureV2 to ReportingMetricBreakdownTable', () => {
        renderComponent()

        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes loadingStates from the hook', () => {
        renderComponent()

        expect(getLastCallProps().loadingStates).toBe(defaultLoadingStates)
    })

    it('passes PERFORMANCE_BREAKDOWN_COLUMNS_V2 as metricColumns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(
            PERFORMANCE_BREAKDOWN_COLUMNS_V2,
        )
    })

    it('passes nameColumns with feature accessor and Feature label', () => {
        renderComponent()

        expect(getLastCallProps().nameColumns[0]).toEqual({
            accessor: 'feature',
            label: 'Feature',
        })
    })

    it('renders DownloadPerformanceBreakdownV2Button as the DownloadButton', () => {
        renderComponent()

        expect(
            screen.getByText('Download Performance Breakdown V2'),
        ).toBeInTheDocument()
    })

    it('defaults data to empty array when hook returns undefined data', () => {
        mockUsePerformanceMetricsPerFeatureV2.mockReturnValue({
            data: undefined,
            loadingStates: defaultLoadingStates,
        })
        render(<PerformanceBreakdownTableV2 />)

        expect(getLastCallProps().data).toEqual([])
    })

    it('passes actionMenu to ReportingMetricBreakdownTable when chartId and withChartMenu are provided', () => {
        mockUsePerformanceMetricsPerFeatureV2.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <PerformanceBreakdownTableV2
                chartId="performance_breakdown_table_v2"
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
        mockUsePerformanceMetricsPerFeatureV2.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <PerformanceBreakdownTableV2
                chartId="performance_breakdown_table_v2"
                withChartMenu={false}
            />,
        )

        expect(getLastCallProps().actionMenu).toBeUndefined()
    })
})
