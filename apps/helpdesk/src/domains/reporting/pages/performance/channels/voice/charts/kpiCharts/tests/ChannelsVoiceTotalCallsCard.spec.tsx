import { TrendCard } from '@repo/reporting'
import type { MetricTooltipConfig, MetricTrendFormat } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import type {
    ChartConfig,
    DashboardChartProps,
} from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { ChannelsVoiceTotalCallsCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceTotalCallsCard'

jest.mock('domains/reporting/hooks/useReportingTrendCardProps')
const mockUseReportingTrendCardProps = assumeMock(useReportingTrendCardProps)

jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    TrendCard: jest.fn(() => null),
}))
const mockTrendCard = assumeMock(TrendCard)

const mockDashboard = {
    id: 1,
    name: 'Test Dashboard',
    analytics_filter_id: 1,
    children: [],
    emoji: '🚀',
}

const createTrendCardProps = ({
    label,
    value,
    prevValue,
    tooltipConfig,
    metricFormat,
}: {
    label: string
    value: number
    prevValue: number
    tooltipConfig: MetricTooltipConfig
    metricFormat: MetricTrendFormat
}) => ({
    trend: {
        isFetching: false,
        isError: false,
        data: {
            label,
            value,
            prevValue,
        },
    },
    isLoading: false,
    metricFormat,
    interpretAs: 'more-is-better' as const,
    trendBadgeTooltipData: { period: 'Test Period' },
    withBorder: true,
    withFixedWidth: false,
    hint: tooltipConfig,
    actionMenu: undefined,
    drillDown: undefined,
    timeSeriesView: undefined,
})

const createChartConfig = ({
    Component,
    label,
    tooltipConfig,
    metricFormat,
}: {
    Component: (props: DashboardChartProps) => React.JSX.Element
    label: string
    tooltipConfig: MetricTooltipConfig
    metricFormat: MetricTrendFormat
}): ChartConfig => ({
    chartComponent: Component,
    label,
    csvProducer: null,
    tooltipConfig,
    chartType: ChartType.Card,
    metricFormat,
    interpretAs: 'more-is-better',
})

type TestCase = {
    name: string
    Component: (props: DashboardChartProps) => JSX.Element
    config: {
        label: string
        tooltipConfig: MetricTooltipConfig
        metricFormat: MetricTrendFormat
        value: number
        prevValue: number
    }
    drillDownMetricName?: string
    timeSeriesView?: Record<string, unknown>
}

describe('Performance Channels Voice Trend Cards', () => {
    const testCases = [
        {
            name: 'ChannelsVoiceTotalCallsCard',
            Component: ChannelsVoiceTotalCallsCard,
            config: {
                label: 'Total calls',
                tooltipConfig: {
                    title: 'Total calls',
                    caption:
                        'Total number of inbound and outbound calls during the selected period.',
                },
                metricFormat: 'decimal',
                value: 1234,
                prevValue: 1000,
            },
        },
    ] as TestCase[]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe.each(testCases)(
        '$name',
        ({ Component, config, drillDownMetricName, timeSeriesView }) => {
            const chartConfig = createChartConfig({
                Component,
                label: config.label,
                tooltipConfig: config.tooltipConfig,
                metricFormat: config.metricFormat,
            })

            const trendCardProps = createTrendCardProps({
                label: config.label,
                value: config.value,
                prevValue: config.prevValue,
                tooltipConfig: config.tooltipConfig,
                metricFormat: config.metricFormat,
            })

            beforeEach(() => {
                mockUseReportingTrendCardProps.mockReturnValue(trendCardProps)
            })

            it('should call useReportingTrendCardProps with correct arguments', () => {
                render(
                    <Component
                        chartConfig={chartConfig}
                        chartId="test-chart-id"
                        dashboard={mockDashboard}
                    />,
                )

                expect(mockUseReportingTrendCardProps).toHaveBeenCalledWith({
                    chartConfig,
                    chartId: 'test-chart-id',
                    dashboard: mockDashboard,
                    useTrend: expect.any(Function),
                    isAiAgentTrendCard: false,
                    ...(drillDownMetricName ? { drillDownMetricName } : {}),
                    ...(timeSeriesView ? { timeSeriesView } : {}),
                })
            })

            it('should pass useReportingTrendCardProps result to TrendCard', () => {
                render(
                    <Component
                        chartConfig={chartConfig}
                        chartId="test-chart-id"
                        dashboard={mockDashboard}
                    />,
                )

                expect(mockTrendCard).toHaveBeenCalledWith(trendCardProps, {})
            })
        },
    )
})
