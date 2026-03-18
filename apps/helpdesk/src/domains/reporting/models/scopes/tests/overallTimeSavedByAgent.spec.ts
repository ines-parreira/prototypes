import {
    overallTimeSavedByAgentForOrderManagement,
    overallTimeSavedByAgentForOrderManagementQueryFactoryV2,
    overallTimeSavedByAgentPerFlows,
    overallTimeSavedByAgentPerFlowsQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallTimeSavedByAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

describe('overallTimeSavedByAgentScope', () => {
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

    describe('overallTimeSavedByAgentForOrderManagement', () => {
        it('creates query with orderManagementType dimension and OrderManagement feature filter', () => {
            const actual =
                overallTimeSavedByAgentForOrderManagement.build(context)

            expect(actual).toEqual({
                metricName:
                    'overall-time-saved-by-agent-per-order-management-type',
                scope: 'overall-time-saved-by-agent',
                measures: ['averageTimeSavedByAgent'],
                dimensions: ['orderManagementType'],
                timezone: 'utc',
                filters: [
                    ...periodFilters,
                    {
                        member: 'automationFeatureType',
                        operator: 'one-of',
                        values: ['order-management'],
                    },
                ],
            })
        })
    })

    describe('overallTimeSavedByAgentPerFlows', () => {
        it('creates query with flowId dimension and Flows feature filter', () => {
            const actual = overallTimeSavedByAgentPerFlows.build(context)

            expect(actual).toEqual({
                metricName: 'overall-time-saved-by-agent-per-flows',
                scope: 'overall-time-saved-by-agent',
                measures: ['averageTimeSavedByAgent'],
                dimensions: ['flowId'],
                timezone: 'utc',
                filters: [
                    ...periodFilters,
                    {
                        member: 'automationFeatureType',
                        operator: 'one-of',
                        values: ['flow'],
                    },
                ],
            })
        })
    })

    describe('overallTimeSavedByAgentPerFlowsQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            const factoryResult =
                overallTimeSavedByAgentPerFlowsQueryFactoryV2(context)
            const buildResult = overallTimeSavedByAgentPerFlows.build(context)

            expect(factoryResult).toEqual(buildResult)
        })
    })

    describe('overallTimeSavedByAgentForOrderManagementQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            const factoryResult =
                overallTimeSavedByAgentForOrderManagementQueryFactoryV2(context)
            const buildResult =
                overallTimeSavedByAgentForOrderManagement.build(context)

            expect(factoryResult).toEqual(buildResult)
        })
    })
})
