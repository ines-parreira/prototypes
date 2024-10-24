import {OrderDirection} from 'models/api/types'
import {
    HelpCenterTrackingEventCube,
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventMember,
    HelpCenterTrackingEventSegment,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    HelpCenterStatsFiltersMembers,
    statsFiltersToReportingFilters,
} from 'utils/reporting'

export const searchResultTermsQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
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
            statsFilters
        ),
    ],
    order: [
        [
            HelpCenterTrackingEventMeasures.SearchRequestedQueryCount,
            OrderDirection.Desc,
        ],
    ],
})

export const noSearchResultsQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
): ReportingQuery<HelpCenterTrackingEventCube> => ({
    measures: [HelpCenterTrackingEventMeasures.SearchRequestedQueryCount],
    dimensions: [HelpCenterTrackingEventDimensions.SearchQuery],
    timezone,
    segments: [HelpCenterTrackingEventSegment.NoSearchResultOnly],
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            statsFilters
        ),
    ],
    order: [
        [
            HelpCenterTrackingEventMeasures.SearchRequestedQueryCount,
            OrderDirection.Desc,
        ],
    ],
})

export const searchResultQueryCountFactory = (
    statsFilters: StatsFilters,
    timezone: string
) => ({
    measures: [HelpCenterTrackingEventMeasures.UniqueSearchQueryCount],
    dimensions: [],
    timezone,
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            statsFilters
        ),
    ],
    segments: [HelpCenterTrackingEventSegment.SearchRequestedOnly],
})

export const noSearchResultsCountQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
): ReportingQuery<HelpCenterTrackingEventCube> => ({
    measures: [HelpCenterTrackingEventMeasures.UniqueSearchQueryCount],
    dimensions: [],
    timezone,
    segments: [HelpCenterTrackingEventSegment.NoSearchResultOnly],
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            statsFilters
        ),
    ],
})

export const searchResultRangeQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
) => ({
    measures: [HelpCenterTrackingEventMeasures.SearchRequestedCount],
    dimensions: [HelpCenterTrackingEventDimensions.SearchResultRange],
    timezone,
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            statsFilters
        ),
    ],
})

export const searchQueryClicksQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    searchQueries: string[]
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
            statsFilters
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
})
