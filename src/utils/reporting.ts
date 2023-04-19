import moment, {Moment} from 'moment'

import {
    ReportingFilter,
    ReportingFilterMember,
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

export const formatReportingQueryDate = (date: string | Moment) =>
    moment.parseZone(date).utcOffset(0, true).format('YYYY-MM-DDTHH:mm:ss.SSS')

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
            values: [formatReportingQueryDate(period.start_datetime)],
        },
        {
            member: members.PeriodEnd as ReportingFilterMember,
            operator: ReportingFilterOperator.BeforeDate,
            values: [formatReportingQueryDate(period.end_datetime)],
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

export const periodToReportingGranularity = (
    period: StatsFilters['period']
): ReportingGranularity => {
    const start = moment(period.start_datetime)
    const end = moment(period.end_datetime)
    const diff = moment.duration(end.diff(start) + 1)

    let granularity = ReportingGranularity.Hour
    if (diff.asMonths() > 3) {
        granularity = ReportingGranularity.Month
    } else if (diff.asMonths() >= 1) {
        granularity = ReportingGranularity.Week
    } else if (diff.asDays() >= 1) {
        granularity = ReportingGranularity.Day
    }

    return granularity
}
