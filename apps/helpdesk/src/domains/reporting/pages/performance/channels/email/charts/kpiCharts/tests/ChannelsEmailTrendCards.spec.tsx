import { TrendCard } from '@repo/reporting'
import type { MetricTooltipConfig, MetricTrendFormat } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import type {
    ChartConfig,
    DashboardChartProps,
} from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { ChannelsEmailAverageCSATCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailAverageCSATCard'
import { ChannelsEmailClosedTicketsCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailClosedTicketsCard'
import { ChannelsEmailCreatedTicketsCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailCreatedTicketsCard'
import { ChannelsEmailFirstResponseTimeCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailFirstResponseTimeCard'
import { ChannelsEmailHumanResponseTimeAfterAiHandoffCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailHumanResponseTimeAfterAiHandoffCard'
import { ChannelsEmailMessagesPerTicketCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailMessagesPerTicketCard'
import { ChannelsEmailMessagesSentCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailMessagesSentCard'
import { ChannelsEmailResolutionTimeCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailResolutionTimeCard'
import { ChannelsEmailTicketsRepliedCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailTicketsRepliedCard'

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
    chartType: ChartType.CardWithTimeseries,
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

describe('Performance Channels Email Trend Cards', () => {
    const testCases: TestCase[] = [
        {
            name: 'ChannelsEmailAverageCSATCard',
            Component: ChannelsEmailAverageCSATCard,
            config: {
                label: 'Average CSAT',
                tooltipConfig: {
                    title: 'Average CSAT',
                    caption: 'Average CSAT for email interactions.',
                },
                metricFormat: 'decimal',
                value: 4.5,
                prevValue: 4.2,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'ChannelsEmailResolutionTimeCard',
            Component: ChannelsEmailResolutionTimeCard,
            config: {
                label: 'Resolution time',
                tooltipConfig: {
                    title: 'Resolution time',
                    caption: 'Resolution time for email interactions.',
                },
                metricFormat: 'duration',
                value: 3600,
                prevValue: 4000,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'ChannelsEmailMessagesPerTicketCard',
            Component: ChannelsEmailMessagesPerTicketCard,
            config: {
                label: 'Messages per ticket',
                tooltipConfig: {
                    title: 'Messages per ticket',
                    caption: 'Messages per ticket for email interactions.',
                },
                metricFormat: 'decimal',
                value: 3.2,
                prevValue: 3.5,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'ChannelsEmailFirstResponseTimeCard',
            Component: ChannelsEmailFirstResponseTimeCard,
            config: {
                label: 'First response time',
                tooltipConfig: {
                    title: 'First response time',
                    caption: 'First response time for email interactions.',
                },
                metricFormat: 'duration',
                value: 1800,
                prevValue: 2000,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'ChannelsEmailHumanResponseTimeAfterAiHandoffCard',
            Component: ChannelsEmailHumanResponseTimeAfterAiHandoffCard,
            config: {
                label: 'Human response time after AI handoff',
                tooltipConfig: {
                    title: 'Human response time after AI handoff',
                    caption:
                        'Human response time after AI handoff for email interactions.',
                },
                metricFormat: 'duration',
                value: 1200,
                prevValue: 1500,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'ChannelsEmailCreatedTicketsCard',
            Component: ChannelsEmailCreatedTicketsCard,
            config: {
                label: 'Created tickets',
                tooltipConfig: {
                    title: 'Created tickets',
                    caption: 'Created tickets for email interactions.',
                },
                metricFormat: 'decimal',
                value: 120,
                prevValue: 100,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'ChannelsEmailClosedTicketsCard',
            Component: ChannelsEmailClosedTicketsCard,
            config: {
                label: 'Closed tickets',
                tooltipConfig: {
                    title: 'Closed tickets',
                    caption: 'Closed tickets for email interactions.',
                },
                metricFormat: 'decimal',
                value: 110,
                prevValue: 90,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'ChannelsEmailTicketsRepliedCard',
            Component: ChannelsEmailTicketsRepliedCard,
            config: {
                label: 'Tickets replied',
                tooltipConfig: {
                    title: 'Tickets replied',
                    caption: 'Tickets replied for email interactions.',
                },
                metricFormat: 'decimal',
                value: 95,
                prevValue: 85,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
        {
            name: 'ChannelsEmailMessagesSentCard',
            Component: ChannelsEmailMessagesSentCard,
            config: {
                label: 'Messages sent',
                tooltipConfig: {
                    title: 'Messages sent',
                    caption: 'Messages sent for email interactions.',
                },
                metricFormat: 'decimal',
                value: 300,
                prevValue: 250,
            },
            timeSeriesView: { queryFactory: expect.any(Function) },
        },
    ]

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
