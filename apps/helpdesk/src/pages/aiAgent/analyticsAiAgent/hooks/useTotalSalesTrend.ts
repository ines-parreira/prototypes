import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { AiSalesAgentTotalSalesAmountQueryFactoryV2 } from 'domains/reporting/models/scopes/AiSalesAgentOrdersPerformance'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useTotalSalesTrend = (filters: StatsFilters, timezone: string) =>
    useStatsMetricTrend(
        AiSalesAgentTotalSalesAmountQueryFactoryV2({ filters, timezone }),
        AiSalesAgentTotalSalesAmountQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export const fetchTotalSalesTrend = (filters: StatsFilters, timezone: string) =>
    fetchStatsMetricTrend(
        AiSalesAgentTotalSalesAmountQueryFactoryV2({ filters, timezone }),
        AiSalesAgentTotalSalesAmountQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
