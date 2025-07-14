import { HelpCenterTrackingEventMeasures } from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
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
})
