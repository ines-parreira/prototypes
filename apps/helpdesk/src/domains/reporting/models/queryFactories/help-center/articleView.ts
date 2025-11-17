import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { HelpCenterTrackingEventCube } from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type {
    ReportingGranularity,
    ReportingQuery,
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
): ReportingQuery<HelpCenterTrackingEventCube> => ({
    metricName: METRIC_NAMES.HELP_CENTER_ARTICLE_VIEW,
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
    metricName: METRIC_NAMES.HELP_CENTER_ARTICLE_VIEW_TIME_SERIES,
})
