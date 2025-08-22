import {
    VoiceEventsByAgentCube,
    VoiceEventsByAgentDimension,
    VoiceEventsByAgentFiltersMembers,
    VoiceEventsByAgentMeasure,
    VoiceEventsByAgentSegment,
} from 'domains/reporting/models/cubes/VoiceEventsByAgent'
import { getTicketPeriodFilters } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import { statsFiltersToReportingFilters } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

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

export const transferredInboundVoiceCallsCountPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<VoiceEventsByAgentCube> => ({
    measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
    dimensions: [VoiceEventsByAgentDimension.AgentId],
    timezone,
    segments: withVoiceEventsByAgentDefaultSegment(
        VoiceEventsByAgentSegment.transferredInboundCalls,
    ),
    filters: voiceEventsByAgentDefaultFilters(filters),
    ...(sorting
        ? {
              order: [[VoiceEventsByAgentMeasure.VoiceEventsCount, sorting]],
          }
        : {}),
})

export const transferredInboundVoiceCallsCountQueryFactory = (
    filters: StatsFilters,
    timezone: string,
) => ({
    measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
    dimensions: [],
    timezone,
    segments: withVoiceEventsByAgentDefaultSegment(
        VoiceEventsByAgentSegment.transferredInboundCalls,
    ),
    filters: voiceEventsByAgentDefaultFilters(filters),
})
