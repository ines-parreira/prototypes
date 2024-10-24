import {StatsFilters} from 'models/stat/types'
import {
    HelpCenterStatsFiltersMembers,
    statsFiltersToReportingFilters,
} from 'utils/reporting'

import {HelpCenterTrackingEventMeasures} from '../../cubes/HelpCenterTrackingEventCube'

export const helpCenterTrendQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    metric: HelpCenterTrackingEventMeasures
) => ({
    measures: [metric],
    dimensions: [],
    filters: statsFiltersToReportingFilters(
        HelpCenterStatsFiltersMembers,
        statsFilters
    ),
    timezone,
})
