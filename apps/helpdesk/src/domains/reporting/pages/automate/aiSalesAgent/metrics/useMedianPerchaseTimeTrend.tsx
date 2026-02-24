import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { AISalesMedianPurchaseTimeQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

const useMedianPurchaseTimeTrend = (filters: StatsFilters, timezone: string) =>
    useStatsMetricTrend(
        AISalesMedianPurchaseTimeQueryFactoryV2({
            filters,
            timezone,
        }),
        AISalesMedianPurchaseTimeQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

const fetchMedianPurchaseTimeTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        AISalesMedianPurchaseTimeQueryFactoryV2({
            filters,
            timezone,
        }),
        AISalesMedianPurchaseTimeQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export { useMedianPurchaseTimeTrend, fetchMedianPurchaseTimeTrend }
