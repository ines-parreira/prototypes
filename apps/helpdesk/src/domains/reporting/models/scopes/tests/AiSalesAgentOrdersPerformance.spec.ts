import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    AiSalesAgentTotalSalesAmount,
    AiSalesAgentTotalSalesAmountQueryFactoryV2,
} from 'domains/reporting/models/scopes/AiSalesAgentOrdersPerformance'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

describe('AiSalesAgentOrdersPerformance scope', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-22T00:00:00',
            end_datetime: '2025-09-22T23:59:59',
        },
    }

    const context = { filters, timezone: 'UTC' }

    const periodFilters = [
        {
            member: 'periodStart',
            operator: 'afterDate',
            values: ['2025-09-22T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: 'beforeDate',
            values: ['2025-09-22T23:59:59.000'],
        },
    ]

    describe('AiSalesAgentTotalSalesAmount', () => {
        it('builds query with correct metricName, scope, measure, and period filters', () => {
            const result = AiSalesAgentTotalSalesAmount.build(context)

            expect(result).toEqual({
                metricName: METRIC_NAMES.AI_SALES_AGENT_TOTAL_SALES_AMOUNT,
                scope: MetricScope.AiSalesAgentOrdersPerformance,
                measures: ['totalSalesAmount'],
                dimensions: undefined,
                timezone: 'UTC',
                filters: periodFilters,
            })
        })

        it('does not include extra filters when none are provided', () => {
            const result = AiSalesAgentTotalSalesAmount.build(context)

            expect(result.filters).toHaveLength(2)
            expect(result.filters).toEqual(periodFilters)
        })
    })

    describe('AiSalesAgentTotalSalesAmountQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            expect(AiSalesAgentTotalSalesAmountQueryFactoryV2(context)).toEqual(
                AiSalesAgentTotalSalesAmount.build(context),
            )
        })
    })
})
