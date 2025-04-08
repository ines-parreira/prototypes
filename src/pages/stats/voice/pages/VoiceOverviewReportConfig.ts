import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { FilterComponentKey, FilterKey, StaticFilter } from 'models/stat/types'
import { OptionalFilter } from 'pages/stats/common/filters/FiltersPanel'
import { ReportsIDs } from 'pages/stats/dashboards/constants'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'pages/stats/dashboards/types'
import { VoiceCallCallerExperienceAverageTalkTime } from 'pages/stats/voice/charts/VoiceCallCallerExperienceAverageTalkTime'
import { VoiceCallCallerExperienceAverageWaitTimeChart } from 'pages/stats/voice/charts/VoiceCallCallerExperienceAverageWaitTimeChart'
import { VoiceCallTableChart } from 'pages/stats/voice/charts/VoiceCallTableChart'
import { VoiceCallVolumeMetricInboundCallsCountTrend } from 'pages/stats/voice/charts/VoiceCallVolumeMetricInboundCallsCountTrendChart'
import { VoiceCallVolumeMetricOutboundCallsCountTrend } from 'pages/stats/voice/charts/VoiceCallVolumeMetricOutboundCallsCountTrend'
import { VoiceCallVolumeTotalCallCountTrendChart } from 'pages/stats/voice/charts/VoiceCallVolumeTotalCallCountTrendChart'
import {
    ABANDONED_CALLS_METRIC_HINT,
    ABANDONED_CALLS_METRIC_TITLE,
    AVERAGE_TALK_TIME_METRIC_HINT,
    AVERAGE_TALK_TIME_METRIC_TITLE,
    AVERAGE_WAIT_TIME_METRIC_HINT,
    AVERAGE_WAIT_TIME_METRIC_TITLE,
    CALL_LIST_HINT,
    CALL_LIST_TITLE,
    CANCELLED_CALLS_METRIC_HINT,
    CANCELLED_CALLS_METRIC_TITLE,
    INBOUND_CALLS_METRIC_HINT,
    INBOUND_CALLS_METRIC_TITLE,
    MISSED_CALLS_METRIC_HINT,
    MISSED_CALLS_METRIC_TITLE,
    OUTBOUND_CALLS_METRIC_HINT,
    OUTBOUND_CALLS_METRIC_TITLE,
    TOTAL_CALLS_METRIC_HINT,
    TOTAL_CALLS_METRIC_TITLE,
    UNANSWERED_CALLS_METRIC_HINT,
    UNANSWERED_CALLS_METRIC_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import {
    fetchVoiceCallAverageTimeTalkTimeTrend,
    fetchVoiceCallAverageTimeWaitTimeTrend,
} from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import {
    fetchVoiceCallCountInboundTrend,
    fetchVoiceCallCountOutboundTrend,
    fetchVoiceCallCountTrend,
} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import { STATS_ROUTES } from 'routes/constants'

import { VoiceCallVolumeMetricCallsCountTrendChart } from '../charts/VoiceCallVolumeMetricCallsCountTrendChart'

export const VOICE_OVERVIEW_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
]
export const VOICE_OVERVIEW_OPTIONAL_FILTERS: OptionalFilter[] = [
    FilterComponentKey.PhoneIntegrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.VoiceQueues,
]

export enum VoiceOverviewChart {
    VoiceCallCallerExperienceAverageWaitTimeChart = 'VoiceCallCallerExperienceAverageWaitTimeChart',
    VoiceCallCallerExperienceAverageTalkTime = 'VoiceCallCallerExperienceAverageTalkTime',
    VoiceCallVolumeTotalCallCountTrendChart = 'VoiceCallVolumeTotalCallCountTrendChart',
    VoiceCallVolumeMetricOutboundCallsCountTrend = 'VoiceCallVolumeMetricOutboundCallsCountTrend',
    VoiceCallVolumeMetricInboundCallsCountTrend = 'VoiceCallVolumeMetricInboundCallsCountTrend',
    VoiceCallVolumeMetricUnansweredCallsCountTrendChart = 'VoiceCallVolumeMetricUnansweredCallsCountTrendChart',
    VoiceCallVolumeMetricMissedCallsCountTrendChart = 'VoiceCallVolumeMetricMissedCallsCountTrendChart',
    VoiceCallVolumeMetricAbandonedCallsCountTrendChart = 'VoiceCallVolumeMetricAbandonedCallsCountTrendChart',
    VoiceCallVolumeMetricCancelledCallsCountTrendChart = 'VoiceCallVolumeMetricCancelledCallsCountTrendChart',
    VoiceCallTableChart = 'VoiceCallTableChart',
}

export const VoiceOverviewReportConfig: ReportConfig<VoiceOverviewChart> = {
    id: ReportsIDs.VoiceOverviewReportConfig,
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
        [VoiceOverviewChart.VoiceCallCallerExperienceAverageTalkTime]: {
            chartComponent: VoiceCallCallerExperienceAverageTalkTime,
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
                    fetch: (filters, timezone) =>
                        fetchVoiceCallCountTrend(filters, timezone),
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
        [VoiceOverviewChart.VoiceCallVolumeMetricUnansweredCallsCountTrendChart]:
            {
                chartComponent: ({ chartId, dashboard }) =>
                    VoiceCallVolumeMetricCallsCountTrendChart({
                        chartId,
                        dashboard,
                        title: UNANSWERED_CALLS_METRIC_TITLE,
                        hint: UNANSWERED_CALLS_METRIC_HINT,
                        segment: VoiceCallSegment.inboundUnansweredCalls,
                    }),
                label: UNANSWERED_CALLS_METRIC_TITLE,
                description: UNANSWERED_CALLS_METRIC_HINT,
                chartType: ChartType.Card,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: (filters, timezone) =>
                            fetchVoiceCallCountTrend(
                                filters,
                                timezone,
                                VoiceCallSegment.inboundUnansweredCalls,
                            ),
                        metricFormat: 'integer',
                    },
                ],
            },
        [VoiceOverviewChart.VoiceCallVolumeMetricMissedCallsCountTrendChart]: {
            chartComponent: ({ chartId, dashboard }) =>
                VoiceCallVolumeMetricCallsCountTrendChart({
                    chartId,
                    dashboard,
                    title: MISSED_CALLS_METRIC_TITLE,
                    hint: MISSED_CALLS_METRIC_HINT,
                    segment: VoiceCallSegment.inboundMissedCalls,
                }),
            label: MISSED_CALLS_METRIC_TITLE,
            description: MISSED_CALLS_METRIC_HINT,
            chartType: ChartType.Card,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: (filters, timezone) =>
                        fetchVoiceCallCountTrend(
                            filters,
                            timezone,
                            VoiceCallSegment.inboundMissedCalls,
                        ),
                    metricFormat: 'integer',
                },
            ],
        },
        [VoiceOverviewChart.VoiceCallVolumeMetricAbandonedCallsCountTrendChart]:
            {
                chartComponent: ({ chartId, dashboard }) =>
                    VoiceCallVolumeMetricCallsCountTrendChart({
                        chartId,
                        dashboard,
                        title: ABANDONED_CALLS_METRIC_TITLE,
                        hint: ABANDONED_CALLS_METRIC_HINT,
                        segment: VoiceCallSegment.inboundAbandonedCalls,
                        hideWithAgentsFilter: true,
                    }),
                label: ABANDONED_CALLS_METRIC_TITLE,
                description: ABANDONED_CALLS_METRIC_HINT,
                chartType: ChartType.Card,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: (filters, timezone) =>
                            fetchVoiceCallCountTrend(
                                filters,
                                timezone,
                                VoiceCallSegment.inboundAbandonedCalls,
                            ),
                        metricFormat: 'integer',
                    },
                ],
            },
        [VoiceOverviewChart.VoiceCallVolumeMetricCancelledCallsCountTrendChart]:
            {
                chartComponent: ({ chartId, dashboard }) =>
                    VoiceCallVolumeMetricCallsCountTrendChart({
                        chartId,
                        dashboard,
                        title: CANCELLED_CALLS_METRIC_TITLE,
                        hint: CANCELLED_CALLS_METRIC_HINT,
                        segment: VoiceCallSegment.inboundCancelledCalls,
                        hideWithAgentsFilter: true,
                    }),
                label: CANCELLED_CALLS_METRIC_TITLE,
                description: CANCELLED_CALLS_METRIC_HINT,
                chartType: ChartType.Card,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: (filters, timezone) =>
                            fetchVoiceCallCountTrend(
                                filters,
                                timezone,
                                VoiceCallSegment.inboundCancelledCalls,
                            ),
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
