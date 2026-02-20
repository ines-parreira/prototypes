import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

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
        'agentId',
        'teamId',
        'channel',
        'integrationId',
        'storeId',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracy',
        'efficiency',
        'internalCompliance',
        'brandVoice',
        'customFields',
        'tags',
        'score',
    ],
    order: ['ticketId', 'handleTime', 'averageHandleTime'],
})

export const ticketAverageHandleTime = ticketHandleTimeScope
    .defineMetricName(METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME)
    .defineQuery(() => ({
        measures: ['averageHandleTime'] as const,
    }))

export const ticketAverageHandleTimeQueryV2Factory = (ctx: Context) =>
    ticketAverageHandleTime.build(ctx)

export const ticketAverageHandleTimePerAgent = ticketHandleTimeScope
    .defineMetricName(METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME_PER_AGENT)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['averageHandleTime'] as const,
            dimensions: ['agentId'] as const,
            limit: 10000,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['averageHandleTime', ctx.sortDirection]] as const,
            }
        }
        return query
    })

export const ticketAverageHandleTimePerAgentQueryV2Factory = (ctx: Context) =>
    ticketAverageHandleTimePerAgent.build(ctx)

export const ticketAverageHandleTimePerAgentPerChannel = ticketHandleTimeScope
    .defineMetricName(
        METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME_PER_AGENT_PER_CHANNEL,
    )
    .defineQuery(() => ({
        measures: ['averageHandleTime'] as const,
        dimensions: ['channel'] as const,
    }))

export const ticketAverageHandleTimePerAgentPerChannelQueryV2Factory = (
    ctx: Context,
) => ticketAverageHandleTimePerAgentPerChannel.build(ctx)
