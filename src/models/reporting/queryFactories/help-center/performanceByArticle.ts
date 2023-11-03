import {OrderDirection} from 'models/api/types'
import {
    HelpCenterStatsFiltersMembers,
    statsFiltersToReportingFilters,
} from 'utils/reporting'
import {StatsFilters} from 'models/stat/types'
import {
    HelpCenterTrackingEventCube,
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventSegment,
} from '../../cubes/HelpCenterTrackingEventCube'
import {ReportingQuery} from '../../types'

export const performanceByArticleQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
): ReportingQuery<HelpCenterTrackingEventCube> => ({
    measures: [HelpCenterTrackingEventMeasures.ArticleView],
    dimensions: [
        HelpCenterTrackingEventDimensions.ArticleTitle,
        HelpCenterTrackingEventDimensions.ArticleSlug,
        HelpCenterTrackingEventDimensions.LocaleCode,
    ],
    timezone,
    segments: [HelpCenterTrackingEventSegment.ArticleViewOnly],
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            statsFilters
        ),
    ],
    order: [[HelpCenterTrackingEventMeasures.ArticleView, OrderDirection.Desc]],
})

export const performanceByArticleCountQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
) => ({
    measures: [HelpCenterTrackingEventMeasures.ArticleCount],
    dimensions: [],
    timezone,
    segments: [HelpCenterTrackingEventSegment.ArticleViewOnly],
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            statsFilters
        ),
    ],
})
