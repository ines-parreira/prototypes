import {
    dynamicOverallAutomatedInteractions,
    dynamicOverallAutomatedInteractionsQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

describe('overallAutomatedInteractionsScope', () => {
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

    const periodFilters = [
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
    ]

    describe('dynamicOverallAutomatedInteractions', () => {
        it('creates query without dimensions when no dimension provided', () => {
            const actual = dynamicOverallAutomatedInteractions.build({
                ...context,
                dimensions: [],
            })

            const expected = {
                metricName: 'ai-agent-dynamic-overall-automated-interactions',
                scope: 'overall-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: [],
                timezone: 'utc',
                filters: periodFilters,
            }

            expect(actual).toEqual(expected)
        })

        it('creates query with the provided dimension', () => {
            const actual = dynamicOverallAutomatedInteractions.build({
                ...context,
                dimensions: ['channel'],
            })

            const expected = {
                metricName: 'ai-agent-dynamic-overall-automated-interactions',
                scope: 'overall-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: periodFilters,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('dynamicOverallAutomatedInteractionsQueryFactoryV2', () => {
            it('returns query with empty dimensions when no dimension provided', () => {
                const factoryResult =
                    dynamicOverallAutomatedInteractionsQueryFactoryV2(context)

                expect(factoryResult.dimensions).toBeUndefined()
            })

            it('returns query with the provided dimension', () => {
                const dimension = 'channel'
                const factoryResult =
                    dynamicOverallAutomatedInteractionsQueryFactoryV2({
                        ...context,
                        dimensions: [dimension],
                    })

                expect(factoryResult.dimensions).toEqual(['channel'])
            })

            it('returns the same result as calling build directly with the dimension', () => {
                const dimension = 'automationFeatureType'
                const factoryResult =
                    dynamicOverallAutomatedInteractionsQueryFactoryV2({
                        ...context,
                        dimensions: [dimension],
                    })
                const buildResult = dynamicOverallAutomatedInteractions.build({
                    ...context,
                    dimensions: [dimension],
                })

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})
