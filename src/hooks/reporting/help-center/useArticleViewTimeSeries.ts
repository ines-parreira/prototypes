import { useTimeSeries } from 'hooks/reporting/useTimeSeries'
import { articleViewTimeSeriesQueryFactory } from 'models/reporting/queryFactories/help-center/articleView'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'

export function useArticleViewTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) {
    return useTimeSeries(
        articleViewTimeSeriesQueryFactory(filters, timezone, granularity),
    )
}
