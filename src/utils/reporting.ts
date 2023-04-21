import moment, {Moment} from 'moment'

import {
    MessageStateMember,
    OpenTicketStateMember,
    ReportingFilter,
    ReportingFilterMember,
    ReportingFilterOperator,
    ReportingGranularity,
    TicketStateMember,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

export const formatReportingQueryDate = (date: string | Moment) =>
    moment.parseZone(date).utcOffset(0, true).format('YYYY-MM-DDTHH:mm:ss.SSS')

type StatsFiltersMembers = Record<
    'periodStart' | 'periodEnd',
    ReportingFilterMember
> &
    Partial<Record<keyof Omit<StatsFilters, 'period'>, ReportingFilterMember>>

export const TicketStateStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: TicketStateMember.PeriodStart,
    periodEnd: TicketStateMember.PeriodEnd,
    channels: TicketStateMember.Channel,
    integrations: TicketStateMember.Integration,
    agents: TicketStateMember.AssigneeUserId,
}

export const OpenTicketStateStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: OpenTicketStateMember.PeriodStart,
    periodEnd: OpenTicketStateMember.PeriodEnd,
    channels: OpenTicketStateMember.Channel,
    integrations: OpenTicketStateMember.Integration,
    agents: OpenTicketStateMember.AssigneeUserId,
}

export const MessageStateStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: MessageStateMember.PeriodStart,
    periodEnd: MessageStateMember.PeriodEnd,
    channels: MessageStateMember.Channel,
    integrations: MessageStateMember.Integration,
    agents: MessageStateMember.SenderId,
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
    if (integrations?.length) {
        filters.push({
            member: members.integrations,
            operator: ReportingFilterOperator.Equals,
            values: integrations.map((integrationId) =>
                integrationId.toString()
            ),
        })
    }
    if (channels?.length) {
        filters.push({
            member: members.channels,
            operator: ReportingFilterOperator.Equals,
            values: channels,
        })
    }
    if (agents?.length) {
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
