import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { discountCodesAverageQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

import { fetchGenericTrend, useGenericTrend } from './useGenericTrend'

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
            ),
        },
        ({ discountCodesAverage }) => discountCodesAverage || 0,
    )

export {
    useDiscountCodesAverageValueTrend,
    fetchDiscountCodesAverageValueTrend,
}
