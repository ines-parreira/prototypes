import {OrderDirection} from 'models/api/types'
import {
    HelpCenterTrackingEventCube,
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {ReportingGranularity, TimeSeriesQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    getFilterDateRange,
    HelpCenterStatsFiltersMembers,
    statsFiltersToReportingFilters,
} from 'utils/reporting'

export const articleViewQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
) => ({
    measures: [HelpCenterTrackingEventMeasures.ArticleView],
    dimensions: [],
    filters: statsFiltersToReportingFilters(
        HelpCenterStatsFiltersMembers,
        statsFilters
    ),
    timezone,
})

export const articleViewTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<HelpCenterTrackingEventCube> => ({
    measures: [HelpCenterTrackingEventMeasures.ArticleView],
    timeDimensions: [
        {
            dimension: HelpCenterTrackingEventDimensions.Timestamp,
            granularity,
            dateRange: getFilterDateRange(filters.period),
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
