import moment, {Moment} from 'moment'
import {Cubes} from 'models/reporting/cubes'
import {AutomationBillingEventMember} from 'models/reporting/cubes/AutomationBillingEventCube'
import {HelpdeskMessageMember} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMember} from 'models/reporting/cubes/TicketMessagesCube'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {HelpCenterTrackingEventMember} from '../models/reporting/cubes/HelpCenterTrackingEventCube'

export const formatReportingQueryDate = (date: string | Moment) =>
    moment.parseZone(date).utcOffset(0, true).format('YYYY-MM-DDTHH:mm:ss.SSS')

export const getFilterDateRange = (statsFilters: StatsFilters) => [
    formatReportingQueryDate(statsFilters.period.start_datetime),
    formatReportingQueryDate(statsFilters.period.end_datetime),
]

export type StatsFiltersMembers = Record<
    'periodStart' | 'periodEnd',
    Cubes['filters']
> &
    Partial<Record<keyof Omit<StatsFilters, 'period'>, Cubes['filters']>>

export const TicketStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: TicketMember.PeriodStart,
    periodEnd: TicketMember.PeriodEnd,
    channels: TicketMember.Channel,
    integrations: TicketMessagesMember.Integration,
    agents: TicketMember.AssigneeUserId,
    tags: TicketMember.Tags,
}

export const HelpCenterStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: HelpCenterTrackingEventMember.PeriodStart,
    periodEnd: HelpCenterTrackingEventMember.PeriodEnd,
}

export const HelpdeskMessagesStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: HelpdeskMessageMember.PeriodStart,
    periodEnd: HelpdeskMessageMember.PeriodEnd,
    channels: TicketMember.Channel,
    integrations: TicketMessagesMember.Integration,
    agents: HelpdeskMessageMember.SenderId,
    tags: TicketMember.Tags,
}

export const AutomationAddonStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: AutomationBillingEventMember.PeriodStart,
    periodEnd: AutomationBillingEventMember.PeriodEnd,
    channels: TicketMember.Channel,
    integrations: TicketMessagesMember.Integration,
    agents: HelpdeskMessageMember.SenderId,
    tags: TicketMember.Tags,
}

export const NotSpamNorTrashedTicketsFilter = [
    {
        member: TicketMember.IsTrashed,
        operator: ReportingFilterOperator.Equals,
        values: ['0'],
    },
    {
        member: TicketMember.IsSpam,
        operator: ReportingFilterOperator.Equals,
        values: ['0'],
    },
]

export const PublicHelpdeskAndApiMessagesFilter = [
    {
        member: HelpdeskMessageMember.IsMessagePublic,
        operator: ReportingFilterOperator.Equals,
        values: ['1'],
    },
    {
        member: HelpdeskMessageMember.MessageVia,
        operator: ReportingFilterOperator.In,
        values: ['helpdesk', 'api'],
    },
]

export const statsFiltersToReportingFilters = (
    members: StatsFiltersMembers,
    statsFilters: StatsFilters
): ReportingFilter[] => {
    const {period, integrations, channels, agents, tags} = statsFilters
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
    if (tags?.length && members.tags) {
        filters.push({
            member: members.tags,
            operator: ReportingFilterOperator.Equals,
            values: tags.map((tag) => tag.toString()),
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
export const getPreviousPeriod = (
    period: StatsFilters['period']
): StatsFilters['period'] => {
    const start = moment(period.start_datetime).parseZone()
    const end = moment(period.end_datetime).parseZone()
    const diff = moment.duration(end.diff(start) + 1)
    return {
        start_datetime: start.subtract(diff).format(),
        end_datetime: end.subtract(diff).format(),
    }
}

export const withFilter = <T extends ReportingQuery>(
    query: T,
    filter: ReportingFilter
): T => {
    return {...query, filters: [...query.filters, filter]}
}
