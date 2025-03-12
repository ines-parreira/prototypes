import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { discountCodesOfferedQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

const useDiscountCodesOffered = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        discountCodesOfferedQueryFactory(filters, timezone),
        discountCodesOfferedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

const fetchDiscountCodesOffered = (filters: StatsFilters, timezone: string) =>
    fetchMetricTrend(
        discountCodesOfferedQueryFactory(filters, timezone),
        discountCodesOfferedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export { useDiscountCodesOffered, fetchDiscountCodesOffered }
