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
    order: ['ticketId', 'handleTime'],
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
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['handleTime', ctx.sortDirection]] as const,
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
