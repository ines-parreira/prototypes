import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { discountCodesAverageQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

const useDiscountCodesAverageValueTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        discountCodesAverageQueryFactory(filters, timezone),
        discountCodesAverageQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

const fetchDiscountCodesAverageValueTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        discountCodesAverageQueryFactory(filters, timezone),
        discountCodesAverageQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export {
    useDiscountCodesAverageValueTrend,
    fetchDiscountCodesAverageValueTrend,
}
