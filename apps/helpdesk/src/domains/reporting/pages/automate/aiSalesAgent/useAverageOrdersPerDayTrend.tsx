import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { averageOrdersPerDayQuery } from 'domains/reporting/models/queryFactories/ai-sales-agent/timeseries'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'

export const useAverageOrdersPerDayTrend = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    return useTimeSeries(
        averageOrdersPerDayQuery(filters, timezone, granularity),
    )
}
