import {StatsFilters} from 'models/stat/types'
import {
    HelpCenterStatsFiltersMembers,
    statsFiltersToReportingFilters,
} from 'utils/reporting'
import {OrderDirection} from 'models/api/types'
import {
    HelpCenterTrackingEventCube,
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventSegment,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {ReportingQuery} from 'models/reporting/types'

export const searchResultTermsQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
): ReportingQuery<HelpCenterTrackingEventCube> => ({
    measures: [
        HelpCenterTrackingEventMeasures.SearchRequestedQueryCount,
        HelpCenterTrackingEventMeasures.SearchArticlesClickedCount,
    ],
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
