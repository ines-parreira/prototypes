import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { HelpCenterTrackingEventMeasures } from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    HelpCenterStatsFiltersMembers,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'

export const searchRequested = (
    statsFilters: StatsFilters,
    timezone: string,
) => ({
    measures: [HelpCenterTrackingEventMeasures.SearchRequestedCount],
    dimensions: [],
    filters: statsFiltersToReportingFilters(
        HelpCenterStatsFiltersMembers,
        statsFilters,
    ),
    timezone,
    metricName: METRIC_NAMES.HELP_CENTER_SEARCH_REQUESTED,
})
