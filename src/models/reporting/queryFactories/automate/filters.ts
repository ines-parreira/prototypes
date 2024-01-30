import {AutomationBillingEventMember} from 'models/reporting/cubes/AutomationBillingEventCube'
import {ReportingFilter, ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    AutomateStatsFiltersMembers,
    StatsFiltersMembers,
    formatReportingQueryDate,
    getFilterDateRange,
} from 'utils/reporting'

export const automateDefaultFilters = (filters: StatsFilters) => [
    {
        member: AutomationBillingEventMember.CreatedDate,
        operator: ReportingFilterOperator.InDateRange,
        values: getFilterDateRange(filters),
    },
    ...statsAutomateFiltersToReportingFilters(
        AutomateStatsFiltersMembers,
        filters
    ),
]

export const statsAutomateFiltersToReportingFilters = (
    members: StatsFiltersMembers,
    statsFilters: StatsFilters
): ReportingFilter[] => {
    const {period} = statsFilters
    const filters: ReportingFilter[] = [
        {
            member: members.periodStart,
            operator: ReportingFilterOperator.AfterOrOnDate,
            values: [formatReportingQueryDate(period.start_datetime)],
        },
        {
            member: members.periodEnd,
            operator: ReportingFilterOperator.BeforeOrOnDate,
            values: [formatReportingQueryDate(period.end_datetime)],
        },
    ]

    return filters
}
