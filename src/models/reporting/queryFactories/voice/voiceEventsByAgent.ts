import {StatsFilters} from 'models/stat/types'
import {
    VoiceEventsByAgentDimension,
    VoiceEventsByAgentFiltersMembers,
    VoiceEventsByAgentMeasure,
    VoiceEventsByAgentSegment,
} from 'models/reporting/cubes/VoiceEventsByAgent'
import {statsFiltersToReportingFilters} from 'utils/reporting'

export const voiceEventsByAgentDefaultFilters = (filters: StatsFilters) => {
    return statsFiltersToReportingFilters(
        VoiceEventsByAgentFiltersMembers,
        filters
    )
}

export const declinedVoiceCallsCountPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
    dimensions: [VoiceEventsByAgentDimension.AgentId],
    timezone,
    segments: [VoiceEventsByAgentSegment.declinedCalls],
    filters: voiceEventsByAgentDefaultFilters(filters),
})
