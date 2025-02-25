import { FilterComponentKey, FilterKey, StaticFilter } from 'models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import { OptionalFilter } from 'pages/stats/common/filters/FiltersPanel'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'pages/stats/custom-reports/types'
import { VoiceAgentsTableCard } from 'pages/stats/voice/components/VoiceAgentsTableCard'
import {
    VOICE_AGENTS_PAGE_TITLE,
    VOICE_CALL_ACTIVITY_HINT,
    VOICE_CALL_ACTIVITY_TITLE,
} from 'pages/stats/voice/constants/voiceAgents'
import { STATS_ROUTES } from 'routes/constants'
import { fetchVoiceAgentsReportData } from 'services/reporting/voiceAgentsReportingService'

export enum VoiceAgentsChart {
    VoiceAgentsTable = 'voice-agents-table',
}

export const VOICE_AGENTS_OPTIONAL_FILTERS: OptionalFilter[] = [
    FilterComponentKey.PhoneIntegrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.Score,
    ...AUTO_QA_FILTER_KEYS,
]

export const VOICE_AGENTS_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
]

export const VoiceAgentsReportConfig: ReportConfig<VoiceAgentsChart> = {
    reportName: VOICE_AGENTS_PAGE_TITLE,
    reportPath: STATS_ROUTES.VOICE_AGENTS,
    reportFilters: {
        optional: VOICE_AGENTS_OPTIONAL_FILTERS,
        persistent: VOICE_AGENTS_PERSISTENT_FILTERS,
    },
    charts: {
        [VoiceAgentsChart.VoiceAgentsTable]: {
            chartComponent: VoiceAgentsTableCard,
            label: VOICE_CALL_ACTIVITY_TITLE,
            description: VOICE_CALL_ACTIVITY_HINT,
            csvProducer: [
                {
                    type: DataExportFormat.Table,
                    fetch: fetchVoiceAgentsReportData,
                },
            ],
            chartType: ChartType.Table,
        },
    },
}
