import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { HelpCenterTrackingEventCube } from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventMember,
    HelpCenterTrackingEventSegment,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    HelpCenterStatsFiltersMembers,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const searchResultTermsQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
): ReportingQuery<HelpCenterTrackingEventCube> => ({
    measures: [
        HelpCenterTrackingEventMeasures.SearchRequestedQueryCount,
        HelpCenterTrackingEventMeasures.SearchArticlesClickedCount,
        HelpCenterTrackingEventMeasures.SearchArticlesClickedCountUnique,
    ],
    segments: [HelpCenterTrackingEventSegment.SearchRequestWithClicks],
    dimensions: [HelpCenterTrackingEventDimensions.SearchQuery],
    timezone,
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            statsFilters,
        ),
    ],
    order: [
        [
            HelpCenterTrackingEventMeasures.SearchRequestedQueryCount,
            OrderDirection.Desc,
        ],
    ],
    metricName: METRIC_NAMES.HELP_CENTER_SEARCH_RESULT_TERMS,
})

export const noSearchResultsQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
): ReportingQuery<HelpCenterTrackingEventCube> => ({
    measures: [HelpCenterTrackingEventMeasures.SearchRequestedQueryCount],
    dimensions: [HelpCenterTrackingEventDimensions.SearchQuery],
    timezone,
    segments: [HelpCenterTrackingEventSegment.NoSearchResultOnly],
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            statsFilters,
        ),
    ],
    order: [
        [
            HelpCenterTrackingEventMeasures.SearchRequestedQueryCount,
            OrderDirection.Desc,
        ],
    ],
    metricName: METRIC_NAMES.HELP_CENTER_NO_SEARCH_RESULT,
})

export const searchResultQueryCountFactory = (
    statsFilters: StatsFilters,
    timezone: string,
) => ({
    measures: [HelpCenterTrackingEventMeasures.UniqueSearchQueryCount],
    dimensions: [],
    timezone,
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            statsFilters,
        ),
    ],
    segments: [HelpCenterTrackingEventSegment.SearchRequestedOnly],
    metricName: METRIC_NAMES.HELP_CENTER_SEARCH_RESULT_COUNT,
})

export const noSearchResultsCountQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
): ReportingQuery<HelpCenterTrackingEventCube> => ({
    measures: [HelpCenterTrackingEventMeasures.UniqueSearchQueryCount],
    dimensions: [],
    timezone,
    segments: [HelpCenterTrackingEventSegment.NoSearchResultOnly],
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            statsFilters,
        ),
    ],
    metricName: METRIC_NAMES.HELP_CENTER_UNIQUE_SEARCH_WITH_NO_RESULT,
})

export const searchResultRangeQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
): ReportingQuery<HelpCenterTrackingEventCube> => ({
    metricName: METRIC_NAMES.HELP_CENTER_SEARCH_RESULT_RANGE,
    measures: [HelpCenterTrackingEventMeasures.SearchRequestedCount],
    dimensions: [HelpCenterTrackingEventDimensions.SearchResultRange],
    timezone,
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            statsFilters,
        ),
    ],
})

export const searchQueryClicksQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    searchQueries: string[],
): ReportingQuery<HelpCenterTrackingEventCube> => ({
    measures: [HelpCenterTrackingEventMeasures.SearchArticlesClickedCount],
    dimensions: [
        HelpCenterTrackingEventDimensions.ArticleTitle,
        HelpCenterTrackingEventDimensions.ArticleSlug,
        HelpCenterTrackingEventDimensions.LocaleCode,
    ],
    timezone,
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            statsFilters,
        ),
        {
            member: HelpCenterTrackingEventMember.SearchQuery,
            operator: ReportingFilterOperator.Equals,
            values: searchQueries,
        },
        {
            member: HelpCenterTrackingEventMember.ArticleTitle,
            operator: ReportingFilterOperator.Set,
            values: [],
        },
    ],
    order: [
        [
            HelpCenterTrackingEventMeasures.SearchArticlesClickedCount,
            OrderDirection.Desc,
        ],
    ],
    segments: [HelpCenterTrackingEventSegment.SearchResultClickedOnly],
    metricName: METRIC_NAMES.HELP_CENTER_SEARCH_ARTICLES_CLICKED,
})
