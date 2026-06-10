import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { getStatsTrendFetch } from 'domains/reporting/hooks/useStatsMetricTrend'
import { channelsVoiceTotalCallsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/voiceCalls'
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
import { ChannelsVoiceTotalCallsCard } from 'domains/reporting/pages/performance/channels/voice/charts/kpiCharts/ChannelsVoiceTotalCallsCard'
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
    TotalCallsCard = 'performance-channels-voice-total-calls-card',
}

export const ChannelsVoiceReportConfig: ReportConfig<PerformanceChannelsVoiceChart> =
    {
        id: ReportsIDs.PerformanceChannelsVoiceReportConfig,
        reportName: 'Channels',
        reportPath: STATS_ROUTES.PERFORMANCE_CHANNELS,
        charts: {
            [PerformanceChannelsVoiceChart.TotalCallsCard]: {
                chartComponent: ChannelsVoiceTotalCallsCard,
                label: METRIC_TOOLTIPS.voiceTotalCalls.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsVoiceTotalCallsValueQueryFactoryV2,
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.voiceTotalCalls,
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
        },
        reportFilters: {
            optional: CHANNELS_VOICE_OPTIONAL_FILTERS,
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
