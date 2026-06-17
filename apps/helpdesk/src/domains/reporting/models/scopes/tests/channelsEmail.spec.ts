import {
    channelsEmailFirstResponseTimeBreakdownQueryFactoryV2,
    channelsEmailFirstResponseTimeTimeseriesQueryFactoryV2,
    channelsEmailFirstResponseTimeValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/firstResponseTime'
import {
    channelsEmailHumanResponseTimeAfterAiHandoffBreakdownQueryFactoryV2,
    channelsEmailHumanResponseTimeAfterAiHandoffTimeseriesQueryFactoryV2,
    channelsEmailHumanResponseTimeAfterAiHandoffValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import {
    channelsEmailMessagesPerTicketBreakdownQueryFactoryV2,
    channelsEmailMessagesPerTicketTimeseriesQueryFactoryV2,
    channelsEmailMessagesPerTicketValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/messagesPerTicket'
import {
    channelsEmailMessagesSentBreakdownQueryFactoryV2,
    channelsEmailMessagesSentTimeseriesQueryFactoryV2,
    channelsEmailMessagesSentValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/messagesSent'
import {
    channelsEmailResolutionTimeBreakdownQueryFactoryV2,
    channelsEmailResolutionTimeTimeseriesQueryFactoryV2,
    channelsEmailResolutionTimeValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/resolutionTime'
import {
    channelsEmailAverageCsatBreakdownQueryFactoryV2,
    channelsEmailAverageCsatTimeseriesQueryFactoryV2,
    channelsEmailAverageCsatValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/satisfactionSurveys'
import {
    channelsEmailClosedTicketsBreakdownQueryFactoryV2,
    channelsEmailClosedTicketsTimeseriesQueryFactoryV2,
    channelsEmailClosedTicketsValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/ticketsClosed'
import {
    channelsEmailCreatedTicketsBreakdownQueryFactoryV2,
    channelsEmailCreatedTicketsTimeseriesQueryFactoryV2,
    channelsEmailCreatedTicketsValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/ticketsCreated'
import { channelsEmailOpenTicketsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsOpen'
import {
    channelsEmailTicketsRepliedBreakdownQueryFactoryV2,
    channelsEmailTicketsRepliedTimeseriesQueryFactoryV2,
    channelsEmailTicketsRepliedValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/ticketsReplied'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

const filters: StatsFilters = {
    period: {
        start_datetime: '2025-09-03T00:00:00.000',
        end_datetime: '2025-09-03T23:59:59.000',
    },
}

const context = {
    filters,
    timezone: 'utc',
    granularity: 'day' as AggregationWindow,
}

const expectEmailChannelFilter = (query: { filters?: unknown }) =>
    expect(query.filters).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                member: 'channel',
                values: ['email', 'contact_form'],
            }),
        ]),
    )

const metrics = [
    {
        subject: 'average csat',
        prefix: 'performance-channels-email-average-csat',
        value: channelsEmailAverageCsatValueQueryFactoryV2,
        breakdown: channelsEmailAverageCsatBreakdownQueryFactoryV2,
        timeseries: channelsEmailAverageCsatTimeseriesQueryFactoryV2,
    },
    {
        subject: 'resolution time',
        prefix: 'performance-channels-email-resolution-time',
        value: channelsEmailResolutionTimeValueQueryFactoryV2,
        breakdown: channelsEmailResolutionTimeBreakdownQueryFactoryV2,
        timeseries: channelsEmailResolutionTimeTimeseriesQueryFactoryV2,
    },
    {
        subject: 'messages per ticket',
        prefix: 'performance-channels-email-messages-per-ticket',
        value: channelsEmailMessagesPerTicketValueQueryFactoryV2,
        breakdown: channelsEmailMessagesPerTicketBreakdownQueryFactoryV2,
        timeseries: channelsEmailMessagesPerTicketTimeseriesQueryFactoryV2,
    },
    {
        subject: 'first response time',
        prefix: 'performance-channels-email-first-response-time',
        value: channelsEmailFirstResponseTimeValueQueryFactoryV2,
        breakdown: channelsEmailFirstResponseTimeBreakdownQueryFactoryV2,
        timeseries: channelsEmailFirstResponseTimeTimeseriesQueryFactoryV2,
    },
    {
        subject: 'human response time after ai handoff',
        prefix: 'performance-channels-email-human-response-time-after-ai-handoff',
        value: channelsEmailHumanResponseTimeAfterAiHandoffValueQueryFactoryV2,
        breakdown:
            channelsEmailHumanResponseTimeAfterAiHandoffBreakdownQueryFactoryV2,
        timeseries:
            channelsEmailHumanResponseTimeAfterAiHandoffTimeseriesQueryFactoryV2,
    },
    {
        subject: 'created tickets',
        prefix: 'performance-channels-email-created-tickets',
        value: channelsEmailCreatedTicketsValueQueryFactoryV2,
        breakdown: channelsEmailCreatedTicketsBreakdownQueryFactoryV2,
        timeseries: channelsEmailCreatedTicketsTimeseriesQueryFactoryV2,
    },
    {
        subject: 'closed tickets',
        prefix: 'performance-channels-email-closed-tickets',
        value: channelsEmailClosedTicketsValueQueryFactoryV2,
        breakdown: channelsEmailClosedTicketsBreakdownQueryFactoryV2,
        timeseries: channelsEmailClosedTicketsTimeseriesQueryFactoryV2,
    },
    {
        subject: 'tickets replied',
        prefix: 'performance-channels-email-tickets-replied',
        value: channelsEmailTicketsRepliedValueQueryFactoryV2,
        breakdown: channelsEmailTicketsRepliedBreakdownQueryFactoryV2,
        timeseries: channelsEmailTicketsRepliedTimeseriesQueryFactoryV2,
    },
    {
        subject: 'messages sent',
        prefix: 'performance-channels-email-messages-sent',
        value: channelsEmailMessagesSentValueQueryFactoryV2,
        breakdown: channelsEmailMessagesSentBreakdownQueryFactoryV2,
        timeseries: channelsEmailMessagesSentTimeseriesQueryFactoryV2,
    },
] as const

describe('channels email query factories', () => {
    describe.each(metrics)(
        '$subject',
        ({ subject, prefix, value, breakdown, timeseries }) => {
            it('value query uses the channels-email metric name and email channel filter', () => {
                const query = value(context)

                expect(query.metricName).toBe(`${prefix}-value`)
                expectEmailChannelFilter(query)
            })

            it('breakdown query uses the default metric name and email channel filter for unmapped dims', () => {
                const query = breakdown({
                    ...context,
                    dimensions: ['integrationId'],
                })

                expect(query.metricName).toBe(`${prefix}-breakdown`)
                expectEmailChannelFilter(query)
            })

            it.each([
                ['channel', 'breakdown-per-channel'],
                ['agentId', 'breakdown-per-agent'],
            ] as const)(
                'breakdown query uses the per-dimension metric name when ctx.dimensions=[%s]',
                (dimension, suffix) => {
                    const query = breakdown({
                        ...context,
                        dimensions: [dimension],
                    })

                    expect(query.metricName).toBe(`${prefix}-${suffix}`)
                    expectEmailChannelFilter(query)
                },
            )

            it('timeseries query uses the channels-email metric name and email channel filter', () => {
                const query = timeseries({ ...context, dimensions: [] })

                expect(query.metricName).toBe(`${prefix}-timeseries`)
                expectEmailChannelFilter(query)
            })

            if (subject !== 'human response time after ai handoff') {
                it('timeseries query uses the per-channel metric name when ctx.dimensions=[channel]', () => {
                    const query = timeseries({
                        ...context,
                        dimensions: ['channel'],
                    })

                    expect(query.metricName).toBe(
                        `${prefix}-timeseries-per-channel`,
                    )
                    expectEmailChannelFilter(query)
                })
            }
        },
    )

    describe('open tickets', () => {
        it('value query uses the channels-email metric name and email channel filter', () => {
            const query = channelsEmailOpenTicketsValueQueryFactoryV2(context)

            expect(query.metricName).toBe(
                'performance-channels-email-open-tickets-value',
            )
            expect(query.scope).toBe('tickets-open')
            expect(query.measures).toEqual(['ticketCount'])
            expectEmailChannelFilter(query)
        })

        it('value query includes the period filters', () => {
            const query = channelsEmailOpenTicketsValueQueryFactoryV2(context)

            expect(query.filters).toEqual(
                expect.arrayContaining([
                    {
                        member: 'periodStart',
                        operator: 'afterDate',
                        values: ['2025-09-03T00:00:00.000'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59.000'],
                    },
                ]),
            )
        })
    })
})
