import {
    HelpCenterTrackingEventCube,
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingGranularity,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import {
    getFilterDateRange,
    HelpCenterStatsFiltersMembers,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const articleViewQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
) => ({
    measures: [HelpCenterTrackingEventMeasures.ArticleView],
    dimensions: [],
    filters: statsFiltersToReportingFilters(
        HelpCenterStatsFiltersMembers,
        statsFilters,
    ),
    timezone,
})

export const articleViewTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
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
            filters,
        ),
    ],
})
