import { useMetric } from 'hooks/reporting/useMetric'
import { averageDiscountPercentageQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'

export const useAverageDiscountPercentage = (
    filters: StatsFilters,
    timezone: string,
) => useMetric(averageDiscountPercentageQueryFactory(filters, timezone))
