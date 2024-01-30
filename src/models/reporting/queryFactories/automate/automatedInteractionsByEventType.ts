import {
    AutomationBillingEventCubeWithJoins,
    AutomationBillingEventDimension,
    AutomationBillingEventMeasure,
} from 'models/reporting/cubes/AutomationBillingEventCube'
import {ReportingGranularity, TimeSeriesQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {AutomateStatsFiltersMembers, getFilterDateRange} from 'utils/reporting'
import {statsAutomateFiltersToReportingFilters} from 'models/reporting/queryFactories/automate/filters'

export const automatedInteractionsByEventTypeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<AutomationBillingEventCubeWithJoins> => ({
    measures: [
        AutomationBillingEventMeasure.AutomatedInteractionsByTrackOrder,
        AutomationBillingEventMeasure.AutomatedInteractionsByLoopReturns,
        AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponse,
        AutomationBillingEventMeasure.AutomatedInteractionsByArticleRecommendation,
        AutomationBillingEventMeasure.AutomatedInteractionsByAutomatedResponse,
        AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponseFlows,
        AutomationBillingEventMeasure.AutomatedInteractionsByAutoResponders,
    ],
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
