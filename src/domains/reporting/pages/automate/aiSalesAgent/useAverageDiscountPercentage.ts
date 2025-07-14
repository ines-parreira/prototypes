import { useMetric } from 'domains/reporting/hooks/useMetric'
import { averageDiscountPercentageQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAverageDiscountPercentage = (
    filters: StatsFilters,
    timezone: string,
) => useMetric(averageDiscountPercentageQueryFactory(filters, timezone))
