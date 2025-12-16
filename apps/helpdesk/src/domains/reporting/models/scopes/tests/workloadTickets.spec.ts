import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { Context } from 'domains/reporting/models/scopes/scope'
import {
    workloadTicketsPerChannel,
    workloadTicketsPerChannelQueryV2Factory,
} from 'domains/reporting/models/scopes/workloadTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

describe('workloadTicketsScope', () => {
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

    describe('workloadTicketsPerChannel', () => {
        it('creates query', () => {
            const actual = workloadTicketsPerChannel.build(context)

            const expected = {
                measures: ['ticketCount'],
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
                metricName: 'support-performance-workload-per-channel',
                scope: 'workload-tickets',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('workloadTicketsPerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    workloadTicketsPerChannelQueryV2Factory(context)
                const buildResult = workloadTicketsPerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles filters correctly', () => {
                const contextWithFilters: Context = {
                    ...context,
                    filters: {
                        ...filters,
                        agents: withLogicalOperator([1, 2, 3]),
                        channels: withLogicalOperator(['email', 'chat']),
                    },
                }

                const factoryResult =
                    workloadTicketsPerChannelQueryV2Factory(contextWithFilters)

                expect(factoryResult.filters).toEqual(
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
                        {
                            member: 'agentId',
                            operator: 'one-of',
                            values: [1, 2, 3],
                        },
                        {
                            member: 'channel',
                            operator: 'one-of',
                            values: ['email', 'chat'],
                        },
                    ]),
                )
            })
        })
    })
})
