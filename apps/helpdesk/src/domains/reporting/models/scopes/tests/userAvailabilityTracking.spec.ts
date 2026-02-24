import {
    availabilityTrackingPerAgent,
    availabilityTrackingPerAgentPerStatus,
    availabilityTrackingPerAgentPerStatusQueryV2Factory,
    availabilityTrackingPerAgentQueryV2Factory,
} from 'domains/reporting/models/scopes/userAvailabilityTracking'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

describe('userAvailabilityTrackingScope', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59',
        },
    }

    const timezone = 'utc'

    const context = {
        filters,
        timezone,
    }

    describe('availabilityTrackingPerAgent', () => {
        const expected = {
            measures: ['onlineDurationSeconds'],
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
            metricName: 'agentxp-availability-tracking-per-agent',
            scope: 'user-availability-tracking',
        }

        it('creates query', () => {
            const actual = availabilityTrackingPerAgent.build(context)

            expect(actual).toEqual(expected)
        })

        it('creates query with sort direction', () => {
            const actual = availabilityTrackingPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['onlineDurationSeconds', 'asc']],
            })
        })
    })

    describe('availabilityTrackingPerAgentPerStatus', () => {
        it('creates query', () => {
            const actual = availabilityTrackingPerAgentPerStatus.build(context)

            const expected = {
                measures: ['totalDurationSeconds'],
                dimensions: ['agentId', 'statusName'],
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
                    'agentxp-availability-tracking-per-agent-per-status',
                scope: 'user-availability-tracking',
                limit: 10000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('availabilityTrackingPerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    availabilityTrackingPerAgentQueryV2Factory(context)
                const buildResult = availabilityTrackingPerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('availabilityTrackingPerAgentPerStatusQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    availabilityTrackingPerAgentPerStatusQueryV2Factory(context)
                const buildResult =
                    availabilityTrackingPerAgentPerStatus.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})
