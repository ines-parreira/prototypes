import { useTimeSeries } from 'hooks/reporting/useTimeSeries'
import { averageOrdersPerDayQuery } from 'models/reporting/queryFactories/ai-sales-agent/timeseries'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'

export const useAverageOrdersPerDayTrend = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    return useTimeSeries(
        averageOrdersPerDayQuery(filters, timezone, granularity),
    )
}
