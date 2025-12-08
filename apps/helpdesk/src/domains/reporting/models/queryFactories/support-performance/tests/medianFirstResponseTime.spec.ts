import {
    medianFirstAgentResponseTimePerAgentQueryFactory,
    medianFirstAgentResponseTimePerChannelQueryFactory,
    medianFirstAgentResponseTimePerTicketDrillDownQueryFactory,
    medianFirstAgentResponseTimeQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

describe('medianFirstAgentResponseTime', () => {
    const timezone = 'utc'
    const sorting = OrderDirection.Asc
    const periodStart = '2025-09-09T00:00:00'
    const periodEnd = '2025-09-09T23:59:59'
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }

    describe('medianFirstAgentResponseTimeQueryFactory', () => {
        const baseQuery = {
            metricName: 'support-performance-median-first-agent-response-time',
            measures: [
                'TicketFirstAgentResponseTime.medianFirstAgentResponseTime',
            ],
            dimensions: [],
            timezone: 'utc',
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
                    member: 'TicketFirstAgentResponseTime.firstAgentMessageDatetime',
                    operator: 'inDateRange',
                    values: [
                        '2025-09-09T00:00:00.000',
                        '2025-09-09T23:59:59.000',
                    ],
                },
                {
                    member: 'TicketEnriched.periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-09T00:00:00.000'],
                },
                {
                    member: 'TicketEnriched.periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-09T23:59:59.000'],
                },
            ],
        }

        it('builds query', () => {
            const actual = medianFirstAgentResponseTimeQueryFactory(
                statsFilters,
                timezone,
            )

            const expected = { ...baseQuery }

            expect(actual).toEqual(expected)
        })

        it('builds query with sorting', () => {
            const actual = medianFirstAgentResponseTimeQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            const expected = {
                ...baseQuery,
                order: [
                    [
                        'TicketFirstAgentResponseTime.medianFirstAgentResponseTime',
                        'asc',
                    ],
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('medianFirstAgentResponseTimePerAgentQueryFactory', () => {
        const baseQuery = {
            metricName:
                'support-performance-median-first-agent-response-time-per-agent',
            measures: [
                'TicketFirstAgentResponseTime.medianFirstAgentResponseTime',
            ],
            dimensions: [
                'TicketFirstAgentResponseTime.firstAgentMessageUserId',
            ],
            timezone: 'utc',
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
                    member: 'TicketFirstAgentResponseTime.firstAgentMessageDatetime',
                    operator: 'inDateRange',
                    values: [
                        '2025-09-09T00:00:00.000',
                        '2025-09-09T23:59:59.000',
                    ],
                },
                {
                    member: 'TicketEnriched.periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-09T00:00:00.000'],
                },
                {
                    member: 'TicketEnriched.periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-09T23:59:59.000'],
                },
            ],
        }

        it('builds query', () => {
            const actual = medianFirstAgentResponseTimePerAgentQueryFactory(
                statsFilters,
                timezone,
            )

            const expected = { ...baseQuery }

            expect(actual).toEqual(expected)
        })

        it('builds query with sorting', () => {
            const actual = medianFirstAgentResponseTimePerAgentQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            const expected = {
                ...baseQuery,
                order: [
                    [
                        'TicketFirstAgentResponseTime.medianFirstAgentResponseTime',
                        'asc',
                    ],
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('medianFirstAgentResponseTimePerChannelQueryFactory', () => {
        const baseQuery = {
            metricName:
                'support-performance-median-first-agent-response-time-per-channel',
            measures: [
                'TicketFirstAgentResponseTime.medianFirstAgentResponseTime',
            ],
            dimensions: ['TicketEnriched.channel'],
            timezone: 'utc',
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
                    member: 'TicketFirstAgentResponseTime.firstAgentMessageDatetime',
                    operator: 'inDateRange',
                    values: [
                        '2025-09-09T00:00:00.000',
                        '2025-09-09T23:59:59.000',
                    ],
                },
                {
                    member: 'TicketEnriched.periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-09T00:00:00.000'],
                },
                {
                    member: 'TicketEnriched.periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-09T23:59:59.000'],
                },
            ],
        }

        it('builds query', () => {
            const actual = medianFirstAgentResponseTimePerChannelQueryFactory(
                statsFilters,
                timezone,
            )

            const expected = { ...baseQuery }

            expect(actual).toEqual(expected)
        })

        it('builds query with sorting', () => {
            const actual = medianFirstAgentResponseTimePerChannelQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            const expected = {
                ...baseQuery,
                order: [
                    [
                        'TicketFirstAgentResponseTime.medianFirstAgentResponseTime',
                        'asc',
                    ],
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('medianFirstAgentResponseTimePerTicketDrillDownQueryFactory', () => {
        const baseQuery = {
            metricName:
                'support-performance-median-first-agent-response-time-per-ticket-drill-down',
            measures: [],
            dimensions: [
                'TicketEnriched.ticketId',
                'TicketFirstAgentResponseTime.firstAgentResponseTime',
                'TicketFirstAgentResponseTime.firstAgentMessageUserId',
            ],
            timezone: 'utc',
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
                    member: 'TicketFirstAgentResponseTime.firstAgentMessageDatetime',
                    operator: 'inDateRange',
                    values: [
                        '2025-09-09T00:00:00.000',
                        '2025-09-09T23:59:59.000',
                    ],
                },
                {
                    member: 'TicketEnriched.periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-09T00:00:00.000'],
                },
                {
                    member: 'TicketEnriched.periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-09T23:59:59.000'],
                },
            ],
            limit: 100,
        }

        it('builds query', () => {
            const actual =
                medianFirstAgentResponseTimePerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                )

            const expected = { ...baseQuery }

            expect(actual).toEqual(expected)
        })

        it('builds query with sorting', () => {
            const actual =
                medianFirstAgentResponseTimePerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    sorting,
                )

            const expected = {
                ...baseQuery,
                order: [
                    [
                        'TicketFirstAgentResponseTime.firstAgentResponseTime',
                        'asc',
                    ],
                ],
            }

            expect(actual).toEqual(expected)
        })
    })
})
