import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { getStatsTrendFetch } from 'domains/reporting/hooks/useStatsMetricTrend'
import { channelsVoiceTicketsCreatedValueQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsCreated'
import {
    channelsVoiceAverageTalkTimeValueQueryFactoryV2,
    channelsVoiceAverageWaitTimeValueQueryFactoryV2,
    channelsVoiceCallOutcomeValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/voiceCalls'
import {
    FilterComponentKey,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import type { OptionalFilter } from 'domains/reporting/pages/common/filters/FiltersPanel'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { ChannelsVoiceConfigurableGraph } from 'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableGraph/ChannelsVoiceConfigurableGraph'
import { ChannelsVoiceAverageTalkTimeCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceAverageTalkTimeCard'
import { ChannelsVoiceAverageWaitTimeCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceAverageWaitTimeCard'
import { ChannelsVoiceInboundCallsCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceInboundCallsCard'
import { ChannelsVoiceMissedCallsCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceMissedCallsCard'
import { ChannelsVoiceOutboundCallsCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceOutboundCallsCard'
import { ChannelsVoiceTicketsCreatedCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceTicketsCreatedCard'
import { ChannelsVoiceTotalCallsCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceTotalCallsCard'
import { ChannelsVoiceUnansweredCallsCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceUnansweredCallsCard'
import { STATS_ROUTES } from 'routes/constants'

export const CHANNELS_VOICE_OPTIONAL_FILTERS: OptionalFilter[] = [
    FilterComponentKey.PhoneIntegrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.VoiceQueues,
    FilterKey.IsDuringBusinessHours,
    FilterKey.Stores,
    FilterKey.CustomFields,
]

export enum PerformanceChannelsVoiceChart {
    TicketsCreatedCard = 'performance-channels-voice-tickets-created-card',
    TotalCallsCard = 'performance-channels-voice-total-calls-card',
    ConfigurableGraph = 'performance-channels-voice-configurable-graph',
    OutboundCallsCard = 'performance-channels-voice-outbound-calls-card',
    InboundCallsCard = 'performance-channels-voice-inbound-calls-card',
    UnansweredCallsCard = 'performance-channels-voice-unanswered-calls-card',
    MissedCallsCard = 'performance-channels-voice-missed-calls-card',
    AverageTalkTimeCard = 'performance-channels-voice-average-talk-time-card',
    AverageWaitTimeCard = 'performance-channels-voice-average-wait-time-card',
}

export const ChannelsVoiceReportConfig: ReportConfig<PerformanceChannelsVoiceChart> =
    {
        id: ReportsIDs.PerformanceChannelsVoiceReportConfig,
        reportName: 'Channels > Voice',
        reportPath: STATS_ROUTES.PERFORMANCE_CHANNELS,
        charts: {
            [PerformanceChannelsVoiceChart.TicketsCreatedCard]: {
                chartComponent: ChannelsVoiceTicketsCreatedCard,
                label: METRIC_TOOLTIPS.voiceTicketsCreated.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsVoiceTicketsCreatedValueQueryFactoryV2,
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.voiceTicketsCreated,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [PerformanceChannelsVoiceChart.TotalCallsCard]: {
                chartComponent: ChannelsVoiceTotalCallsCard,
                label: METRIC_TOOLTIPS.voiceTotalCalls.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsVoiceCallOutcomeValueQueryFactoryV2,
                            'voiceCallsCount',
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.voiceTotalCalls,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [PerformanceChannelsVoiceChart.OutboundCallsCard]: {
                chartComponent: ChannelsVoiceOutboundCallsCard,
                label: METRIC_TOOLTIPS.voiceOutboundCalls.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsVoiceCallOutcomeValueQueryFactoryV2,
                            'outboundCallsCount',
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.voiceOutboundCalls,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [PerformanceChannelsVoiceChart.InboundCallsCard]: {
                chartComponent: ChannelsVoiceInboundCallsCard,
                label: METRIC_TOOLTIPS.voiceInboundCalls.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsVoiceCallOutcomeValueQueryFactoryV2,
                            'inboundCallsCount',
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.voiceInboundCalls,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [PerformanceChannelsVoiceChart.UnansweredCallsCard]: {
                chartComponent: ChannelsVoiceUnansweredCallsCard,
                label: METRIC_TOOLTIPS.voiceUnansweredCalls.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsVoiceCallOutcomeValueQueryFactoryV2,
                            'inboundUnansweredCallsCount',
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.voiceUnansweredCalls,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'less-is-better',
            },
            [PerformanceChannelsVoiceChart.MissedCallsCard]: {
                chartComponent: ChannelsVoiceMissedCallsCard,
                label: METRIC_TOOLTIPS.voiceMissedCalls.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsVoiceCallOutcomeValueQueryFactoryV2,
                            'inboundMissedCallsCount',
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.voiceMissedCalls,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'less-is-better',
            },
            [PerformanceChannelsVoiceChart.AverageTalkTimeCard]: {
                chartComponent: ChannelsVoiceAverageTalkTimeCard,
                label: METRIC_TOOLTIPS.voiceAverageTalkTime.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsVoiceAverageTalkTimeValueQueryFactoryV2,
                        ),
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.voiceAverageTalkTime,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'duration',
                interpretAs: 'neutral',
            },
            [PerformanceChannelsVoiceChart.AverageWaitTimeCard]: {
                chartComponent: ChannelsVoiceAverageWaitTimeCard,
                label: METRIC_TOOLTIPS.voiceAverageWaitTime.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsVoiceAverageWaitTimeValueQueryFactoryV2,
                        ),
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.voiceAverageWaitTime,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'duration',
                interpretAs: 'less-is-better',
            },
            [PerformanceChannelsVoiceChart.ConfigurableGraph]: {
                chartComponent: ChannelsVoiceConfigurableGraph,
                label: 'Call outcome',
                csvProducer: null,
                chartType: ChartType.Graph,
                metricFormat: 'decimal',
            },
        },
        reportFilters: {
            optional: CHANNELS_VOICE_OPTIONAL_FILTERS,
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
