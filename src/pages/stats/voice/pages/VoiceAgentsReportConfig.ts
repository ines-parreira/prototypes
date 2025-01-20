import {FilterComponentKey, FilterKey, StaticFilter} from 'models/stat/types'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'
import {ChartType, ReportConfig} from 'pages/stats/custom-reports/types'
import {VoiceAgentsTableCard} from 'pages/stats/voice/components/VoiceAgentsTableCard'
import {
    VOICE_AGENTS_PAGE_TITLE,
    VOICE_CALL_ACTIVITY_HINT,
    VOICE_CALL_ACTIVITY_TITLE,
} from 'pages/stats/voice/constants/voiceAgents'

export enum VoiceAgentsChart {
    VoiceAgentsTable = 'voice-agents-table',
}

export const VOICE_AGENTS_OPTIONAL_FILTERS: OptionalFilter[] = [
    FilterComponentKey.PhoneIntegrations,
    FilterKey.Tags,
    FilterKey.Agents,
]

export const VOICE_AGENTS_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
]

export const VoiceAgentsReportConfig: ReportConfig<VoiceAgentsChart> = {
    reportName: VOICE_AGENTS_PAGE_TITLE,
    reportPath: 'voice-agents',
    reportFilters: {
        optional: VOICE_AGENTS_OPTIONAL_FILTERS,
        persistent: VOICE_AGENTS_PERSISTENT_FILTERS,
    },
    charts: {
        [VoiceAgentsChart.VoiceAgentsTable]: {
            chartComponent: VoiceAgentsTableCard,
            label: VOICE_CALL_ACTIVITY_TITLE,
            description: VOICE_CALL_ACTIVITY_HINT,
            csvProducer: null,
            chartType: ChartType.Table,
        },
    },
}
