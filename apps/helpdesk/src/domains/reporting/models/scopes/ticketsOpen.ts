import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { getEmailChannelScopeFilters } from 'domains/reporting/models/scopes/channelFilter'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { getValueQuery } from 'domains/reporting/models/scopes/utils'

const ticketsOpenScope = defineScope({
    scope: MetricScope.TicketsOpen,
    measures: ['ticketCount'],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId'],
    timeDimensions: ['createdDatetime'],
    order: ['ticketId', 'createdDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'agentId',
        'teamId',
        'channel',
        'score',
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
    ],
})

type TicketsOpenContext = Context<typeof ticketsOpenScope.config>

export const openTicketsCount = ticketsOpenScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_OPEN_TICKETS)
    .defineQuery(() => ({
        measures: ['ticketCount'],
    }))

export const openTicketsCountQueryV2Factory = (ctx: Context) =>
    openTicketsCount.build(ctx)

const channelsEmailOpenTicketsBaseQuery = ({
    ctx,
    config,
}: {
    ctx: TicketsOpenContext
    config: typeof ticketsOpenScope.config
}) => ({
    measures: ['ticketCount'] as const,
    filters: getEmailChannelScopeFilters(ctx, config),
})

export const {
    valueQueryFactory: channelsEmailOpenTicketsValueQueryFactoryV2,
} = getValueQuery(
    ticketsOpenScope,
    channelsEmailOpenTicketsBaseQuery,
    METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_OPEN_TICKETS_VALUE,
)
