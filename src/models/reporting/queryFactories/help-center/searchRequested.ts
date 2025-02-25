import { HelpCenterTrackingEventMeasures } from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import { StatsFilters } from 'models/stat/types'
import {
    HelpCenterStatsFiltersMembers,
    statsFiltersToReportingFilters,
} from 'utils/reporting'

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
