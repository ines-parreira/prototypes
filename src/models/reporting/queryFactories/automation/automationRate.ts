import {automateDefaultFilters} from 'models/reporting/queryFactories/support-performance/firstResponseTimeWithAutomationQueryFactory'
import {
    AutomationBillingEventCubeWithJoins,
    AutomationBillingEventDimension,
    AutomationBillingEventMeasure,
    AutomationBillingEventMember,
} from 'models/reporting/cubes/AutomationBillingEventCube'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    TimeSeriesQuery,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    AutomateStatsFiltersMembers,
    getFilterDateRange,
    statsFiltersToReportingFilters,
} from 'utils/reporting'

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
        ...statsFiltersToReportingFilters(AutomateStatsFiltersMembers, filters),
        {
            member: AutomationBillingEventMember.PeriodEnd,
            operator: ReportingFilterOperator.BeforeDate,
            values: [filters.period.end_datetime],
        },
    ],
})
