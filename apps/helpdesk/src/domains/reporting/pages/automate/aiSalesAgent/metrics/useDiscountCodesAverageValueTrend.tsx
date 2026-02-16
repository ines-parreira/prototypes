import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { discountCodesAverageQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { AISalesAgentDiscountCodesAverageQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchGenericTrend,
    useGenericTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

const useDiscountCodesAverageValueTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useGenericTrend(
        {
            discountCodesAverage: useMetricTrend(
                discountCodesAverageQueryFactory(filters, timezone),
                discountCodesAverageQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                ),
                AISalesAgentDiscountCodesAverageQueryFactoryV2({
                    filters,
                    timezone,
                }),
                AISalesAgentDiscountCodesAverageQueryFactoryV2({
                    filters: {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                }),
            ),
        },
        ({ discountCodesAverage }) => discountCodesAverage || 0,
    )

const fetchDiscountCodesAverageValueTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchGenericTrend(
        {
            discountCodesAverage: fetchMetricTrend(
                discountCodesAverageQueryFactory(filters, timezone),
                discountCodesAverageQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                ),
                AISalesAgentDiscountCodesAverageQueryFactoryV2({
                    filters,
                    timezone,
                }),
                AISalesAgentDiscountCodesAverageQueryFactoryV2({
                    filters: {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                }),
            ),
        },
        ({ discountCodesAverage }) => discountCodesAverage || 0,
    )

export {
    useDiscountCodesAverageValueTrend,
    fetchDiscountCodesAverageValueTrend,
}
