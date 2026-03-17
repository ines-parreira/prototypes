import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render, screen } from '@testing-library/react'

import { PERFORMANCE_BREAKDOWN_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'
import { PerformanceBreakdownTable } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/PerformanceBreakdownTable'
import type {
    FeatureMetrics,
    PerformanceMetricsPerFeature,
} from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'

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
    }),
)

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature',
)

const mockUsePerformanceMetricsPerFeature = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature',
).usePerformanceMetricsPerFeature as jest.Mock

const defaultLoadingStates: PerformanceMetricsPerFeature['loadingStates'] = {
    automationRate: false,
    automatedInteractions: false,
    handoverInteractions: false,
    timeSaved: false,
    costSaved: false,
}

const defaultData: FeatureMetrics[] = [
    {
        feature: 'AI Agent' as const,
        automationRate: 18,
        automatedInteractions: 2700,
        handoverInteractions: 189,
        costSaved: 1200,
        timeSaved: 9900,
    },
    {
        feature: 'Flows' as const,
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
    mockUsePerformanceMetricsPerFeature.mockReturnValue({ data, loadingStates })
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
        nameColumn: { accessor: string; label: string }
    }

describe('PerformanceBreakdownTable', () => {
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

    it('passes getRowKey that returns the feature value', () => {
        renderComponent()

        const { getRowKey } = getLastCallProps()
        expect(getRowKey(defaultData[0])).toBe('AI Agent')
    })

    it('passes nameColumn with feature accessor and Feature label', () => {
        renderComponent()

        expect(getLastCallProps().nameColumn).toEqual({
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
})
