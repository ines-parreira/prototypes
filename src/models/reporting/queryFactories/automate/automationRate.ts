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

export const automationRateQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [AutomationBillingEventMeasure.AutomationRate],
    dimensions: [],
    timezone,
    filters: automateDefaultFilters(filters),
})

export const automationRateTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<AutomationBillingEventCubeWithJoins> => ({
    ...automationRateQueryFactory(filters, timezone),
    timeDimensions: [
        {
            dimension: AutomationBillingEventDimension.CreatedDate,
            granularity,
            dateRange: getFilterDateRange(filters),
        },
    ],
    filters: [
        ...statsAutomateFiltersToReportingFilters(
            AutomateStatsFiltersMembers,
            filters
        ),
    ],
})
