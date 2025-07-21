import {
    HelpCenterTrackingEventCube,
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventSegment,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import {
    HelpCenterStatsFiltersMembers,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const performanceByArticleQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
): ReportingQuery<HelpCenterTrackingEventCube> => ({
    measures: [HelpCenterTrackingEventMeasures.ArticleView],
    dimensions: [
        HelpCenterTrackingEventDimensions.ArticleId,
        HelpCenterTrackingEventDimensions.ArticleTitle,
        HelpCenterTrackingEventDimensions.ArticleSlug,
        HelpCenterTrackingEventDimensions.LocaleCode,
    ],
    timezone,
    segments: [HelpCenterTrackingEventSegment.ArticleViewOnly],
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            statsFilters,
        ),
    ],
    order: [[HelpCenterTrackingEventMeasures.ArticleView, OrderDirection.Desc]],
})

export const performanceByArticleCountQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
) => ({
    measures: [HelpCenterTrackingEventMeasures.ArticleCount],
    dimensions: [],
    timezone,
    segments: [HelpCenterTrackingEventSegment.ArticleViewOnly],
    filters: [
        ...statsFiltersToReportingFilters(
            HelpCenterStatsFiltersMembers,
            statsFilters,
        ),
    ],
})
