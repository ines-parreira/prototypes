import {StatsFilters} from 'models/stat/types'
import {ReportingGranularity} from 'models/reporting/types'
import useTimeSeries, {TimeSeriesQuery} from 'hooks/reporting/useTimeSeries'
import {
    getFilterDateRange,
    HelpCenterStatsFiltersMembers,
    statsFiltersToReportingFilters,
} from 'utils/reporting'
import {OrderDirection} from 'models/api/types'
import {
    HelpCenterTrackingEventCube,
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'

const articleViewTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<HelpCenterTrackingEventCube> => ({
    measures: [HelpCenterTrackingEventMeasures.ArticleView],
    timeDimensions: [
        {
            dimension: HelpCenterTrackingEventDimensions.Timestamp,
            granularity,
            dateRange: getFilterDateRange(filters),
        },
    ],
    timezone,
    dimensions: [],
    order: [[HelpCenterTrackingEventDimensions.Timestamp, OrderDirection.Asc]],
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            filters
        ),
    ],
})

export function useArticleViewTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries(
        articleViewTimeSeriesQueryFactory(filters, timezone, granularity)
    )
}
