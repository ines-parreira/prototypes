import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const workloadTicketsScope = defineScope({
    scope: MetricScope.WorkloadTickets,
    measures: ['ticketCount'],
    dimensions: ['channel', 'ticketId'],
    order: ['ticketId', 'ticketCount'],
    filters: [
        'accuracy',
        'agentId',
        'brandVoice',
        'channel',
        'communicationSkills',
        'score',
        'customFields',
        'efficiency',
        'periodEnd',
        'integrationId',
        'languageProficiency',
        'resolutionCompleteness',
        'internalCompliance',
        'periodStart',
        'storeId',
        'tags',
        'teamId',
    ],
})

export const workloadTicketsPerChannel = workloadTicketsScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_WORKLOAD_PER_CHANNEL)
    .defineQuery(() => ({
        measures: ['ticketCount'] as const,
        dimensions: ['channel'] as const,
    }))

export const workloadTicketsPerChannelQueryV2Factory = (ctx: Context) =>
    workloadTicketsPerChannel.build(ctx)
