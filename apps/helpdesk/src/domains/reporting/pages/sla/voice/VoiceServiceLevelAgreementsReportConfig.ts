import { SLA_TREND_FILENAME } from 'domains/reporting/hooks/sla/useDownloadSLAsData'
import { fetchSatisfiedOrBreachedVoiceCallsTimeSeries } from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedVoiceCallsTimeSeries'
import {
    fetchBreachedSlaVoiceCallsTrend,
    fetchSlaAchievementRateVoiceCallsTrend,
} from 'domains/reporting/hooks/sla/useSLAsVoiceCallsTrends'
import type { StaticFilter } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import {
    ACHIEVED_AND_BREACHED_CALLS_CHART_HINT,
    ACHIEVED_AND_BREACHED_CALLS_CHART_TITLE,
    AchievedAndBreachedVoiceCallsChart,
} from 'domains/reporting/pages/sla/components/AchievedAndBreachedVoiceCallsChart'
import { BreachedVoiceCallsRateTrendCard } from 'domains/reporting/pages/sla/components/BreachedVoiceCallsRateTrendCard'
import { VoiceAchievementRateTrendCard } from 'domains/reporting/pages/sla/components/VoiceAchievementRateTrendCard'
import { VoiceSlaMetricConfig } from 'domains/reporting/pages/sla/voice/VoiceSlaConfig'
import {
    ACHIEVEMENT_RATE_LABEL,
    BREACHED_SLA_LABEL,
    CALLS_WITH_BREACHED_SLAS_LABEL,
} from 'domains/reporting/services/constants'
import { VoiceSlaMetric } from 'domains/reporting/state/ui/stats/types'
import { STATS_ROUTES } from 'routes/constants'

export const VOICE_SERVICE_LEVEL_AGREEMENT_PAGE_TITLE = 'Calls SLAs'

export enum VoiceServiceLevelAgreementsChart {
    AchievementRateTrend = 'calls-achievement-rate-trend',
    BreachedVoiceCallsRateTrend = 'breached-voice-calls-rate-trend',
    AchievedAndBreachedVoiceCallsChart = 'achieved-and-breached-voice-calls-chart',
}

export const VOICE_SERVICE_LEVEL_OPTIONAL_FILTERS = [
    FilterKey.Integrations,
    FilterKey.VoiceQueues,
    FilterKey.Stores,
    FilterKey.Tags,
]

export const VOICE_SERVICE_LEVEL_PERSISTENT_FILTERS = [
    FilterKey.Period,
    FilterKey.AggregationWindow,
] satisfies StaticFilter[]

export const VoiceServiceLevelAgreementsReportConfig: ReportConfig<VoiceServiceLevelAgreementsChart> =
    {
        id: ReportsIDs.VoiceServiceLevelAgreementsReportConfig,
        reportName: VOICE_SERVICE_LEVEL_AGREEMENT_PAGE_TITLE,
        reportPath: `${STATS_ROUTES.SUPPORT_PERFORMANCE_SERVICE_LEVEL_AGREEMENT}/voice`,
        reportFilters: {
            optional: VOICE_SERVICE_LEVEL_OPTIONAL_FILTERS,
            persistent: VOICE_SERVICE_LEVEL_PERSISTENT_FILTERS,
        },
        charts: {
            [VoiceServiceLevelAgreementsChart.AchievementRateTrend]: {
                chartComponent: VoiceAchievementRateTrendCard,
                label: VoiceSlaMetricConfig[
                    VoiceSlaMetric.VoiceCallsAchievementRate
                ].title,
                description:
                    VoiceSlaMetricConfig[
                        VoiceSlaMetric.VoiceCallsAchievementRate
                    ].hint.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchSlaAchievementRateVoiceCallsTrend,
                        title: ACHIEVEMENT_RATE_LABEL,
                        metricFormat:
                            VoiceSlaMetricConfig[
                                VoiceSlaMetric.VoiceCallsAchievementRate
                            ].metricFormat,
                    },
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchBreachedSlaVoiceCallsTrend,
                        title: CALLS_WITH_BREACHED_SLAS_LABEL,
                        metricFormat:
                            VoiceSlaMetricConfig[
                                VoiceSlaMetric.VoiceCallsBreachedRate
                            ].metricFormat,
                    },
                ],
                chartType: ChartType.Card,
            },
            [VoiceServiceLevelAgreementsChart.BreachedVoiceCallsRateTrend]: {
                chartComponent: BreachedVoiceCallsRateTrendCard,
                label: VoiceSlaMetricConfig[
                    VoiceSlaMetric.VoiceCallsBreachedRate
                ].title,
                description:
                    VoiceSlaMetricConfig[VoiceSlaMetric.VoiceCallsBreachedRate]
                        .hint.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchBreachedSlaVoiceCallsTrend,
                        title: BREACHED_SLA_LABEL,
                        metricFormat:
                            VoiceSlaMetricConfig[
                                VoiceSlaMetric.VoiceCallsBreachedRate
                            ].metricFormat,
                    },
                ],
                chartType: ChartType.Card,
            },
            [VoiceServiceLevelAgreementsChart.AchievedAndBreachedVoiceCallsChart]:
                {
                    chartComponent: AchievedAndBreachedVoiceCallsChart,
                    label: ACHIEVED_AND_BREACHED_CALLS_CHART_TITLE,
                    description: ACHIEVED_AND_BREACHED_CALLS_CHART_HINT,
                    csvProducer: [
                        {
                            type: DataExportFormat.TimeSeries,
                            fetch: fetchSatisfiedOrBreachedVoiceCallsTimeSeries,
                            title: SLA_TREND_FILENAME,
                        },
                    ],
                    chartType: ChartType.Graph,
                },
        },
    }
