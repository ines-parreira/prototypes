import moment from 'moment/moment'
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
import {MIN_DATE_FOR_ADVANCED_VOICE_STATS} from 'pages/stats/voice/constants/voiceOverview'

export const getAdvancedVoicePeriodFilters = (
    period: StatsFilters['period']
) => {
    // We need to filter by a minimum date for advanced metrics to display correct data
    const end_datetime = period.end_datetime
    const start_datetime = period.start_datetime
    const extraPeriodFilters = {start_datetime, end_datetime}
    if (moment(start_datetime) < moment(MIN_DATE_FOR_ADVANCED_VOICE_STATS)) {
        extraPeriodFilters.start_datetime = MIN_DATE_FOR_ADVANCED_VOICE_STATS
    }
    if (moment(end_datetime) < moment(MIN_DATE_FOR_ADVANCED_VOICE_STATS)) {
        extraPeriodFilters.end_datetime = MIN_DATE_FOR_ADVANCED_VOICE_STATS
    }
    return extraPeriodFilters
}

export const voiceCallDefaultFilters = (
    filters: StatsFilters,
    isAdvancedMetric = false
) => {
    if (isAdvancedMetric) {
        const extraPeriodFilters = getAdvancedVoicePeriodFilters(filters.period)
        return [
            ...statsFiltersToReportingFilters(VoiceCallFiltersMembers, {
                ...filters,
                ...{period: extraPeriodFilters},
            }),
        ]
    }
    return [...statsFiltersToReportingFilters(VoiceCallFiltersMembers, filters)]
}

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

export const voiceCallAverageTalkTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [VoiceCallMeasure.VoiceCallAverageTalkTime],
    dimensions: [],
    timezone,
    segments: [],
    filters: voiceCallDefaultFilters(filters, true),
})

export const voiceCallAverageWaitTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [VoiceCallMeasure.VoiceCallAverageWaitTime],
    dimensions: [],
    timezone,
    segments: [VoiceCallSegment.inboundCalls],
    filters: voiceCallDefaultFilters(filters, true),
})
