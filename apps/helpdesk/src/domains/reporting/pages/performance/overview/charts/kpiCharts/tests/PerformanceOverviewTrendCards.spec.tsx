import { TrendCard } from '@repo/reporting'
import type { MetricTooltipConfig, MetricTrendFormat } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import type {
    ChartConfig,
    DashboardChartProps,
} from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { OverviewAverageCSATCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewAverageCSATCard'
import { OverviewClosedTicketsCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewClosedTicketsCard'
import { OverviewCreatedTicketsCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewCreatedTicketsCard'
import { OverviewFirstResponseTimeCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewFirstResponseTimeCard'
import { OverviewHumanResponseTimeAfterAiHandoffCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewHumanResponseTimeAfterAiHandoffCard'
import { OverviewMessagesPerTicketCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewMessagesPerTicketCard'
import { OverviewMessagesSentCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewMessagesSentCard'
import { OverviewResolutionTimeCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewResolutionTimeCard'
import { OverviewTicketsRepliedCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewTicketsRepliedCard'

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

describe('Performance Overview Trend Cards', () => {
    const testCases = [
        {
            name: 'OverviewAverageCSATCard',
            Component: OverviewAverageCSATCard,
            config: {
                label: 'Average CSAT',
                tooltipConfig: {
                    title: 'Average CSAT',
                    caption:
                        'Average CSAT score and rating distribution for surveys sent within the timeframe.',
                },
                metricFormat: 'decimal',
                value: 4.5,
                prevValue: 4.2,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'OverviewResolutionTimeCard',
            Component: OverviewResolutionTimeCard,
            config: {
                label: 'Resolution time',
                tooltipConfig: {
                    title: 'Resolution time',
                    caption:
                        'Median time to fully resolve a ticket from creation to close during the selected period.',
                },
                metricFormat: 'duration',
                value: 3600,
                prevValue: 4200,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'OverviewMessagesPerTicketCard',
            Component: OverviewMessagesPerTicketCard,
            config: {
                label: 'Messages per ticket',
                tooltipConfig: {
                    title: 'Messages per ticket',
                    caption:
                        'Average number of messages exchanged per ticket during the selected period.',
                },
                metricFormat: 'decimal',
                value: 3.4,
                prevValue: 3.8,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'OverviewFirstResponseTimeCard',
            Component: OverviewFirstResponseTimeCard,
            config: {
                label: 'First response time',
                tooltipConfig: {
                    title: 'First response time',
                    caption:
                        'Median time from ticket creation to the first agent response during the selected period.',
                },
                metricFormat: 'duration',
                value: 1800,
                prevValue: 2400,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'OverviewHumanResponseTimeAfterAiHandoffCard',
            Component: OverviewHumanResponseTimeAfterAiHandoffCard,
            config: {
                label: 'Human response time after AI handoff',
                tooltipConfig: {
                    title: 'Human response time after AI handoff',
                    caption:
                        'Median time from an AI Agent handoff to the first human agent response during the selected period.',
                },
                metricFormat: 'duration',
                value: 1200,
                prevValue: 1500,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'OverviewCreatedTicketsCard',
            Component: OverviewCreatedTicketsCard,
            config: {
                label: 'Created tickets',
                tooltipConfig: {
                    title: 'Created tickets',
                    caption:
                        'Total number of tickets created during the selected period.',
                },
                metricFormat: 'decimal',
                value: 320,
                prevValue: 280,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'OverviewClosedTicketsCard',
            Component: OverviewClosedTicketsCard,
            config: {
                label: 'Closed tickets',
                tooltipConfig: {
                    title: 'Closed tickets',
                    caption:
                        'Total number of tickets closed during the selected period.',
                },
                metricFormat: 'decimal',
                value: 290,
                prevValue: 250,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'OverviewTicketsRepliedCard',
            Component: OverviewTicketsRepliedCard,
            config: {
                label: 'Tickets replied',
                tooltipConfig: {
                    title: 'Tickets replied',
                    caption:
                        'Total number of tickets that received at least one agent reply during the selected period.',
                },
                metricFormat: 'decimal',
                value: 305,
                prevValue: 270,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'OverviewMessagesSentCard',
            Component: OverviewMessagesSentCard,
            config: {
                label: 'Messages sent',
                tooltipConfig: {
                    title: 'Messages sent',
                    caption:
                        'Total number of messages sent by agents during the selected period.',
                },
                metricFormat: 'decimal',
                value: 980,
                prevValue: 870,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
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
                render(<Component chartConfig={chartConfig} />)

                expect(mockTrendCard).toHaveBeenCalledWith(trendCardProps, {})
            })
        },
    )
})
