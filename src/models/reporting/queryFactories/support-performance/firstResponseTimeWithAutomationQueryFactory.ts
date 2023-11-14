import {
    AutomationBillingEventMeasure,
    AutomationBillingEventMember,
} from 'models/reporting/cubes/AutomationBillingEventCube'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    AutomateStatsFiltersMembers,
    getFilterDateRange,
    statsFiltersToReportingFilters,
} from 'utils/reporting'

export const automateDefaultFilters = (filters: StatsFilters) => [
    {
        member: AutomationBillingEventMember.CreatedDate,
        operator: ReportingFilterOperator.InDateRange,
        values: getFilterDateRange(filters),
    },
    ...statsFiltersToReportingFilters(AutomateStatsFiltersMembers, filters),
]

export const firstResponseTimeWithAutomationQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [AutomationBillingEventMeasure.FirstResponseTimeWithAutomation],
    dimensions: [],
    timezone,
    filters: automateDefaultFilters(filters),
})
