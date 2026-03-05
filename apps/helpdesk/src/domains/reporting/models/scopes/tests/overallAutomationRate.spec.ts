import {
    aiAgentAutomationRate,
    aiAgentAutomationRateQueryFactoryV2,
    automationRatePerFeature,
    automationRatePerFeatureQueryFactoryV2,
    overallAutomationRate,
    overallAutomationRateQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

describe('overallAutomationRateScope', () => {
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

    describe('overallAutomationRate', () => {
        it('creates query', () => {
            const actual = overallAutomationRate.build(context)

            const expected = {
                metricName: 'ai-agent-overall-automation-rate',
                scope: 'overall-automation-rate',
                measures: ['automationRate'],
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
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('aiAgentAutomationRate', () => {
        it('creates query', () => {
            const actual = aiAgentAutomationRate.build(context)

            const expected = {
                metricName: 'ai-agent-automation-rate',
                scope: 'overall-automation-rate',
                measures: ['automationRate'],
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
                    {
                        member: 'automationFeatureType',
                        operator: 'one-of',
                        values: ['ai-agent'],
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('automationRatePerFeature', () => {
        it('creates query with automationFeatureType dimension', () => {
            const actual = automationRatePerFeature.build(context)

            const expected = {
                metricName: 'ai-agent-automation-rate-per-feature',
                scope: 'overall-automation-rate',
                measures: ['automationRate'],
                dimensions: ['automationFeatureType'],
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
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('overallAutomationRateQueryFactoryV2', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    overallAutomationRateQueryFactoryV2(context)
                const buildResult = overallAutomationRate.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('aiAgentAutomationRateQueryFactoryV2', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    aiAgentAutomationRateQueryFactoryV2(context)
                const buildResult = aiAgentAutomationRate.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('automationRatePerFeatureQueryFactoryV2', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    automationRatePerFeatureQueryFactoryV2(context)
                const buildResult = automationRatePerFeature.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})
