import { TrendCard } from '@repo/reporting'
import type { MetricTooltipConfig, MetricTrendFormat } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import type {
    ChartConfig,
    DashboardChartProps,
} from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { ChannelsVoiceAverageTalkTimeCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceAverageTalkTimeCard'
import { ChannelsVoiceAverageWaitTimeCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceAverageWaitTimeCard'
import { ChannelsVoiceInboundCallsCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceInboundCallsCard'
import { ChannelsVoiceMissedCallsCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceMissedCallsCard'
import { ChannelsVoiceOutboundCallsCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceOutboundCallsCard'
import { ChannelsVoiceTicketsCreatedCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceTicketsCreatedCard'
import { ChannelsVoiceTotalCallsCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceTotalCallsCard'
import { ChannelsVoiceUnansweredCallsCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceUnansweredCallsCard'

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

describe('Performance Channels Voice Trend Cards', () => {
    const timeSeriesView = { queryFactory: expect.any(Function) }

    const testCases = [
        {
            name: 'ChannelsVoiceTicketsCreatedCard',
            Component: ChannelsVoiceTicketsCreatedCard,
            config: {
                label: METRIC_TOOLTIPS.voiceTicketsCreated.title,
                tooltipConfig: METRIC_TOOLTIPS.voiceTicketsCreated,
                metricFormat: 'decimal',
                value: 420,
                prevValue: 380,
            },
            timeSeriesView,
        },
        {
            name: 'ChannelsVoiceTotalCallsCard',
            Component: ChannelsVoiceTotalCallsCard,
            config: {
                label: METRIC_TOOLTIPS.voiceTotalCalls.title,
                tooltipConfig: METRIC_TOOLTIPS.voiceTotalCalls,
                metricFormat: 'decimal',
                value: 1234,
                prevValue: 1000,
            },
            timeSeriesView: {
                ...timeSeriesView,
                measureName: 'voiceCallsCount',
            },
        },
        {
            name: 'ChannelsVoiceOutboundCallsCard',
            Component: ChannelsVoiceOutboundCallsCard,
            config: {
                label: METRIC_TOOLTIPS.voiceOutboundCalls.title,
                tooltipConfig: METRIC_TOOLTIPS.voiceOutboundCalls,
                metricFormat: 'decimal',
                value: 500,
                prevValue: 450,
            },
            timeSeriesView: {
                ...timeSeriesView,
                measureName: 'outboundCallsCount',
            },
        },
        {
            name: 'ChannelsVoiceInboundCallsCard',
            Component: ChannelsVoiceInboundCallsCard,
            config: {
                label: METRIC_TOOLTIPS.voiceInboundCalls.title,
                tooltipConfig: METRIC_TOOLTIPS.voiceInboundCalls,
                metricFormat: 'decimal',
                value: 734,
                prevValue: 550,
            },
            timeSeriesView: {
                ...timeSeriesView,
                measureName: 'inboundCallsCount',
            },
        },
        {
            name: 'ChannelsVoiceUnansweredCallsCard',
            Component: ChannelsVoiceUnansweredCallsCard,
            config: {
                label: METRIC_TOOLTIPS.voiceUnansweredCalls.title,
                tooltipConfig: METRIC_TOOLTIPS.voiceUnansweredCalls,
                metricFormat: 'decimal',
                value: 120,
                prevValue: 150,
            },
            timeSeriesView: {
                ...timeSeriesView,
                measureName: 'inboundUnansweredCallsCount',
            },
        },
        {
            name: 'ChannelsVoiceMissedCallsCard',
            Component: ChannelsVoiceMissedCallsCard,
            config: {
                label: METRIC_TOOLTIPS.voiceMissedCalls.title,
                tooltipConfig: METRIC_TOOLTIPS.voiceMissedCalls,
                metricFormat: 'decimal',
                value: 80,
                prevValue: 95,
            },
            timeSeriesView: {
                ...timeSeriesView,
                measureName: 'inboundMissedCallsCount',
            },
        },
        {
            name: 'ChannelsVoiceAverageTalkTimeCard',
            Component: ChannelsVoiceAverageTalkTimeCard,
            config: {
                label: METRIC_TOOLTIPS.voiceAverageTalkTime.title,
                tooltipConfig: METRIC_TOOLTIPS.voiceAverageTalkTime,
                metricFormat: 'duration',
                value: 245,
                prevValue: 260,
            },
            timeSeriesView,
        },
        {
            name: 'ChannelsVoiceAverageWaitTimeCard',
            Component: ChannelsVoiceAverageWaitTimeCard,
            config: {
                label: METRIC_TOOLTIPS.voiceAverageWaitTime.title,
                tooltipConfig: METRIC_TOOLTIPS.voiceAverageWaitTime,
                metricFormat: 'duration',
                value: 30,
                prevValue: 45,
            },
            timeSeriesView,
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
