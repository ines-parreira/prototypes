import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { VoiceCallDimension } from 'domains/reporting/models/cubes/VoiceCallCube'
import type { VoiceEventsByAgentCube } from 'domains/reporting/models/cubes/VoiceEventsByAgent'
import {
    VoiceEventsByAgentDimension,
    VoiceEventsByAgentFiltersMembers,
    VoiceEventsByAgentMeasure,
    VoiceEventsByAgentSegment,
} from 'domains/reporting/models/cubes/VoiceEventsByAgent'
import { getTicketPeriodFilters } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
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
    metricName: METRIC_NAMES.VOICE_DECLINED_CALLS_COUNT_PER_AGENT,
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
    metricName: METRIC_NAMES.VOICE_DECLINED_CALLS_COUNT,
    measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
    dimensions: [],
    timezone,
    segments: withVoiceEventsByAgentDefaultSegment(
        VoiceEventsByAgentSegment.declinedCalls,
    ),
    filters: voiceEventsByAgentDefaultFilters(filters),
})

export const declinedVoiceCallsPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<VoiceEventsByAgentCube> => ({
    metricName: METRIC_NAMES.VOICE_DECLINED_CALLS_PER_AGENT,
    measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
    dimensions: [
        VoiceEventsByAgentDimension.IntegrationId,
        VoiceEventsByAgentDimension.CreatedAt,
        VoiceEventsByAgentDimension.TicketId,
        VoiceEventsByAgentDimension.Status,
        VoiceCallDimension.AgentId,
        VoiceCallDimension.CustomerId,
        VoiceCallDimension.Direction,
        VoiceCallDimension.Duration,
        VoiceCallDimension.VoicemailAvailable,
        VoiceCallDimension.VoicemailUrl,
        VoiceCallDimension.CallRecordingAvailable,
        VoiceCallDimension.CallRecordingUrl,
        VoiceCallDimension.DisplayStatus,
        VoiceCallDimension.PhoneNumberSource,
    ],
    timezone,
    segments: withVoiceEventsByAgentDefaultSegment(
        VoiceEventsByAgentSegment.declinedCalls,
    ),
    filters: voiceEventsByAgentDefaultFilters(filters),
    order: [[VoiceEventsByAgentDimension.CreatedAt, OrderDirection.Desc]],
})

export const transferredInboundVoiceCallsCountPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<VoiceEventsByAgentCube> => ({
    metricName: METRIC_NAMES.VOICE_TRANSFERRED_INBOUND_CALLS_COUNT_PER_AGENT,
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
    metricName: METRIC_NAMES.VOICE_TRANSFERRED_INBOUND_CALLS_COUNT,
    measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
    dimensions: [],
    timezone,
    segments: withVoiceEventsByAgentDefaultSegment(
        VoiceEventsByAgentSegment.transferredInboundCalls,
    ),
    filters: voiceEventsByAgentDefaultFilters(filters),
})

export const transferredInboundVoiceCallsPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<VoiceEventsByAgentCube> => ({
    metricName: METRIC_NAMES.VOICE_TRANSFERRED_INBOUND_CALLS_PER_AGENT,
    measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
    dimensions: [
        VoiceEventsByAgentDimension.AgentId,
        VoiceEventsByAgentDimension.IntegrationId,
        VoiceEventsByAgentDimension.CreatedAt,
        VoiceEventsByAgentDimension.TicketId,
        VoiceEventsByAgentDimension.TransferType,
        VoiceEventsByAgentDimension.TransferTargetAgentId,
        VoiceEventsByAgentDimension.TransferTargetExternalNumber,
        VoiceEventsByAgentDimension.TransferTargetQueueId,
        VoiceCallDimension.Duration,
        VoiceCallDimension.DisplayStatus,
        VoiceCallDimension.CallRecordingAvailable,
        VoiceCallDimension.CallRecordingUrl,
    ],
    timezone,
    segments: withVoiceEventsByAgentDefaultSegment(
        VoiceEventsByAgentSegment.transferredInboundCalls,
    ),
    filters: voiceEventsByAgentDefaultFilters(filters),
    order: [[VoiceEventsByAgentDimension.CreatedAt, OrderDirection.Desc]],
})
