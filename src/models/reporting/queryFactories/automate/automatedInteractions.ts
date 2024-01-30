import {
    AutomationBillingEventCubeWithJoins,
    AutomationBillingEventDimension,
    AutomationBillingEventMeasure,
} from 'models/reporting/cubes/AutomationBillingEventCube'
import {ReportingGranularity, TimeSeriesQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {AutomateStatsFiltersMembers, getFilterDateRange} from 'utils/reporting'
import {
    automateDefaultFilters,
    statsAutomateFiltersToReportingFilters,
} from 'models/reporting/queryFactories/automate/filters'

export const automatedInteractionsQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [AutomationBillingEventMeasure.AutomatedInteractions],
    dimensions: [],
    timezone,
    filters: automateDefaultFilters(filters),
})

export const automatedInteractionsTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<AutomationBillingEventCubeWithJoins> => ({
    measures: [AutomationBillingEventMeasure.AutomatedInteractions],
    dimensions: [],
    timeDimensions: [
        {
            dimension: AutomationBillingEventDimension.CreatedDate,
            granularity,
            dateRange: getFilterDateRange(filters),
        },
    ],
    timezone,
    filters: [
        ...statsAutomateFiltersToReportingFilters(
            AutomateStatsFiltersMembers,
            filters
        ),
    ],
})
