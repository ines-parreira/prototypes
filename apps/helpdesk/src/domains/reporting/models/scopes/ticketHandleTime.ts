import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { Context, defineScope } from 'domains/reporting/models/scopes/scope'

const ticketHandleTimeScope = defineScope({
    scope: MetricScope.TicketHandleTime,
    measures: ['averageHandleTime', 'handleTime'],
    dimensions: [
        'ticketId',
        'agentId',
        'channel',
        'integrationId',
        'handleTime',
    ],
    timeDimensions: ['createdDatetime', 'closedDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'agents',
        'channels',
        'csatScores',
        'integrations',
        'stores',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracyScore',
        'efficiencyScore',
        'internalComplianceScore',
        'brandVoiceScore',
        'customFields',
        'tags',
    ],
    order: ['tickets', 'handleTime'],
})

export const ticketHandleTime = ticketHandleTimeScope
    .defineMetricName(METRIC_NAMES.AGENTXP_TICKET_HANDLE_TIME)
    .defineQuery(() => ({
        measures: ['handleTime'] as const,
    }))

export const ticketHandleTimeQueryV2Factory = (ctx: Context) =>
    ticketHandleTime.build(ctx)

export const ticketAverageHandleTime = ticketHandleTimeScope
    .defineMetricName(METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME)
    .defineQuery(() => ({
        measures: ['averageHandleTime'] as const,
    }))

export const ticketAverageHandleTimeQueryV2Factory = (ctx: Context) =>
    ticketAverageHandleTime.build(ctx)

export const ticketAverageHandleTimePerAgent = ticketHandleTimeScope
    .defineMetricName(METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME_PER_AGENT)
    .defineQuery(() => ({
        measures: ['averageHandleTime'] as const,
        dimensions: ['agentId'] as const,
    }))

export const ticketAverageHandleTimePerAgentQueryV2Factory = (ctx: Context) =>
    ticketAverageHandleTimePerAgent.build(ctx)

export const ticketAverageHandleTimePerChannel = ticketHandleTimeScope
    .defineMetricName(
        METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME_PER_AGENT_PER_CHANNEL,
    )
    .defineQuery(() => ({
        measures: ['averageHandleTime'] as const,
        dimensions: ['channel'] as const,
    }))

export const ticketAverageHandleTimePerChannelQueryV2Factory = (ctx: Context) =>
    ticketAverageHandleTimePerChannel.build(ctx)
