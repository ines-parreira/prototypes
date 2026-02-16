import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { totalNumberOfOrderQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { AISalesAgentTotalNumberOfOrderQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

const useTotalNumberOfOrdersTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        totalNumberOfOrderQueryFactory(filters, timezone),
        totalNumberOfOrderQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        AISalesAgentTotalNumberOfOrderQueryFactoryV2({ filters, timezone }),
        AISalesAgentTotalNumberOfOrderQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

const fetchTotalNumberOfOrdersTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        totalNumberOfOrderQueryFactory(filters, timezone),
        totalNumberOfOrderQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        AISalesAgentTotalNumberOfOrderQueryFactoryV2({ filters, timezone }),
        AISalesAgentTotalNumberOfOrderQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export { useTotalNumberOfOrdersTrend, fetchTotalNumberOfOrdersTrend }
