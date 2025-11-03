import {
    medianResolutionTime,
    medianResolutionTimePerAgent,
    medianResolutionTimePerAgentQueryV2Factory,
    medianResolutionTimePerChannel,
    medianResolutionTimePerChannelQueryV2Factory,
    medianResolutionTimeQueryV2Factory,
} from 'domains/reporting/models/scopes/resolutionTime'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

describe('resolutionTimeScope', () => {
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

    describe('medianResolutionTime', () => {
        it('creates query', () => {
            const actual = medianResolutionTime.build(context)

            const expected = {
                measures: ['medianResolutionTime'],
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
                metricName: 'support-performance-median-resolution-time',
                scope: 'resolution-time',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('medianResolutionTimePerAgent', () => {
        const expected = {
            measures: ['medianResolutionTime'],
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
            metricName: 'support-performance-median-resolution-time-per-agent',
            scope: 'resolution-time',
        }

        it('creates query', () => {
            const actual = medianResolutionTimePerAgent.build(context)

            expect(actual).toEqual(expected)
        })

        it('creates query with sort direction', () => {
            const actual = medianResolutionTimePerAgent.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['medianResolutionTime', 'asc']],
            })
        })
    })

    describe('medianResolutionTimePerChannel', () => {
        it('creates query', () => {
            const actual = medianResolutionTimePerChannel.build(context)

            const expected = {
                measures: ['medianResolutionTime'],
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
                    'support-performance-median-resolution-time-per-channel',
                scope: 'resolution-time',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('medianResolutionTimeQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    medianResolutionTimeQueryV2Factory(context)
                const buildResult = medianResolutionTime.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('medianResolutionTimePerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    medianResolutionTimePerAgentQueryV2Factory(context)
                const buildResult = medianResolutionTimePerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('medianResolutionTimePerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    medianResolutionTimePerChannelQueryV2Factory(context)
                const buildResult =
                    medianResolutionTimePerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})
