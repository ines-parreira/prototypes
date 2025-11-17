import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { HelpCenterTrackingEventCube } from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventSegment,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
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
    metricName: METRIC_NAMES.HELP_CENTER_PERFORMANCE_BY_ARTICLE,
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
    metricName: METRIC_NAMES.HELP_CENTER_PERFORMANCE_BY_ARTICLE_COUNT,
})
