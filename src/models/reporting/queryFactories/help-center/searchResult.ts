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
} from '../../cubes/HelpCenterTrackingEventCube'
import {ReportingQuery} from '../../types'

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
