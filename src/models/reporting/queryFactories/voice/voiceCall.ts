import moment from 'moment/moment'

import { OrderDirection } from 'models/api/types'
import {
    VoiceCallCube,
    VoiceCallDimension,
    VoiceCallFiltersMembers,
    VoiceCallMeasure,
    VoiceCallMember,
    VoiceCallSegment,
} from 'models/reporting/cubes/VoiceCallCube'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import { getLiveVoicePeriodFilter } from 'pages/stats/voice/components/LiveVoice/utils'
import { MIN_DATE_FOR_ADVANCED_VOICE_STATS } from 'pages/stats/voice/constants/voiceOverview'
import {
    AccountSettingBusinessHours,
    AccountSettingType,
} from 'state/currentAccount/types'
import {
    formatReportingQueryDate,
    statsFiltersToReportingFilters,
} from 'utils/reporting'

import { TicketMember } from '../../cubes/TicketCube'

const getAccountBusinessHoursTimezone = () =>
    (
        window.GORGIAS_STATE?.currentAccount?.settings?.find(
            (setting) => setting.type === AccountSettingType.BusinessHours,
        ) as AccountSettingBusinessHours | undefined
    )?.data?.timezone ?? 'UTC'

export const getAdvancedVoicePeriodFilters = (
    period: StatsFilters['period'],
) => {
    // We need to filter by a minimum date for advanced metrics to display correct data
    const end_datetime = period.end_datetime
    const start_datetime = period.start_datetime
    const extraPeriodFilters = { start_datetime, end_datetime }
    if (moment(start_datetime) < moment(MIN_DATE_FOR_ADVANCED_VOICE_STATS)) {
        extraPeriodFilters.start_datetime = MIN_DATE_FOR_ADVANCED_VOICE_STATS
    }
    if (moment(end_datetime) < moment(MIN_DATE_FOR_ADVANCED_VOICE_STATS)) {
        extraPeriodFilters.end_datetime = MIN_DATE_FOR_ADVANCED_VOICE_STATS
    }
    return extraPeriodFilters
}

export const getTicketPeriodFilters = (filters: StatsFilters) => {
    const extraFilters = []
    if (filters.tags) {
        extraFilters.push(
            {
                member: TicketMember.PeriodStart,
                operator: ReportingFilterOperator.AfterDate,
                values: [
                    formatReportingQueryDate(filters.period.start_datetime),
                ],
            },
            {
                member: TicketMember.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: [formatReportingQueryDate(filters.period.end_datetime)],
            },
        )
    }
    return extraFilters
}

export const voiceCallDefaultFilters = (
    filters: StatsFilters,
    isAdvancedMetric = false,
) => {
    if (isAdvancedMetric) {
        const extraPeriodFilters = getAdvancedVoicePeriodFilters(filters.period)
        const correctFilters = { ...filters, period: extraPeriodFilters }
        return [
            ...statsFiltersToReportingFilters(
                VoiceCallFiltersMembers,
                correctFilters,
            ),
            ...getTicketPeriodFilters(correctFilters),
        ]
    }

    return [
        ...statsFiltersToReportingFilters(VoiceCallFiltersMembers, filters),
        ...getTicketPeriodFilters(filters),
    ]
}

const withStatusFilter = (
    filters: StatsFilters,
    statusFilter?: VoiceCallDisplayStatus[],
) => {
    return statusFilter
        ? [
              ...voiceCallDefaultFilters(filters),
              {
                  member: VoiceCallMember.DisplayStatus,
                  operator: ReportingFilterOperator.Equals,
                  values: statusFilter,
              },
          ]
        : voiceCallDefaultFilters(filters)
}

const withStatisticsDefaultSegment = (
    segment?: VoiceCallSegment,
    includeLiveData: boolean = false,
) => {
    if (includeLiveData) {
        return segment ? [segment] : []
    }

    if (segment) {
        return [segment, VoiceCallSegment.callsInFinalStatus]
    }
    return [VoiceCallSegment.callsInFinalStatus]
}

const voiceCallListDimensions = [
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
    VoiceCallDimension.TalkTime,
    VoiceCallDimension.WaitTime,
    VoiceCallDimension.VoicemailAvailable,
    VoiceCallDimension.VoicemailUrl,
    VoiceCallDimension.CallRecordingAvailable,
    VoiceCallDimension.CallRecordingUrl,
    VoiceCallDimension.DisplayStatus,
]

export const connectedCallsFilter = {
    member: VoiceCallMember.TalkTime,
    operator: ReportingFilterOperator.Set,
    values: [],
}

export const waitTimeSetFilter = {
    member: VoiceCallMember.WaitTime,
    operator: ReportingFilterOperator.Set,
    values: [],
}

export const connectedCallsListQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    order: VoiceCallDimension = VoiceCallDimension.CreatedAt,
    sorting: OrderDirection = OrderDirection.Desc,
): ReportingQuery<VoiceCallCube> => ({
    measures: [VoiceCallMeasure.VoiceCallCount],
    dimensions: voiceCallListDimensions,
    timezone,
    filters: [...voiceCallDefaultFilters(filters), connectedCallsFilter],
    order: [[order, sorting]],
})

export const liveDashboardConnectedCallsListQueryFactory = (
    filters: StatsFilters,
): ReportingQuery<VoiceCallCube> => {
    const timezone = getAccountBusinessHoursTimezone()
    const period = getLiveVoicePeriodFilter(timezone)

    return connectedCallsListQueryFactory(
        {
            ...filters,
            period,
            ...getTicketPeriodFilters({ ...filters, period }),
        },
        timezone,
    )
}

export const waitingTimeCallsListQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
    order: VoiceCallDimension = VoiceCallDimension.CreatedAt,
    sorting: OrderDirection = OrderDirection.Desc,
    includeLiveData: boolean = false,
): ReportingQuery<VoiceCallCube> => ({
    measures: [VoiceCallMeasure.VoiceCallCount],
    dimensions: voiceCallListDimensions,
    timezone,
    filters: [...voiceCallDefaultFilters(filters), waitTimeSetFilter],
    segments: withStatisticsDefaultSegment(segment, includeLiveData),
    order: [[order, sorting]],
})

export const liveDashboardWaitingTimeCallsListQueryFactory = (
    filters: StatsFilters,
    segment?: VoiceCallSegment,
): ReportingQuery<VoiceCallCube> => {
    const timezone = getAccountBusinessHoursTimezone()
    const period = getLiveVoicePeriodFilter(timezone)

    return waitingTimeCallsListQueryFactory(
        {
            ...filters,
            period,
            ...getTicketPeriodFilters({ ...filters, period }),
        },
        timezone,
        segment,
        undefined,
        undefined,
        true,
    )
}

export const voiceCallCountQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
    statusFilter?: VoiceCallDisplayStatus[],
    includeLiveData: boolean = false,
) => ({
    measures: [VoiceCallMeasure.VoiceCallCount],
    dimensions: [],
    timezone,
    segments: withStatisticsDefaultSegment(segment, includeLiveData),
    filters: withStatusFilter(filters, statusFilter),
})

export const voiceCallCountPerFilteringAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
) => ({
    measures: [VoiceCallMeasure.VoiceCallCount],
    dimensions: [VoiceCallDimension.FilteringAgentId],
    timezone,
    segments: withStatisticsDefaultSegment(segment),
    filters: voiceCallDefaultFilters(filters, true),
})

export const voiceCallCountPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
) => ({
    measures: [VoiceCallMeasure.VoiceCallCount],
    dimensions: [VoiceCallDimension.AgentId],
    timezone,
    segments: withStatisticsDefaultSegment(segment),
    filters: voiceCallDefaultFilters(filters),
})

export const voiceCallListQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
    limit?: number,
    offset?: number,
    order: VoiceCallDimension = VoiceCallDimension.CreatedAt,
    sorting: OrderDirection = OrderDirection.Desc,
    statusFilter?: VoiceCallDisplayStatus[],
    includeLiveData: boolean = false,
): ReportingQuery<VoiceCallCube> => ({
    measures: [VoiceCallMeasure.VoiceCallCount],
    dimensions: voiceCallListDimensions,
    timezone,
    segments: withStatisticsDefaultSegment(segment, includeLiveData),
    filters: withStatusFilter(filters, statusFilter),
    order: [[order, sorting]],
    limit: limit,
    offset: offset,
})

export const liveDashBoardVoiceCallListQueryFactory = (
    filters: StatsFilters,
    segment?: VoiceCallSegment,
    order: VoiceCallDimension = VoiceCallDimension.CreatedAt,
    sorting: OrderDirection = OrderDirection.Desc,
): ReportingQuery<VoiceCallCube> => {
    const timezone = getAccountBusinessHoursTimezone()
    const period = getLiveVoicePeriodFilter(timezone)

    return voiceCallListQueryFactory(
        {
            ...filters,
            period,
            ...getTicketPeriodFilters({ ...filters, period }),
        },
        timezone,
        segment,
        undefined,
        undefined,
        order,
        sorting,
        undefined,
        true,
    )
}

export const voiceCallAverageTalkTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    includeLiveData: boolean = false,
) => ({
    measures: [VoiceCallMeasure.VoiceCallAverageTalkTime],
    dimensions: [],
    timezone,
    segments: withStatisticsDefaultSegment(undefined, includeLiveData),
    filters: voiceCallDefaultFilters(filters, true),
})

export const voiceCallAverageTalkTimePerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
) => ({
    measures: [VoiceCallMeasure.VoiceCallAverageTalkTime],
    dimensions: [VoiceCallDimension.AgentId],
    timezone,
    segments: withStatisticsDefaultSegment(segment),
    filters: voiceCallDefaultFilters(filters, true),
})

export const voiceCallAverageWaitTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    includeLiveData: boolean = false,
) => ({
    measures: [VoiceCallMeasure.VoiceCallAverageWaitTime],
    dimensions: [],
    timezone,
    segments: withStatisticsDefaultSegment(
        VoiceCallSegment.inboundCalls,
        includeLiveData,
    ),
    filters: voiceCallDefaultFilters(filters, true),
})
