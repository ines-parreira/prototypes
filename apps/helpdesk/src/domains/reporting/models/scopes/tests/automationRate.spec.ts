import {
    aiAgentAutomationRate,
    aiAgentAutomationRateQueryV2Factory,
    overallAutomationRate,
    overallAutomationRateQueryV2Factory,
} from 'domains/reporting/models/scopes/automationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

describe('automationRateScope', () => {
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
                scope: 'automation-rate',
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
                scope: 'automation-rate',
                measures: ['aiAgentAutomationRate'],
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
        describe('overallAutomationRateQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    overallAutomationRateQueryV2Factory(context)
                const buildResult = overallAutomationRate.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('aiAgentAutomationRateQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    aiAgentAutomationRateQueryV2Factory(context)
                const buildResult = aiAgentAutomationRate.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})
