import moment from 'moment/moment'

import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import type { VoiceCallCube } from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    VoiceCallDimension,
    VoiceCallFiltersMembers,
    VoiceCallMeasure,
    VoiceCallMember,
    VoiceCallSegment,
} from 'domains/reporting/models/cubes/VoiceCallCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { getLiveVoicePeriodFilter } from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import { MIN_DATE_FOR_ADVANCED_VOICE_STATS } from 'domains/reporting/pages/voice/constants/voiceOverview'
import {
    formatReportingQueryDate,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'
import type { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import type { AccountSettingBusinessHours } from 'state/currentAccount/types'
import { AccountSettingType } from 'state/currentAccount/types'

export const getAccountBusinessHoursTimezone = () =>
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
    if (filters.tags?.length) {
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
    filterMembers = VoiceCallFiltersMembers,
) => {
    if (isAdvancedMetric) {
        const extraPeriodFilters = getAdvancedVoicePeriodFilters(filters.period)
        const correctFilters = { ...filters, period: extraPeriodFilters }
        return [
            ...statsFiltersToReportingFilters(filterMembers, correctFilters),
            ...getTicketPeriodFilters(correctFilters),
        ]
    }

    return [
        ...statsFiltersToReportingFilters(filterMembers, filters),
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
    VoiceCallDimension.CallSlaStatus,
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
    VoiceCallDimension.QueueId,
    VoiceCallDimension.QueueName,
    VoiceCallDimension.IsPossibleSpam,
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
    metricName: METRIC_NAMES.VOICE_CONNECTED_CALLS_LIST,
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
    metricName: METRIC_NAMES.VOICE_WAITING_TIME_CALLS_LIST,
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
    metricName: MetricName = METRIC_NAMES.VOICE_CALL_COUNT_TREND,
) => ({
    metricName,
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
    sorting?: OrderDirection,
): ReportingQuery<VoiceCallCube> => ({
    measures: [VoiceCallMeasure.VoiceCallCount],
    dimensions: [VoiceCallDimension.FilteringAgentId],
    timezone,
    segments: withStatisticsDefaultSegment(segment),
    filters: voiceCallDefaultFilters(filters, true),
    ...(sorting
        ? {
              order: [[VoiceCallMeasure.VoiceCallCount, sorting]],
          }
        : {}),
    metricName: METRIC_NAMES.VOICE_CALL_COUNT_PER_FILTERING_AGENT,
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
    metricName: METRIC_NAMES.VOICE_CALL_LIST,
})

export const voiceCallListWithSlaStatusQueryFactory = (
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
    filters: [
        ...withStatusFilter(filters, statusFilter),
        {
            member: VoiceCallMember.SlaStatus,
            operator: ReportingFilterOperator.Set,
            values: [],
        },
    ],
    order: [[order, sorting]],
    limit: limit,
    offset: offset,
    metricName: METRIC_NAMES.VOICE_CALL_WITH_SLA_STATUS_LIST,
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
        false, // give consistent results with the other reporting data
    )
}

export const voiceCallAverageTalkTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    includeLiveData: boolean = false,
): ReportingQuery<VoiceCallCube> => ({
    metricName: METRIC_NAMES.VOICE_CALL_AVERAGE_TALK_TIME,
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
    sorting?: OrderDirection,
): ReportingQuery<VoiceCallCube> => ({
    measures: [VoiceCallMeasure.VoiceCallAverageTalkTime],
    dimensions: [VoiceCallDimension.AgentId],
    timezone,
    segments: withStatisticsDefaultSegment(segment),
    filters: voiceCallDefaultFilters(filters, true),
    ...(sorting
        ? {
              order: [[VoiceCallMeasure.VoiceCallAverageTalkTime, sorting]],
          }
        : {}),
    metricName: METRIC_NAMES.VOICE_CALL_AVERAGE_TALK_TIME_PER_AGENT,
})

export const voiceCallAverageWaitTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    includeLiveData: boolean = false,
): ReportingQuery<VoiceCallCube> => ({
    metricName: METRIC_NAMES.VOICE_CALL_AVERAGE_WAIT_TIME,
    measures: [VoiceCallMeasure.VoiceCallAverageWaitTime],
    dimensions: [],
    timezone,
    segments: withStatisticsDefaultSegment(
        VoiceCallSegment.inboundCalls,
        includeLiveData,
    ),
    filters: voiceCallDefaultFilters(filters, true),
})

export const voiceCallSlaAchievementRateQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    includeLiveData: boolean = false,
): ReportingQuery<VoiceCallCube> => ({
    metricName: METRIC_NAMES.VOICE_CALL_SLA_ACHIEVEMENT_RATE,
    measures: [VoiceCallMeasure.SlaAchievementRate],
    dimensions: [],
    timezone,
    segments: withStatisticsDefaultSegment(
        VoiceCallSegment.inboundCalls,
        includeLiveData,
    ),
    filters: voiceCallDefaultFilters(filters, true),
})
