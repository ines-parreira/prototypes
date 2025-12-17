import {
    ticketAverageHandleTime,
    ticketAverageHandleTimePerAgent,
    ticketAverageHandleTimePerAgentPerChannel,
    ticketAverageHandleTimePerAgentPerChannelQueryV2Factory,
    ticketAverageHandleTimePerAgentQueryV2Factory,
    ticketAverageHandleTimeQueryV2Factory,
} from 'domains/reporting/models/scopes/ticketHandleTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

describe('ticketHandleTimeScope', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const timezone = 'utc'

    const context = {
        filters,
        timezone,
    }

    describe('ticketAverageHandleTime', () => {
        it('creates query', () => {
            const actual = ticketAverageHandleTime.build(context)

            const expected = {
                measures: ['averageHandleTime'],
                timezone: 'utc',
                filters: [
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
                ],
                metricName: 'agentxp-ticket-average-handle-time',
                scope: 'ticket-handle-time',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('ticketAverageHandleTimePerAgent', () => {
        const expected = {
            measures: ['averageHandleTime'],
            dimensions: ['agentId'],
            timezone: 'utc',
            filters: [
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
            ],
            metricName: 'agentxp-ticket-average-handle-time-per-agent',
            scope: 'ticket-handle-time',
            limit: 10000,
        }

        it('creates query', () => {
            const actual = ticketAverageHandleTimePerAgent.build(context)

            expect(actual).toEqual(expected)
        })

        it('creates query with sort direction', () => {
            const actual = ticketAverageHandleTimePerAgent.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['handleTime', 'asc']],
            })
        })
    })

    describe('ticketAverageHandleTimePerChannel', () => {
        it('creates query', () => {
            const actual =
                ticketAverageHandleTimePerAgentPerChannelQueryV2Factory(context)

            const expected = {
                measures: ['averageHandleTime'],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: [
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
                ],
                metricName:
                    'agentxp-ticket-average-handle-time-per-agent-per-channel',
                scope: 'ticket-handle-time',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('ticketAverageHandleTimeQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    ticketAverageHandleTimeQueryV2Factory(context)
                const buildResult = ticketAverageHandleTime.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('ticketAverageHandleTimePerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    ticketAverageHandleTimePerAgentQueryV2Factory(context)
                const buildResult =
                    ticketAverageHandleTimePerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('ticketAverageHandleTimePerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    ticketAverageHandleTimePerAgentPerChannelQueryV2Factory(
                        context,
                    )
                const buildResult =
                    ticketAverageHandleTimePerAgentPerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})
