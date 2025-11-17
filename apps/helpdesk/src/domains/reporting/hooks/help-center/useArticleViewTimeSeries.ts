import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { articleViewTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/help-center/articleView'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'

export function useArticleViewTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) {
    return useTimeSeries(
        articleViewTimeSeriesQueryFactory(filters, timezone, granularity),
    )
}
