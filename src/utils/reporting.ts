import moment, {Moment} from 'moment'

import {
    HelpdeskMessageMember,
    ReportingFilter,
    ReportingFilterMember,
    ReportingFilterOperator,
    ReportingGranularity,
    TicketMember,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

export const formatReportingQueryDate = (date: string | Moment) =>
    moment.parseZone(date).utcOffset(0, true).format('YYYY-MM-DDTHH:mm:ss.SSS')

type StatsFiltersMembers = Record<
    'periodStart' | 'periodEnd',
    ReportingFilterMember
> &
    Partial<Record<keyof Omit<StatsFilters, 'period'>, ReportingFilterMember>>

export const TicketStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: TicketMember.PeriodStart,
    periodEnd: TicketMember.PeriodEnd,
    channels: TicketMember.FirstMessageChannel,
    integrations: TicketMember.Integration,
    agents: TicketMember.AssigneeUserId,
}

export const HelpdeskMessagesStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: HelpdeskMessageMember.PeriodStart,
    periodEnd: HelpdeskMessageMember.PeriodEnd,
    channels: TicketMember.FirstMessageChannel,
    integrations: TicketMember.Integration,
    agents: TicketMember.AssigneeUserId,
}

export const statsFiltersToReportingFilters = (
    members: StatsFiltersMembers,
    statsFilters: StatsFilters
): ReportingFilter[] => {
    const {period, integrations, channels, agents} = statsFilters
    const filters: ReportingFilter[] = [
        {
            member: members.periodStart,
            operator: ReportingFilterOperator.AfterDate,
            values: [formatReportingQueryDate(period.start_datetime)],
        },
        {
            member: members.periodEnd,
            operator: ReportingFilterOperator.BeforeDate,
            values: [formatReportingQueryDate(period.end_datetime)],
        },
    ]
    if (integrations?.length && members.integrations) {
        filters.push({
            member: members.integrations,
            operator: ReportingFilterOperator.Equals,
            values: integrations.map((integrationId) =>
                integrationId.toString()
            ),
        })
    }
    if (channels?.length && members.channels) {
        filters.push({
            member: members.channels,
            operator: ReportingFilterOperator.Equals,
            values: channels,
        })
    }
    if (agents?.length && members.agents) {
        filters.push({
            member: members.agents,
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
    const daysInMonth = moment(start).daysInMonth() + 1 // to have a period of one month and one day

    let granularity = ReportingGranularity.Hour
    if (diff.asMonths() > 3) {
        granularity = ReportingGranularity.Month
    } else if (diff.asDays() > daysInMonth) {
        granularity = ReportingGranularity.Week
    } else if (diff.asDays() >= 1) {
        granularity = ReportingGranularity.Day
    }

    return granularity
}
