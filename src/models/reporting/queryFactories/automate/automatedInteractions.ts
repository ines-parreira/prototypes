import {automateDefaultFilters} from 'models/reporting/queryFactories/support-performance/firstResponseTimeWithAutomateFeaturesQueryFactory'
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
        ...statsFiltersToReportingFilters(AutomateStatsFiltersMembers, filters),
        {
            member: AutomationBillingEventMember.PeriodEnd,
            operator: ReportingFilterOperator.BeforeDate,
            values: [filters.period.end_datetime],
        },
    ],
})
