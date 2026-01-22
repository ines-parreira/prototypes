import { SLA_TREND_FILENAME } from 'domains/reporting/hooks/sla/useDownloadSLAsData'
import { fetchSatisfiedOrBreachedVoiceCallsTimeSeries } from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedVoiceCallsTimeSeries'
import type { StaticFilter } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import {
    AchievedAndBreachedVoiceCallsChart,
    CHART_TITLE,
    HINT,
} from 'domains/reporting/pages/sla/components/AchievedAndBreachedVoiceCallsChart'
import { STATS_ROUTES } from 'routes/constants'

export const VOICE_SERVICE_LEVEL_AGREEMENT_PAGE_TITLE = 'Voice SLAs'

export enum VoiceServiceLevelAgreementsChart {
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
            [VoiceServiceLevelAgreementsChart.AchievedAndBreachedVoiceCallsChart]:
                {
                    chartComponent: AchievedAndBreachedVoiceCallsChart,
                    label: CHART_TITLE,
                    description: HINT,
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
