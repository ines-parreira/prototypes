import {
    FilterComponentKey,
    FilterKey,
    StaticFilter,
} from 'domains/reporting/models/stat/types'
import { OptionalFilter } from 'domains/reporting/pages/common/filters/FiltersPanel'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'domains/reporting/pages/dashboards/types'
import { VoiceAgentsTableCard } from 'domains/reporting/pages/voice/components/VoiceAgentsTableCard'
import {
    VOICE_AGENTS_PAGE_TITLE,
    VOICE_CALL_ACTIVITY_HINT,
    VOICE_CALL_ACTIVITY_TITLE,
} from 'domains/reporting/pages/voice/constants/voiceAgents'
import { fetchVoiceAgentsReportData } from 'domains/reporting/services/voiceAgentsReportingService'
import { STATS_ROUTES } from 'routes/constants'

export enum VoiceAgentsChart {
    VoiceAgentsTable = 'voice-agents-table',
}

export const VOICE_AGENTS_OPTIONAL_FILTERS: OptionalFilter[] = [
    FilterComponentKey.PhoneIntegrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.Stores,
]

export const VOICE_AGENTS_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
]

export const VoiceAgentsReportConfig: ReportConfig<VoiceAgentsChart> = {
    id: ReportsIDs.VoiceAgentsReportConfig,
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
