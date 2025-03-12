import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { discountCodesAppliedQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

const useDiscountCodesApplied = (filters: StatsFilters, timezone: string) =>
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

const fetchDiscountCodesApplied = (filters: StatsFilters, timezone: string) =>
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

export { useDiscountCodesApplied, fetchDiscountCodesApplied }
