import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { hasFilter } from 'domains/reporting/models/queryFactories/utils'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import {
    ApiOnlyOperatorEnum,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'

const voiceAgentEventsScope = defineScope({
    scope: MetricScope.VoiceAgentEvents,
    measures: ['voiceCallsCount'],
    dimensions: [
        'agentId',
        'assignedAgentId',
        'integrationId',
        'createdDatetime',
        'ticketId',
        'transferType',
        'transferTargetAgentId',
        'transferTargetExternalNumber',
        'transferTargetQueueId',
        'duration',
        'displayStatus',
        'callRecordingAvailable',
        'callRecordingUrl',
        'voicemailAvailable',
        'voicemailUrl',
        'status',
        'customerId',
        'callDirection',
        'source',
        'destination',
    ],
    order: ['voiceCallsCount', 'createdDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'integrationId',
        'agentId',
        'transferredCalls',
        'declinedCalls',
        'tags',
        'storeId',
    ],
})

export type VoiceAgentEventsContext = Context<
    typeof voiceAgentEventsScope.config
>

export const declinedVoiceCallsCount = voiceAgentEventsScope
    .defineMetricName(METRIC_NAMES.VOICE_DECLINED_CALLS_COUNT)
    .defineQuery(({ ctx, config }) => {
        const query = {
            measures: ['voiceCallsCount'] as const,
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'declinedCalls',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1'],
                },
            ] as any,
        }
        if (!hasFilter(ctx.filters.agents)) {
            query.filters.push({
                member: 'agentId',
                operator: ApiOnlyOperatorEnum.SET,
                values: [],
            })
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['voiceCallsCount', ctx.sortDirection]],
            }
        }
        return query
    })

export const declinedVoiceCallsCountQueryV2Factory = (ctx: Context) =>
    declinedVoiceCallsCount.build(ctx)

export const declinedVoiceCallsCountPerAgent = voiceAgentEventsScope
    .defineMetricName(METRIC_NAMES.VOICE_DECLINED_CALLS_COUNT_PER_AGENT)
    .defineQuery(({ ctx, config }) => {
        const query = {
            measures: ['voiceCallsCount'] as const,
            dimensions: ['agentId'] as const,
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'declinedCalls',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1'],
                },
            ] as any,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['voiceCallsCount', ctx.sortDirection]],
            }
        }
        return query
    })

export const declinedVoiceCallsCountPerAgentQueryV2Factory = (ctx: Context) =>
    declinedVoiceCallsCountPerAgent.build(ctx)

export const transferredInboundVoiceCallsCount = voiceAgentEventsScope
    .defineMetricName(METRIC_NAMES.VOICE_TRANSFERRED_INBOUND_CALLS_COUNT)
    .defineQuery(({ ctx, config }) => {
        const query = {
            measures: ['voiceCallsCount'] as const,
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'transferredCalls',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1'],
                },
            ] as any,
        }
        if (!hasFilter(ctx.filters.agents)) {
            query.filters.push({
                member: 'agentId',
                operator: ApiOnlyOperatorEnum.SET,
                values: [],
            })
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['voiceCallsCount', ctx.sortDirection]],
            }
        }
        return query
    })

export const transferredInboundVoiceCallsCountQueryV2Factory = (ctx: Context) =>
    transferredInboundVoiceCallsCount.build(ctx)

export const transferredInboundVoiceCallsCountPerAgent = voiceAgentEventsScope
    .defineMetricName(
        METRIC_NAMES.VOICE_TRANSFERRED_INBOUND_CALLS_COUNT_PER_AGENT,
    )
    .defineQuery(({ ctx, config }) => {
        const query = {
            measures: ['voiceCallsCount'] as const,
            dimensions: ['agentId'] as const,
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'transferredCalls',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1'],
                },
            ] as any,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['voiceCallsCount', ctx.sortDirection]],
            }
        }
        return query
    })

export const transferredInboundVoiceCallsCountPerAgentQueryV2Factory = (
    ctx: Context,
) => transferredInboundVoiceCallsCountPerAgent.build(ctx)

export const transferredInboundVoiceCallsPerAgent = voiceAgentEventsScope
    .defineMetricName(METRIC_NAMES.VOICE_TRANSFERRED_INBOUND_CALLS_PER_AGENT)
    .defineQuery(({ ctx, config }) => {
        const query = {
            measures: ['voiceCallsCount'] as const,
            dimensions: [
                'agentId',
                'integrationId',
                'createdDatetime',
                'ticketId',
                'transferType',
                'transferTargetAgentId',
                'transferTargetExternalNumber',
                'transferTargetQueueId',
                'duration',
                'displayStatus',
                'callRecordingAvailable',
                'callRecordingUrl',
            ] as const,
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'transferredCalls',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1'],
                },
            ] as any,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['createdDatetime', ctx.sortDirection]],
            }
        }
        return query
    })

export const transferredInboundVoiceCallsPerAgentQueryV2Factory = (
    ctx: VoiceAgentEventsContext,
) => transferredInboundVoiceCallsPerAgent.build(ctx)

export const declinedCallsPerAgent = voiceAgentEventsScope
    .defineMetricName(METRIC_NAMES.VOICE_DECLINED_CALLS_PER_AGENT)
    .defineQuery(({ ctx, config }) => {
        const query = {
            measures: ['voiceCallsCount'] as const,
            dimensions: [
                'integrationId',
                'createdDatetime',
                'ticketId',
                'status',
                'assignedAgentId',
                'customerId',
                'callDirection',
                'duration',
                'voicemailAvailable',
                'voicemailUrl',
                'displayStatus',
                'callRecordingAvailable',
                'callRecordingUrl',
                'source',
            ] as const,
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'declinedCalls',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1'],
                },
            ] as any,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['createdDatetime', ctx.sortDirection]],
            }
        }
        return query
    })

export const declinedCallsPerAgentQueryV2Factory = (
    ctx: VoiceAgentEventsContext,
) => declinedCallsPerAgent.build(ctx)
