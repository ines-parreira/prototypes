import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    humanResponseTimeAfterAiHandoffDrillDownQueryFactory,
    humanResponseTimeAfterAiHandoffPerAgentQueryFactory,
    humanResponseTimeAfterAiHandoffPerChannelQueryFactory,
    humanResponseTimeAfterAiHandoffQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/humanResponseTimeAfterAiHandoff'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

describe('humanResponseTimeAfterAiHandoff', () => {
    const periodStart = '2025-01-01T00:00:00'
    const periodEnd = '2025-01-07T23:59:59'

    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    describe('base query factory', () => {
        it('creates valid query', () => {
            const actual = humanResponseTimeAfterAiHandoffQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            const expected = {
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_HUMAN_RESPONSE_TIME_AFTER_AI_HANDOFF,
                measures: [
                    'TicketFirstHumanAgentResponseTime.medianFirstHumanAgentResponseTime',
                ],
                dimensions: [],
                timezone: 'someTimeZone',
                filters: [
                    {
                        member: 'TicketEnriched.isTrashed',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketEnriched.isSpam',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketFirstHumanAgentResponseTime.firstHumanAgentMessageDatetime',
                        operator: 'inDateRange',
                        values: [
                            '2025-01-01T00:00:00.000',
                            '2025-01-07T23:59:59.000',
                        ],
                    },
                    {
                        member: 'TicketEnriched.periodStart',
                        operator: 'afterDate',
                        values: ['2025-01-01T00:00:00.000'],
                    },
                    {
                        member: 'TicketEnriched.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-01-07T23:59:59.000'],
                    },
                ],
                order: [
                    [
                        'TicketFirstHumanAgentResponseTime.medianFirstHumanAgentResponseTime',
                        'asc',
                    ],
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('per agent query factory', () => {
        it('creates valid query', () => {
            const actual = humanResponseTimeAfterAiHandoffPerAgentQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            const expected = {
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_HUMAN_RESPONSE_TIME_AFTER_AI_HANDOFF_PER_AGENT,
                measures: [
                    'TicketFirstHumanAgentResponseTime.medianFirstHumanAgentResponseTime',
                ],
                dimensions: [
                    'TicketFirstHumanAgentResponseTime.firstHumanAgentMessageUserId',
                ],
                timezone: 'someTimeZone',
                filters: [
                    {
                        member: 'TicketEnriched.isTrashed',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketEnriched.isSpam',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketFirstHumanAgentResponseTime.firstHumanAgentMessageDatetime',
                        operator: 'inDateRange',
                        values: [
                            '2025-01-01T00:00:00.000',
                            '2025-01-07T23:59:59.000',
                        ],
                    },
                    {
                        member: 'TicketEnriched.periodStart',
                        operator: 'afterDate',
                        values: ['2025-01-01T00:00:00.000'],
                    },
                    {
                        member: 'TicketEnriched.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-01-07T23:59:59.000'],
                    },
                ],
                order: [
                    [
                        'TicketFirstHumanAgentResponseTime.medianFirstHumanAgentResponseTime',
                        'asc',
                    ],
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('per channel query factory', () => {
        it('creates valid query', () => {
            const actual =
                humanResponseTimeAfterAiHandoffPerChannelQueryFactory(
                    statsFilters,
                    timezone,
                    sorting,
                )

            const expected = {
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_HUMAN_RESPONSE_TIME_AFTER_AI_HANDOFF_PER_CHANNEL,
                measures: [
                    'TicketFirstHumanAgentResponseTime.medianFirstHumanAgentResponseTime',
                ],
                dimensions: ['TicketEnriched.channel'],
                timezone: 'someTimeZone',
                filters: [
                    {
                        member: 'TicketEnriched.isTrashed',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketEnriched.isSpam',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketFirstHumanAgentResponseTime.firstHumanAgentMessageDatetime',
                        operator: 'inDateRange',
                        values: [
                            '2025-01-01T00:00:00.000',
                            '2025-01-07T23:59:59.000',
                        ],
                    },
                    {
                        member: 'TicketEnriched.periodStart',
                        operator: 'afterDate',
                        values: ['2025-01-01T00:00:00.000'],
                    },
                    {
                        member: 'TicketEnriched.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-01-07T23:59:59.000'],
                    },
                ],
                order: [
                    [
                        'TicketFirstHumanAgentResponseTime.medianFirstHumanAgentResponseTime',
                        'asc',
                    ],
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('drill-down query factory', () => {
        it('creates valid query', () => {
            const actual = humanResponseTimeAfterAiHandoffDrillDownQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            const expected = {
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_HUMAN_RESPONSE_TIME_AFTER_AI_HANDOFF_DRILL_DOWN,
                measures: [
                    'TicketFirstHumanAgentResponseTime.medianFirstHumanAgentResponseTime',
                ],
                dimensions: [
                    'TicketEnriched.ticketId',
                    'TicketFirstHumanAgentResponseTime.firstHumanAgentResponseTime',
                    'TicketFirstHumanAgentResponseTime.firstHumanAgentMessageUserId',
                ],
                timezone: 'someTimeZone',
                filters: [
                    {
                        member: 'TicketEnriched.isTrashed',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketEnriched.isSpam',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketFirstHumanAgentResponseTime.firstHumanAgentMessageDatetime',
                        operator: 'inDateRange',
                        values: [
                            '2025-01-01T00:00:00.000',
                            '2025-01-07T23:59:59.000',
                        ],
                    },
                    {
                        member: 'TicketEnriched.periodStart',
                        operator: 'afterDate',
                        values: ['2025-01-01T00:00:00.000'],
                    },
                    {
                        member: 'TicketEnriched.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-01-07T23:59:59.000'],
                    },
                ],
                limit: 100,
                order: [
                    [
                        'TicketFirstHumanAgentResponseTime.medianFirstHumanAgentResponseTime',
                        'asc',
                    ],
                ],
            }

            expect(actual).toEqual(expected)
        })
    })
})
