import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { discountCodesOfferedQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { AISalesAgentDiscountCodesOfferedQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentConversations'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

const useDiscountCodesOfferedTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        discountCodesOfferedQueryFactory(filters, timezone),
        discountCodesOfferedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        AISalesAgentDiscountCodesOfferedQueryFactoryV2({
            filters,
            timezone,
        }),
        AISalesAgentDiscountCodesOfferedQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

const fetchDiscountCodesOfferedTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        discountCodesOfferedQueryFactory(filters, timezone),
        discountCodesOfferedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        AISalesAgentDiscountCodesOfferedQueryFactoryV2({
            filters,
            timezone,
        }),
        AISalesAgentDiscountCodesOfferedQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export { useDiscountCodesOfferedTrend, fetchDiscountCodesOfferedTrend }
