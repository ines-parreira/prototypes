import { OrderDirection } from 'models/api/types'
import {
    VoiceEventsByAgentCube,
    VoiceEventsByAgentDimension,
    VoiceEventsByAgentFiltersMembers,
    VoiceEventsByAgentMeasure,
    VoiceEventsByAgentSegment,
} from 'models/reporting/cubes/VoiceEventsByAgent'
import { ReportingQuery } from 'models/reporting/types'
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
    sorting?: OrderDirection,
): ReportingQuery<VoiceEventsByAgentCube> => ({
    measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
    dimensions: [VoiceEventsByAgentDimension.AgentId],
    timezone,
    segments: withVoiceEventsByAgentDefaultSegment(
        VoiceEventsByAgentSegment.declinedCalls,
    ),
    filters: voiceEventsByAgentDefaultFilters(filters),
    ...(sorting
        ? {
              order: [[VoiceEventsByAgentMeasure.VoiceEventsCount, sorting]],
          }
        : {}),
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
