import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    VoiceCallDimension,
    VoiceCallSegment,
} from 'domains/reporting/models/cubes/VoiceCallCube'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    getAccountBusinessHoursTimezone,
    getAdvancedVoicePeriodFilters,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import type {
    ApiStatsFilters,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import { APIOnlyFilterKey } from 'domains/reporting/models/stat/types'
import { ApiOnlyOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getLiveVoicePeriodFilter } from 'domains/reporting/pages/voice/components/LiveVoice/utils'

const voiceCallsScope = defineScope({
    scope: MetricScope.VoiceCalls,
    measures: [
        'averageTalkTimeInSeconds',
        'averageWaitTimeInSeconds',
        'slaAchievementRate',
        'voiceCallsCount',
        'achievedExposures',
    ],
    dimensions: [
        'agentId',
        'callDirection',
        'callRecordingAvailable',
        'callRecordingUrl',
        'createdDatetime',
        'callSlaStatus',
        'customerId',
        'destination',
        'displayStatus',
        'duration',
        'filteringAgentId',
        'integrationId',
        'queueId',
        'queueName',
        'source',
        'status',
        'talkTime',
        'ticketId',
        'voicemailAvailable',
        'voicemailUrl',
        'waitTime',
        'isPossibleSpam',
    ],
    order: [
        'averageTalkTimeInSeconds',
        'createdDatetime',
        'duration',
        'waitTime',
        'displayStatus',
    ],
    filters: [
        'agentId',
        'callTerminationStatus',
        'callDirection',
        'displayStatus',
        'integrationId',
        'isAnsweredByAgent',
        'isDuringBusinessHours',
        'periodEnd',
        'periodStart',
        'queueId',
        'storeId',
        'tags',
        'customFields',
        'callSlaStatus',
    ],
})

export type VoiceCallsContext = Context<typeof voiceCallsScope.config>

export const voiceCallsAverageWaitTime = voiceCallsScope
    .defineMetricName(METRIC_NAMES.VOICE_CALL_AVERAGE_WAIT_TIME)
    .defineQuery(() => ({
        measures: ['averageWaitTimeInSeconds'] as const,
    }))

export const voiceCallsAverageWaitTimeQueryFactoryV2 = (
    ctx: VoiceCallsContext,
    assignedCallsOnly = false,
) => {
    // TODO(2026): remove getAdvancedVoicePeriodFilters as we won't be able to query data before 2024
    return voiceCallsAverageWaitTime.build({
        ...ctx,
        filters: withVoiceCallSegment(
            {
                ...(assignedCallsOnly
                    ? {
                          [APIOnlyFilterKey.AgentId]: withLogicalOperator(
                              [],
                              ApiOnlyOperatorEnum.SET,
                          ),
                      }
                    : {}),
                ...ctx.filters,
                period: getAdvancedVoicePeriodFilters(ctx.filters.period),
            },
            VoiceCallSegment.inboundCalls,
        ),
    })
}

export const voiceCallsAverageTalkTime = voiceCallsScope
    .defineMetricName(METRIC_NAMES.VOICE_CALL_AVERAGE_TALK_TIME)
    .defineQuery(() => ({
        measures: ['averageTalkTimeInSeconds'] as const,
    }))

export const voiceCallsAverageTalkTimeQueryFactoryV2 = (
    ctx: VoiceCallsContext,
    assignedCallsOnly = false,
) => {
    // TODO(2026): remove getAdvancedVoicePeriodFilters as we won't be able to query data before 2024
    return voiceCallsAverageTalkTime.build({
        ...ctx,
        filters: withVoiceCallSegment({
            ...(assignedCallsOnly
                ? {
                      [APIOnlyFilterKey.AgentId]: withLogicalOperator(
                          [],
                          ApiOnlyOperatorEnum.SET,
                      ),
                  }
                : {}),
            ...ctx.filters,
            period: getAdvancedVoicePeriodFilters(ctx.filters.period),
        }),
    })
}

export const voiceCallsSlaAchievementRate = voiceCallsScope
    .defineMetricName(METRIC_NAMES.VOICE_CALL_SLA_ACHIEVEMENT_RATE)
    .defineQuery(() => ({
        measures: ['slaAchievementRate'] as const,
    }))

export const voiceCallsSlaAchievementRateQueryFactoryV2 = (
    ctx: VoiceCallsContext,
    assignedCallsOnly = false,
) => {
    // TODO(2026): remove getAdvancedVoicePeriodFilters as we won't be able to query data before 2024
    return voiceCallsSlaAchievementRate.build({
        ...ctx,
        filters: withVoiceCallSegment(
            {
                ...(assignedCallsOnly
                    ? {
                          [APIOnlyFilterKey.AgentId]: withLogicalOperator(
                              [],
                              ApiOnlyOperatorEnum.SET,
                          ),
                      }
                    : {}),
                ...ctx.filters,
                period: getAdvancedVoicePeriodFilters(ctx.filters.period),
            },
            VoiceCallSegment.inboundCalls,
        ),
    })
}

/**
 * Adapts the filters to include the segment-specific filters.
 * When migrating to v2, this logic was moved to filters as segments are not supported
 * by the API and we did not want to create one scope per segment.
 * @param filters regular filters for the metrics
 * @param segment the type of calls you are only interested in
 * @returns modified fitlers to take into account only the segment-specific calls you are interested in
 */
const withVoiceCallSegment = (
    filters: ApiStatsFilters,
    segment?: VoiceCallSegment,
) => {
    if (!segment) return filters
    const additionalFilters: Omit<ApiStatsFilters, FilterKey.Period> = {}
    switch (segment) {
        case VoiceCallSegment.outboundCalls:
            additionalFilters[APIOnlyFilterKey.CallDirection] =
                withLogicalOperator(['outbound'])
            break
        case VoiceCallSegment.inboundCalls:
            additionalFilters[APIOnlyFilterKey.CallDirection] =
                withLogicalOperator(['inbound'])
            break
        case VoiceCallSegment.inboundUnansweredCalls:
            additionalFilters[APIOnlyFilterKey.CallDirection] =
                withLogicalOperator(['inbound'])
            additionalFilters[APIOnlyFilterKey.CallTerminationStatus] =
                withLogicalOperator([
                    'missed',
                    'abandoned',
                    'cancelled',
                    'callback-requested',
                ])
            break
        case VoiceCallSegment.inboundMissedCalls:
            additionalFilters[APIOnlyFilterKey.CallDirection] =
                withLogicalOperator(['inbound'])
            additionalFilters[APIOnlyFilterKey.CallTerminationStatus] =
                withLogicalOperator(['missed'])
            break
        case VoiceCallSegment.inboundAbandonedCalls:
            additionalFilters[APIOnlyFilterKey.CallDirection] =
                withLogicalOperator(['inbound'])
            additionalFilters[APIOnlyFilterKey.CallTerminationStatus] =
                withLogicalOperator(['abandoned'])
            break
        case VoiceCallSegment.inboundCancelledCalls:
            additionalFilters[APIOnlyFilterKey.CallDirection] =
                withLogicalOperator(['inbound'])
            additionalFilters[APIOnlyFilterKey.CallTerminationStatus] =
                withLogicalOperator(['cancelled'])
            break
        case VoiceCallSegment.inboundCallbackRequestedCalls:
            additionalFilters[APIOnlyFilterKey.CallDirection] =
                withLogicalOperator(['inbound'])
            additionalFilters[APIOnlyFilterKey.CallTerminationStatus] =
                withLogicalOperator(['callback-requested'])
            break
        case VoiceCallSegment.inboundUnansweredCallsByAgent:
            additionalFilters[APIOnlyFilterKey.CallDirection] =
                withLogicalOperator(['inbound'])
            additionalFilters[APIOnlyFilterKey.IsAnsweredByAgent] =
                withLogicalOperator([false])
            break
        case VoiceCallSegment.inboundAnsweredCallsByAgent:
            additionalFilters[APIOnlyFilterKey.CallDirection] =
                withLogicalOperator(['inbound'])
            additionalFilters[APIOnlyFilterKey.IsAnsweredByAgent] =
                withLogicalOperator([true])
            break
        case VoiceCallSegment.callSlaBreached:
            additionalFilters[APIOnlyFilterKey.CallSlaStatus] =
                withLogicalOperator(['1'])
            break
        case VoiceCallSegment.callsInFinalStatus:
            // No additional filter needed for this segment, already included in backend
            break
    }

    return {
        ...filters,
        ...additionalFilters,
    }
}

export const voiceCallsCount = voiceCallsScope
    .defineMetricName(METRIC_NAMES.VOICE_CALL_COUNT_TREND)
    .defineQuery(() => ({
        measures: ['voiceCallsCount'] as const,
    }))

export const voiceCallsCountQueryFactoryV2 = (
    ctx: VoiceCallsContext,
    segment?: VoiceCallSegment,
    assignedCallsOnly = false,
    temporaryFixPeriod = true,
) => {
    // TODO(2026): remove getAdvancedVoicePeriodFilters as we won't be able to query data before 2024
    return voiceCallsCount.build({
        ...ctx,
        filters: withVoiceCallSegment(
            {
                ...(assignedCallsOnly
                    ? {
                          [APIOnlyFilterKey.AgentId]: withLogicalOperator(
                              [],
                              ApiOnlyOperatorEnum.SET,
                          ),
                      }
                    : {}),
                ...ctx.filters,
                period: temporaryFixPeriod
                    ? getAdvancedVoicePeriodFilters(ctx.filters.period)
                    : ctx.filters.period,
            },
            segment,
        ),
    })
}

export const voiceCallsCountAllDimensions = voiceCallsScope
    .defineMetricName(METRIC_NAMES.VOICE_CALL_LIST)
    .defineQuery(() => ({
        measures: ['voiceCallsCount'] as const,
        dimensions: [
            'agentId',
            'customerId',
            'callDirection',
            'callSlaStatus',
            'integrationId',
            'createdDatetime',
            'status',
            'duration',
            'ticketId',
            'source',
            'destination',
            'talkTime',
            'waitTime',
            'voicemailAvailable',
            'voicemailUrl',
            'callRecordingAvailable',
            'callRecordingUrl',
            'displayStatus',
            'queueId',
            'queueName',
            'isPossibleSpam',
        ] as const,
    }))

export const voiceCallsCountAllDimensionsQueryFactoryV2 = (
    ctx: VoiceCallsContext,
    segment?: VoiceCallSegment,
) =>
    voiceCallsCountAllDimensions.build({
        ...ctx,
        filters: withVoiceCallSegment(ctx.filters, segment),
    })

export const voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2 = (
    ctx: VoiceCallsContext,
    segment?: VoiceCallSegment,
) => {
    const timezone = getAccountBusinessHoursTimezone()
    const period = getLiveVoicePeriodFilter(timezone)

    return voiceCallsCountAllDimensions.build({
        ...ctx,
        timezone,
        filters: withVoiceCallSegment({ ...ctx.filters, period }, segment),
    })
}

export const mapVoiceCallDirectionToScopeOrder = (
    order: VoiceCallDimension | undefined,
) => {
    if (!order) return undefined
    switch (order) {
        case VoiceCallDimension.CreatedAt:
            return 'createdDatetime'
        case VoiceCallDimension.Duration:
            return 'duration'
        case VoiceCallDimension.WaitTime:
            return 'waitTime'
        case VoiceCallDimension.DisplayStatus:
            return 'displayStatus'
    }
    return undefined
}

export const voiceCallsCountPerFilteringAgent = voiceCallsScope
    .defineMetricName(METRIC_NAMES.VOICE_CALL_COUNT_PER_FILTERING_AGENT)
    .defineQuery(() => ({
        measures: ['voiceCallsCount'] as const,
        dimensions: ['filteringAgentId'] as const,
    }))

export const voiceCallsCountPerFilteringAgentQueryFactoryV2 = (
    ctx: VoiceCallsContext,
    segment?: VoiceCallSegment,
) => {
    // TODO(2026): remove getAdvancedVoicePeriodFilters as we won't be able to query data before 2024
    return voiceCallsCountPerFilteringAgent.build({
        ...ctx,
        filters: withVoiceCallSegment(
            {
                ...ctx.filters,
                period: getAdvancedVoicePeriodFilters(ctx.filters.period),
            },
            segment,
        ),
        limit: 10000,
    })
}

export const voiceCallsAchievedExposures = voiceCallsScope
    .defineMetricName(METRIC_NAMES.VOICE_CALL_ACHIEVED_EXPOSURES_TREND)
    .defineQuery(() => ({
        measures: ['achievedExposures'] as const,
    }))

export const voiceCallsAchievedExposuresQueryFactoryV2 = (
    ctx: VoiceCallsContext,
    segment?: VoiceCallSegment,
    assignedCallsOnly = false,
    temporaryFixPeriod = true,
) => {
    // TODO(2026): remove getAdvancedVoicePeriodFilters as we won't be able to query data before 2024
    return voiceCallsAchievedExposures.build({
        ...ctx,
        filters: withVoiceCallSegment(
            {
                ...(assignedCallsOnly
                    ? {
                          [APIOnlyFilterKey.AgentId]: withLogicalOperator(
                              [],
                              ApiOnlyOperatorEnum.SET,
                          ),
                      }
                    : {}),
                ...ctx.filters,
                period: temporaryFixPeriod
                    ? getAdvancedVoicePeriodFilters(ctx.filters.period)
                    : ctx.filters.period,
            },
            segment,
        ),
    })
}
