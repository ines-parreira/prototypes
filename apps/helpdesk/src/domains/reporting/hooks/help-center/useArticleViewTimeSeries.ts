import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { articleViewTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/help-center/articleView'
import { helpCenterArticleViewTimeSeriesQueryFactoryV2 } from 'domains/reporting/models/scopes/helpCenter'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'

export function useArticleViewTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) {
    return useTimeSeries(
        articleViewTimeSeriesQueryFactory(filters, timezone, granularity),
        helpCenterArticleViewTimeSeriesQueryFactoryV2({
            filters,
            timezone,
            granularity,
        }),
    )
}
