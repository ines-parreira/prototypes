import {
    ReportingFilter,
    ReportingFilterMember,
    ReportingFilterOperator,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

type CommonFilterMembers = {
    PeriodStart: string
    PeriodEnd: string
    Channel: string
    Integration: string
    AssigneeUserId: string
}

export const statsFiltersToReportingFilters = (
    members: CommonFilterMembers,
    statsFilters: StatsFilters
): ReportingFilter[] => {
    const {period, integrations, channels, agents} = statsFilters
    const filters: ReportingFilter[] = [
        {
            member: members.PeriodStart as ReportingFilterMember,
            operator: ReportingFilterOperator.AfterDate,
            values: [period.start_datetime],
        },
        {
            member: members.PeriodEnd as ReportingFilterMember,
            operator: ReportingFilterOperator.BeforeDate,
            values: [period.end_datetime],
        },
    ]
    if (integrations?.length) {
        filters.push({
            member: members.Integration as ReportingFilterMember,
            operator: ReportingFilterOperator.Equals,
            values: integrations.map((integrationId) =>
                integrationId.toString()
            ),
        })
    }
    if (channels?.length) {
        filters.push({
            member: members.Channel as ReportingFilterMember,
            operator: ReportingFilterOperator.Equals,
            values: channels,
        })
    }
    if (agents?.length) {
        filters.push({
            member: members.AssigneeUserId as ReportingFilterMember,
            operator: ReportingFilterOperator.Equals,
            values: agents.map((agent) => agent.toString()),
        })
    }
    return filters
}
