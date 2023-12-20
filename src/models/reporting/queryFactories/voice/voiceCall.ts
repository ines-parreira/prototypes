import {StatsFilters} from 'models/stat/types'
import {statsFiltersToReportingFilters} from 'utils/reporting'
import {
    VoiceCallCube,
    VoiceCallDimension,
    VoiceCallFiltersMembers,
    VoiceCallMeasure,
    VoiceCallSegment,
} from 'models/reporting/cubes/VoiceCallCube'
import {ReportingQuery} from 'models/reporting/types'
import {OrderDirection} from 'models/api/types'

export const voiceCallDefaultFilters = (filters: StatsFilters) => [
    ...statsFiltersToReportingFilters(VoiceCallFiltersMembers, filters),
]

export const voiceCallCountQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment
) => ({
    measures: [VoiceCallMeasure.VoiceCallCount],
    dimensions: [],
    timezone,
    segments: segment ? [segment] : [],
    filters: voiceCallDefaultFilters(filters),
})

export const voiceCallListQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
    limit?: number,
    offset?: number
): ReportingQuery<VoiceCallCube> => ({
    measures: [VoiceCallMeasure.VoiceCallCount],
    dimensions: [
        VoiceCallDimension.AgentId,
        VoiceCallDimension.CustomerId,
        VoiceCallDimension.Direction,
        VoiceCallDimension.IntegrationId,
        VoiceCallDimension.CreatedAt,
        VoiceCallDimension.Status,
        VoiceCallDimension.Duration,
        VoiceCallDimension.TicketId,
        VoiceCallDimension.PhoneNumberSource,
        VoiceCallDimension.PhoneNumberDestination,
    ],
    timezone,
    segments: segment ? [segment] : [],
    filters: voiceCallDefaultFilters(filters),
    order: [[VoiceCallDimension.CreatedAt, OrderDirection.Desc]],
    limit: limit,
    offset: offset,
})
