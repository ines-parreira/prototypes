import {
    ticketAverageHandleTime,
    ticketAverageHandleTimePerAgent,
    ticketAverageHandleTimePerAgentQueryV2Factory,
    ticketAverageHandleTimePerChannel,
    ticketAverageHandleTimePerChannelQueryV2Factory,
    ticketAverageHandleTimeQueryV2Factory,
    ticketHandleTime,
    ticketHandleTimeQueryV2Factory,
} from 'domains/reporting/models/scopes/ticketHandleTime'
import { StatsFilters } from 'domains/reporting/models/stat/types'

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

    describe('ticketHandleTime', () => {
        it('creates query', () => {
            const actual = ticketHandleTime.build(context)

            const expected = {
                measures: ['handleTime'],
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
                metricName: 'agentxp-ticket-handle-time',
                scope: 'ticket-handle-time',
            }

            expect(actual).toEqual(expected)
        })
    })

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
        it('creates query', () => {
            const actual = ticketAverageHandleTimePerAgent.build(context)

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
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('ticketAverageHandleTimePerChannel', () => {
        it('creates query', () => {
            const actual = ticketAverageHandleTimePerChannel.build(context)

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
        describe('ticketHandleTimeQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = ticketHandleTimeQueryV2Factory(context)
                const buildResult = ticketHandleTime.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

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
                    ticketAverageHandleTimePerChannelQueryV2Factory(context)
                const buildResult =
                    ticketAverageHandleTimePerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})
