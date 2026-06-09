import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { getEmailChannelScopeFilters } from 'domains/reporting/models/scopes/channelFilter'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { getGenericQueries } from 'domains/reporting/models/scopes/utils'

const messagesPerTicketScope = defineScope({
    scope: MetricScope.MessagesPerTicket,
    measures: ['averageMessagesCount'],
    dimensions: [
        'ticketId',
        'agentId',
        'channel',
        'integrationId',
        'messagesCount',
    ],
    timeDimensions: ['createdDatetime'],
    order: [
        'ticketId',
        'createdDatetime',
        'messagesCount',
        'averageMessagesCount',
    ],
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

type MessagesPerTicketContext = Context<typeof messagesPerTicketScope.config>

export const messagesPerTicketCount = messagesPerTicketScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_PER_TICKET)
    .defineQuery(() => ({
        measures: ['averageMessagesCount'] as const,
    }))

export const messagesPerTicketCountQueryV2Factory = (
    ctx: MessagesPerTicketContext,
) => messagesPerTicketCount.build(ctx)

const messagesPerTicketBaseQuery = () => ({
    measures: ['averageMessagesCount'] as const,
})

export const {
    valueQueryFactory: messagesPerTicketValueQueryFactoryV2,
    breakdownQueryFactory: messagesPerTicketBreakdownQueryFactoryV2,
    timeseriesQueryFactory: messagesPerTicketTimeseriesQueryFactoryV2,
} = getGenericQueries(messagesPerTicketScope, messagesPerTicketBaseQuery, {
    valueMetricName:
        METRIC_NAMES.PERFORMANCE_OVERVIEW_MESSAGES_PER_TICKET_VALUE,
    breakdownMetricName:
        METRIC_NAMES.PERFORMANCE_OVERVIEW_MESSAGES_PER_TICKET_BREAKDOWN,
    breakdownDimensionMetricNames: {
        channel:
            METRIC_NAMES.PERFORMANCE_OVERVIEW_MESSAGES_PER_TICKET_BREAKDOWN_PER_CHANNEL,
        agentId:
            METRIC_NAMES.PERFORMANCE_OVERVIEW_MESSAGES_PER_TICKET_BREAKDOWN_PER_AGENT,
    },
    timeseriesMetricName:
        METRIC_NAMES.PERFORMANCE_OVERVIEW_MESSAGES_PER_TICKET_TIMESERIES,
    timeseriesDimensionMetricNames: {
        channel:
            METRIC_NAMES.PERFORMANCE_OVERVIEW_MESSAGES_PER_TICKET_TIMESERIES_PER_CHANNEL,
    },
    timeDimension: 'createdDatetime',
})

const channelsEmailMessagesPerTicketBaseQuery = ({
    ctx,
    config,
}: {
    ctx: MessagesPerTicketContext
    config: typeof messagesPerTicketScope.config
}) => ({
    measures: ['averageMessagesCount'] as const,
    filters: getEmailChannelScopeFilters(ctx, config),
})

export const {
    valueQueryFactory: channelsEmailMessagesPerTicketValueQueryFactoryV2,
    breakdownQueryFactory:
        channelsEmailMessagesPerTicketBreakdownQueryFactoryV2,
    timeseriesQueryFactory:
        channelsEmailMessagesPerTicketTimeseriesQueryFactoryV2,
} = getGenericQueries(
    messagesPerTicketScope,
    channelsEmailMessagesPerTicketBaseQuery,
    {
        valueMetricName:
            METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_MESSAGES_PER_TICKET_VALUE,
        breakdownMetricName:
            METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_MESSAGES_PER_TICKET_BREAKDOWN,
        breakdownDimensionMetricNames: {
            channel:
                METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_MESSAGES_PER_TICKET_BREAKDOWN_PER_CHANNEL,
            agentId:
                METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_MESSAGES_PER_TICKET_BREAKDOWN_PER_AGENT,
        },
        timeseriesMetricName:
            METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_MESSAGES_PER_TICKET_TIMESERIES,
        timeseriesDimensionMetricNames: {
            channel:
                METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_MESSAGES_PER_TICKET_TIMESERIES_PER_CHANNEL,
        },
        timeDimension: 'createdDatetime',
    },
)
