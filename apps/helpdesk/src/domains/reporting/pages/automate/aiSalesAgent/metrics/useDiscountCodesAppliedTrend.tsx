import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { discountCodesAppliedQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

const useDiscountCodesAppliedTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        discountCodesAppliedQueryFactory(filters, timezone),
        discountCodesAppliedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

const fetchDiscountCodesAppliedTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        discountCodesAppliedQueryFactory(filters, timezone),
        discountCodesAppliedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export { useDiscountCodesAppliedTrend, fetchDiscountCodesAppliedTrend }
