import { FilterComponentKey, FilterKey, StaticFilter } from 'models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import { OptionalFilter } from 'pages/stats/common/filters/FiltersPanel'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'pages/stats/custom-reports/types'
import { VoiceCallCallCallerExperiencAverageTalkTime } from 'pages/stats/voice/charts/VoiceCallCallerExperiencAverageTalkTime'
import { VoiceCallCallerExperienceAverageWaitTimeChart } from 'pages/stats/voice/charts/VoiceCallCallerExperienceAverageWaitTimeChart'
import { VoiceCallTableChart } from 'pages/stats/voice/charts/VoiceCallTableChart'
import { VoiceCallVolumeMetricInboundCallsCountTrend } from 'pages/stats/voice/charts/VoiceCallVolumeMetricInboundCallsCountTrendChart'
import { VoiceCallVolumeMetricMissedCallsCountTrendChart } from 'pages/stats/voice/charts/VoiceCallVolumeMetricMissedCallsCountTrendChart'
import { VoiceCallVolumeMetricOutboundCallsCountTrend } from 'pages/stats/voice/charts/VoiceCallVolumeMetricOutboundCallsCountTrend'
import { VoiceCallVolumeTotalCallCountTrendChart } from 'pages/stats/voice/charts/VoiceCallVolumeTotalCallCountTrendChart'
import {
    AVERAGE_TALK_TIME_METRIC_HINT,
    AVERAGE_TALK_TIME_METRIC_TITLE,
    AVERAGE_WAIT_TIME_METRIC_HINT,
    AVERAGE_WAIT_TIME_METRIC_TITLE,
    CALL_LIST_HINT,
    CALL_LIST_TITLE,
    INBOUND_CALLS_METRIC_HINT,
    INBOUND_CALLS_METRIC_TITLE,
    MISSED_CALLS_METRIC_HINT,
    MISSED_CALLS_METRIC_TITLE,
    OUTBOUND_CALLS_METRIC_HINT,
    OUTBOUND_CALLS_METRIC_TITLE,
    TOTAL_CALLS_METRIC_HINT,
    TOTAL_CALLS_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import {
    fetchVoiceCallAverageTimeTalkTimeTrend,
    fetchVoiceCallAverageTimeWaitTimeTrend,
} from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import {
    fetchVoiceCallCountInboundTrend,
    fetchVoiceCallCountMissedTrend,
    fetchVoiceCallCountOutboundTrend,
    fetchVoiceCallCountTrend,
} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import { STATS_ROUTES } from 'routes/constants'

export const VOICE_OVERVIEW_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
]
export const VOICE_OVERVIEW_OPTIONAL_FILTERS: OptionalFilter[] = [
    FilterComponentKey.PhoneIntegrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.Score,
    ...AUTO_QA_FILTER_KEYS,
]

export enum VoiceOverviewChart {
    VoiceCallCallerExperienceAverageWaitTimeChart = 'VoiceCallCallerExperienceAverageWaitTimeChart',
    VoiceCallCallCallerExperienceAverageTalkTime = 'VoiceCallCallCallerExperienceAverageTalkTime',
    VoiceCallVolumeTotalCallCountTrendChart = 'VoiceCallVolumeTotalCallCountTrendChart',
    VoiceCallVolumeMetricOutboundCallsCountTrend = 'VoiceCallVolumeMetricOutboundCallsCountTrend',
    VoiceCallVolumeMetricInboundCallsCountTrend = 'VoiceCallVolumeMetricInboundCallsCountTrend',
    VoiceCallVolumeMetricMissedCallsCountTrendChart = 'VoiceCallVolumeMetricMissedCallsCountTrendChart',
    VoiceCallTableChart = 'VoiceCallTableChart',
}

export const VoiceOverviewReportConfig: ReportConfig<VoiceOverviewChart> = {
    reportName: 'Voice Overview Report',
    reportPath: STATS_ROUTES.VOICE_OVERVIEW,
    charts: {
        [VoiceOverviewChart.VoiceCallCallerExperienceAverageWaitTimeChart]: {
            chartComponent: VoiceCallCallerExperienceAverageWaitTimeChart,
            label: AVERAGE_WAIT_TIME_METRIC_TITLE,
            description: AVERAGE_WAIT_TIME_METRIC_HINT,
            chartType: ChartType.Card,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: fetchVoiceCallAverageTimeWaitTimeTrend,
                    metricFormat: 'decimal',
                },
            ],
        },
        [VoiceOverviewChart.VoiceCallCallCallerExperienceAverageTalkTime]: {
            chartComponent: VoiceCallCallCallerExperiencAverageTalkTime,
            label: AVERAGE_TALK_TIME_METRIC_TITLE,
            description: AVERAGE_TALK_TIME_METRIC_HINT,
            chartType: ChartType.Card,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: fetchVoiceCallAverageTimeTalkTimeTrend,
                    metricFormat: 'decimal',
                },
            ],
        },
        [VoiceOverviewChart.VoiceCallVolumeTotalCallCountTrendChart]: {
            chartComponent: VoiceCallVolumeTotalCallCountTrendChart,
            label: TOTAL_CALLS_METRIC_TITLE,
            description: TOTAL_CALLS_METRIC_HINT,
            chartType: ChartType.Card,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: fetchVoiceCallCountTrend,
                    metricFormat: 'integer',
                },
            ],
        },
        [VoiceOverviewChart.VoiceCallVolumeMetricOutboundCallsCountTrend]: {
            chartComponent: VoiceCallVolumeMetricOutboundCallsCountTrend,
            label: OUTBOUND_CALLS_METRIC_TITLE,
            description: OUTBOUND_CALLS_METRIC_HINT,
            chartType: ChartType.Card,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: fetchVoiceCallCountOutboundTrend,
                    metricFormat: 'integer',
                },
            ],
        },
        [VoiceOverviewChart.VoiceCallVolumeMetricInboundCallsCountTrend]: {
            chartComponent: VoiceCallVolumeMetricInboundCallsCountTrend,
            label: INBOUND_CALLS_METRIC_TITLE,
            description: INBOUND_CALLS_METRIC_HINT,
            chartType: ChartType.Card,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: fetchVoiceCallCountInboundTrend,
                    metricFormat: 'integer',
                },
            ],
        },
        [VoiceOverviewChart.VoiceCallVolumeMetricMissedCallsCountTrendChart]: {
            chartComponent: VoiceCallVolumeMetricMissedCallsCountTrendChart,
            label: MISSED_CALLS_METRIC_TITLE,
            description: MISSED_CALLS_METRIC_HINT,
            chartType: ChartType.Card,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: fetchVoiceCallCountMissedTrend,
                    metricFormat: 'integer',
                },
            ],
        },
        [VoiceOverviewChart.VoiceCallTableChart]: {
            chartComponent: VoiceCallTableChart,
            label: CALL_LIST_TITLE,
            description: CALL_LIST_HINT,
            chartType: ChartType.Table,
            csvProducer: null,
        },
    },
    reportFilters: {
        persistent: VOICE_OVERVIEW_PERSISTENT_FILTERS,
        optional: VOICE_OVERVIEW_OPTIONAL_FILTERS,
    },
}
