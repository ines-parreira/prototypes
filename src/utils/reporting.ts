import _difference from 'lodash/difference'
import _orderBy from 'lodash/orderBy'
import moment, {Moment} from 'moment'
import {TicketSLAMember} from 'models/reporting/cubes/sla/TicketSLACube'
import {
    MetricWithDecile,
    QueryReturnType,
} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {Cubes} from 'models/reporting/cubes'
import {AgentTimeTrackingMember} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {AutomationBillingEventMember} from 'models/reporting/cubes/automate/AutomationBillingEventCube'

import {HelpCenterTrackingEventMember} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMeasure, TicketMember} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMember} from 'models/reporting/cubes/TicketMessagesCube'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {AutomationDatasetFilterMember} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {BillableTicketDatasetFilterMember} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'

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

export const TicketSLAStatsFiltersMembers: StatsFiltersMembers = {
    ...TicketStatsFiltersMembers,
    slaPolicies: TicketSLAMember.SlaPolicyUuid,
}

export const HelpCenterStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: HelpCenterTrackingEventMember.PeriodStart,
    periodEnd: HelpCenterTrackingEventMember.PeriodEnd,
    helpCenters: HelpCenterTrackingEventMember.HelpCenterId,
    localeCodes: HelpCenterTrackingEventMember.LocaleCode,
}

export const HelpdeskMessagesStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: HelpdeskMessageMember.PeriodStart,
    periodEnd: HelpdeskMessageMember.PeriodEnd,
    channels: TicketMember.Channel,
    integrations: TicketMessagesMember.Integration,
    agents: HelpdeskMessageMember.SenderId,
    tags: TicketMember.Tags,
}

export const AutomateStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: AutomationBillingEventMember.PeriodStart,
    periodEnd: AutomationBillingEventMember.PeriodEnd,
    integrations: TicketMessagesMember.Integration,
    agents: HelpdeskMessageMember.SenderId,
    tags: TicketMember.Tags,
}

export const AutomateDatasetStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: AutomationDatasetFilterMember.PeriodStart,
    periodEnd: AutomationDatasetFilterMember.PeriodEnd,
    channels: AutomationDatasetFilterMember.Channel,
}

export const BillableTicketDatasetStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: BillableTicketDatasetFilterMember.PeriodStart,
    periodEnd: BillableTicketDatasetFilterMember.PeriodEnd,
}

export const AgentTimeTrackingStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: AgentTimeTrackingMember.PeriodStart,
    periodEnd: AgentTimeTrackingMember.PeriodEnd,
    agents: AgentTimeTrackingMember.UserId,
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

export const TicketDrillDownFilter = {
    member: TicketMeasure.TicketCount,
    operator: ReportingFilterOperator.MeasureFilter,
    values: [],
}

export const DRILLDOWN_QUERY_LIMIT = 100

export const statsFiltersToReportingFilters = (
    members: StatsFiltersMembers,
    statsFilters: StatsFilters
): ReportingFilter[] => {
    const {
        period,
        integrations,
        channels,
        agents,
        tags,
        helpCenters,
        localeCodes,
        slaPolicies,
    } = statsFilters
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
    if (helpCenters?.length && members.helpCenters) {
        filters.push({
            member: members.helpCenters,
            operator: ReportingFilterOperator.Equals,
            values: helpCenters.map((helpCenterId) => helpCenterId.toString()),
        })
    }
    if (localeCodes?.length && members.localeCodes) {
        filters.push({
            member: members.localeCodes,
            operator: ReportingFilterOperator.Equals,
            values: localeCodes.map((localeCode) => localeCode.toLowerCase()),
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
    if (slaPolicies?.length && members.slaPolicies) {
        filters.push({
            member: members.slaPolicies,
            operator: ReportingFilterOperator.Equals,
            values: slaPolicies.map((policyId) => policyId),
        })
    }
    return filters
}

export const periodToReportingGranularity = (
    period: StatsFilters['period']
):
    | ReportingGranularity.Hour
    | ReportingGranularity.Day
    | ReportingGranularity.Week
    | ReportingGranularity.Month => {
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

export const agentFilter = (agentAssigneeId?: string): ReportingFilter => ({
    member: TicketMember.AssigneeUserId,
    operator: ReportingFilterOperator.Set,
    values: agentAssigneeId ? [agentAssigneeId] : [],
})

export const calculatePercentage = (x: number, y: number) =>
    y === 0 ? 0 : (x / y) * 100

export const matchAndCalculateAllEntries = (
    dataA: Pick<MetricWithDecile, 'data'>,
    dataB: Pick<MetricWithDecile, 'data'>,
    calculate: (a: number, b: number) => number,
    dataAIdField: string,
    dataBIdField: string,
    dataAMeasureField: string,
    dataBMeasureField: string
): QueryReturnType<HelpdeskMessageCubeWithJoins> =>
    dataA.data?.allData.map((item) => {
        const matchingValue = dataB.data?.allData.find(
            (value) => value[dataBIdField] === item[dataAIdField]
        )?.[dataBMeasureField]

        return {
            ...item,
            [dataAMeasureField]: matchingValue
                ? String(
                      calculate(
                          Number(item[dataAMeasureField]),
                          Number(matchingValue)
                      )
                  )
                : null,
        }
    }) ?? []

export const sortAllData = (
    allData: QueryReturnType<HelpdeskMessageCubeWithJoins>,
    sortingField: string,
    sorting?: OrderDirection
) => {
    const nonNullValues = allData.filter((item) => item[sortingField] !== null)

    const sortedArray = _orderBy(
        nonNullValues,
        (v) => Number(v[sortingField]),
        sorting
    )

    return sortedArray.concat(_difference(allData, nonNullValues))
}
