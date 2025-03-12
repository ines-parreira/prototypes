import {
    VoiceEventsByAgentDimension,
    VoiceEventsByAgentFiltersMembers,
    VoiceEventsByAgentMeasure,
    VoiceEventsByAgentSegment,
} from 'models/reporting/cubes/VoiceEventsByAgent'
import { StatsFilters } from 'models/stat/types'
import { statsFiltersToReportingFilters } from 'utils/reporting'

import { getTicketPeriodFilters } from './voiceCall'

export const voiceEventsByAgentDefaultFilters = (filters: StatsFilters) => {
    return [
        ...statsFiltersToReportingFilters(
            VoiceEventsByAgentFiltersMembers,
            filters,
        ),
        ...getTicketPeriodFilters(filters),
    ]
}

const withVoiceEventsByAgentDefaultSegment = (
    segment?: VoiceEventsByAgentSegment,
) => {
    if (segment) {
        return [segment, VoiceEventsByAgentSegment.callsInFinalStatus]
    }
    return [VoiceEventsByAgentSegment.callsInFinalStatus]
}

export const declinedVoiceCallsCountPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
) => ({
    measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
    dimensions: [VoiceEventsByAgentDimension.AgentId],
    timezone,
    segments: withVoiceEventsByAgentDefaultSegment(
        VoiceEventsByAgentSegment.declinedCalls,
    ),
    filters: voiceEventsByAgentDefaultFilters(filters),
})

export const declinedVoiceCallsCountQueryFactory = (
    filters: StatsFilters,
    timezone: string,
) => ({
    measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
    dimensions: [],
    timezone,
    segments: withVoiceEventsByAgentDefaultSegment(
        VoiceEventsByAgentSegment.declinedCalls,
    ),
    filters: voiceEventsByAgentDefaultFilters(filters),
})
