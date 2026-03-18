import {
    flowDatasetHandoverInteractionsPerFlows,
    flowDatasetHandoverInteractionsPerFlowsQueryFactoryV2,
} from 'domains/reporting/models/scopes/flowDataset'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

describe('flowDatasetScope', () => {
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

    describe('flowDatasetHandoverInteractionsPerFlows', () => {
        it('creates query with flowId dimension and handoverInteractionsCount measure', () => {
            const actual =
                flowDatasetHandoverInteractionsPerFlows.build(context)

            expect(actual).toEqual({
                metricName: 'flow-dataset-handover-interactions',
                scope: 'flow-dataset',
                measures: ['handoverInteractionsCount'],
                dimensions: ['flowId'],
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
            })
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('flowDatasetHandoverInteractionsPerFlowsQueryFactoryV2', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    flowDatasetHandoverInteractionsPerFlowsQueryFactoryV2(
                        context,
                    )
                const buildResult =
                    flowDatasetHandoverInteractionsPerFlows.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})
