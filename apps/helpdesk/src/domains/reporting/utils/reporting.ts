import _difference from 'lodash/difference'
import _orderBy from 'lodash/orderBy'
import type { Moment } from 'moment'
import moment from 'moment'

import type { MetricName } from 'domains/reporting/hooks/metricNames'
import type {
    MetricWithDecile,
    QueryReturnType,
    ReportingMetricItem,
    ReportingMetricItemValue,
    StringWhichShouldBeNumber,
} from 'domains/reporting/hooks/types'
import type { Cubes } from 'domains/reporting/models/cubes'
import { AgentTimeTrackingMember } from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import { AutomationBillingEventMember } from 'domains/reporting/models/cubes/automate/AutomationBillingEventCube'
import { AutomationDatasetFilterMember } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { BillableTicketDatasetFilterMember } from 'domains/reporting/models/cubes/automate_v2/BillableTicketDatasetCube'
import { HelpCenterTrackingEventMember } from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import { HelpdeskMessageMember } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketSLAMember } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import { TicketFirstHumanAgentResponseTimeMember } from 'domains/reporting/models/cubes/TicketFirstHumanAgentResponseTime'
import { TicketInsightsTaskDimension } from 'domains/reporting/models/cubes/TicketInsightsTaskCube'
import { TicketMessagesMember } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { TicketMessagesEnrichedResponseTimesMember } from 'domains/reporting/models/cubes/TicketMessagesEnrichedResponseTimesCube'
import { TicketsFirstAgentResponseTimeDimension } from 'domains/reporting/models/cubes/TicketsFirstAgentResponseTimeCube'
import {
    addOptionalFilter,
    hasFilter,
} from 'domains/reporting/models/queryFactories/utils'
import type {
    AggregationWindow,
    FilterKey,
    Period,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import type {
    Cube,
    QueryFactory,
    ReportingFilter,
    ReportingQuery,
} from 'domains/reporting/models/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'
import type { OrderDirection } from 'models/api/types'

export const formatReportingQueryDate = (date: string | Date | Moment) =>
    moment.parseZone(date).utcOffset(0, true).format('YYYY-MM-DDTHH:mm:ss.SSS')

export const getFilterDateRange = (period: Period) => [
    formatReportingQueryDate(period.start_datetime),
    formatReportingQueryDate(period.end_datetime),
]

export type StatsFiltersMembers = Record<
    'periodStart' | 'periodEnd',
    Cubes['filters']
> &
    Partial<Record<keyof Omit<StatsFilters, 'period'>, Cubes['filters']>>

const AutoQAFiltersMembers = {
    score: TicketMember.SurveyScore,
    resolutionCompleteness: TicketMember.ResolutionCompletenessScore,
    communicationSkills: TicketMember.CommunicationSkillsScore,
    languageProficiency: TicketMember.LanguageProficiencyScore,
    accuracy: TicketMember.AccuracyScore,
    efficiency: TicketMember.EfficiencyScore,
    internalCompliance: TicketMember.InternalComplianceScore,
    brandVoice: TicketMember.BrandVoiceScore,
}

export const TicketStatsFiltersMembers: StatsFiltersMembers = {
    periodStart: TicketMember.PeriodStart,
    periodEnd: TicketMember.PeriodEnd,
    channels: TicketMember.Channel,
    integrations: TicketMessagesMember.Integration,
    agents: TicketMember.AssigneeUserId,
    tags: TicketMember.Tags,
    customFields: TicketMember.CustomField,
    stores: TicketMessagesMember.Store,
    teams: TicketMember.AssigneeTeamId,
    ...AutoQAFiltersMembers,
}

export const KnowledgeStatsFiltersMembers: StatsFiltersMembers = {
    ...TicketStatsFiltersMembers,
    stores: TicketInsightsTaskDimension.ShopIntegrationId,
}

export const TicketMessagesEnrichedFirstHumanResponseTimesMembers = {
    ...TicketStatsFiltersMembers,
    agents: TicketMessagesMember.FirstHelpdeskMessageUserId,
    integrations: TicketFirstHumanAgentResponseTimeMember.Integration,
    stores: TicketFirstHumanAgentResponseTimeMember.Store,
}

export const TicketMessagesEnrichedFirstResponseTimesMembers = {
    ...TicketStatsFiltersMembers,
    agents: TicketMessagesMember.FirstHelpdeskMessageUserId,
}

export const TicketFirstHumanAgentResponseTimeMembers = {
    ...TicketStatsFiltersMembers,
    agents: TicketFirstHumanAgentResponseTimeMember.FirstHumanAgentMessageUserId,
    integrations: TicketFirstHumanAgentResponseTimeMember.Integration,
    stores: TicketFirstHumanAgentResponseTimeMember.Store,
}

export const TicketsFirstAgentResponseTimeMembers = {
    ...TicketStatsFiltersMembers,
    agents: TicketsFirstAgentResponseTimeDimension.FirstAgentMessageUserId,
    integrations: TicketsFirstAgentResponseTimeDimension.Integration,
    stores: TicketsFirstAgentResponseTimeDimension.Store,
}

export const TicketMessagesEnrichedResponseTimesMembers: StatsFiltersMembers = {
    ...TicketStatsFiltersMembers,
    integrations: TicketMessagesEnrichedResponseTimesMember.Integration,
    agents: TicketMessagesEnrichedResponseTimesMember.TicketMessageUserId,
    stores: TicketMessagesEnrichedResponseTimesMember.Store,
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
    stores: TicketMessagesMember.Store,
    agents: HelpdeskMessageMember.SenderId,
    tags: TicketMember.Tags,
    customFields: TicketMember.CustomField,
    teams: TicketMember.AssigneeTeamId,
    ...AutoQAFiltersMembers,
}

export const HelpdeskTicketsRepliedStatsFiltersMembers: StatsFiltersMembers = {
    ...HelpdeskMessagesStatsFiltersMembers,
    agents: TicketMember.MessageSenderId,
}

export const HelpdeskCustomerMessagesReceivedStatsFiltersMembers: StatsFiltersMembers =
    {
        ...HelpdeskMessagesStatsFiltersMembers,
        periodStart: TicketMember.PeriodStart,
        periodEnd: TicketMember.PeriodEnd,
        agents: TicketMember.AssigneeUserId,
        teams: TicketMember.AssigneeTeamId,
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

export const PublicAndMessageViaFilter = [
    {
        member: HelpdeskMessageMember.IsMessagePublic,
        operator: ReportingFilterOperator.Equals,
        values: ['1'],
    },
    {
        member: HelpdeskMessageMember.MessageVia,
        operator: ReportingFilterOperator.In,
        values: ['aircall', 'api', 'helpdesk'],
    },
]

export const DRILLDOWN_QUERY_LIMIT = 100

export const statsFiltersToReportingFilters = (
    members: StatsFiltersMembers,
    statsFilters: StatsFilters,
): ReportingFilter[] => {
    const {
        period,
        integrations,
        stores,
        channels,
        agents,
        teams: assignedTeam,
        tags,
        customFields,
        helpCenters,
        localeCodes,
        slaPolicies,
        score,
        resolutionCompleteness,
        communicationSkills,
        languageProficiency,
        accuracy,
        efficiency,
        internalCompliance,
        brandVoice,
        storeIntegrations,
        voiceQueues,
        isDuringBusinessHours,
    } = statsFilters

    let filters: ReportingFilter[] = [
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
    if (hasFilter(integrations) && members.integrations) {
        filters = addOptionalFilter(filters, integrations, {
            member: members.integrations,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(stores) && members.stores) {
        filters = addOptionalFilter(filters, stores, {
            member: members.stores,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(storeIntegrations) && members.storeIntegrations) {
        filters = addOptionalFilter(filters, storeIntegrations, {
            member: members.storeIntegrations,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(helpCenters) && members.helpCenters) {
        filters = addOptionalFilter(filters, helpCenters, {
            member: members.helpCenters,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(localeCodes) && members.localeCodes) {
        filters = addOptionalFilter(filters, localeCodes, {
            member: members.localeCodes,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(channels) && members.channels) {
        filters = addOptionalFilter(filters, channels, {
            member: members.channels,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(agents) && members.agents) {
        filters = addOptionalFilter(filters, agents, {
            member: members.agents,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(assignedTeam) && members.teams) {
        filters = addOptionalFilter(filters, assignedTeam, {
            member: members.teams,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(tags) && members.tags) {
        filters = addOptionalFilter(filters, tags, {
            member: members.tags,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(customFields) && members.customFields) {
        filters = addOptionalFilter(filters, customFields, {
            member: members.customFields,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(slaPolicies) && members.slaPolicies) {
        filters = addOptionalFilter(filters, slaPolicies, {
            member: members.slaPolicies,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(score) && members.score) {
        filters = addOptionalFilter(filters, score, {
            member: members.score,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(resolutionCompleteness) && members.resolutionCompleteness) {
        filters = addOptionalFilter(filters, resolutionCompleteness, {
            member: members.resolutionCompleteness,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(communicationSkills) && members.communicationSkills) {
        filters = addOptionalFilter(filters, communicationSkills, {
            member: members.communicationSkills,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(languageProficiency) && members.languageProficiency) {
        filters = addOptionalFilter(filters, languageProficiency, {
            member: members.languageProficiency,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(accuracy) && members.accuracy) {
        filters = addOptionalFilter(filters, accuracy, {
            member: members.accuracy,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(efficiency) && members.efficiency) {
        filters = addOptionalFilter(filters, efficiency, {
            member: members.efficiency,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(internalCompliance) && members.internalCompliance) {
        filters = addOptionalFilter(filters, internalCompliance, {
            member: members.internalCompliance,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(brandVoice) && members.brandVoice) {
        filters = addOptionalFilter(filters, brandVoice, {
            member: members.brandVoice,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(voiceQueues) && members.voiceQueues) {
        filters = addOptionalFilter(filters, voiceQueues, {
            member: members.voiceQueues,
            operator: ReportingFilterOperator.Equals,
        })
    }
    if (hasFilter(isDuringBusinessHours) && members.isDuringBusinessHours) {
        filters = addOptionalFilter(filters, isDuringBusinessHours, {
            member: members.isDuringBusinessHours,
            operator: ReportingFilterOperator.Equals,
        })
    }

    return filters
}

export const periodToReportingGranularity = (
    period: StatsFilters['period'],
): AggregationWindow => {
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

export const periodAndAggregationWindowToReportingGranularity = (
    period: StatsFilters[FilterKey.Period],
    aggregationWindow: StatsFilters[FilterKey.AggregationWindow],
): AggregationWindow => {
    return aggregationWindow ?? periodToReportingGranularity(period)
}

export const getPreviousPeriod = (
    period: StatsFilters['period'],
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
    filter: ReportingFilter,
): T => {
    return { ...query, filters: [...query.filters, filter] }
}

export const perDimensionQueryFactory =
    <T extends Cube>(
        queryFactory: QueryFactory<T>,
        dimension: T['dimensions'],
        metricName: MetricName,
    ) =>
    (filters: StatsFilters, timezone: string, sorting?: OrderDirection) => ({
        ...queryFactory(filters, timezone, sorting),
        dimensions: [dimension],
        metricName,
    })

export const agentFilter = (agentAssigneeId?: string): ReportingFilter => ({
    member: TicketMember.AssigneeUserId,
    operator: ReportingFilterOperator.Set,
    values: agentAssigneeId ? [agentAssigneeId] : [],
})

export const calculatePercentage = (x: number, y: number) =>
    x === 0 || y === 0 ? 0 : (x / y) * 100

export const matchAndCalculateAllEntries = <
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
>(
    dataA: Pick<MetricWithDecile<TValue, TCube>, 'data'>,
    dataB: Pick<MetricWithDecile<TValue, TCube>, 'data'>,
    calculate: (a: number, b: number) => number,
): QueryReturnType<StringWhichShouldBeNumber, TCube> =>
    (dataA.data?.allData.map((DataAItem) => {
        const dataADimension = dataA.data?.dimensions?.[0]
        const dataBDimension = dataB.data?.dimensions?.[0]
        const dataAMeasure = dataA.data?.measures?.[0] || ''
        const dataBMeasure = dataB.data?.measures?.[0] || ''

        const matchingValue = dataB.data?.allData.find(
            (value) =>
                value[dataBDimension]?.toString() ===
                DataAItem[dataADimension]?.toString(),
        )?.[dataBMeasure]

        return {
            ...DataAItem,
            [dataAMeasure]: matchingValue
                ? String(
                      calculate(
                          Number(DataAItem[dataAMeasure]),
                          Number(matchingValue),
                      ),
                  )
                : null,
        } as ReportingMetricItem<StringWhichShouldBeNumber, TCube>
    }) ?? []) as QueryReturnType<StringWhichShouldBeNumber, TCube>

export const sortAllData = <
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
>(
    allData: QueryReturnType<TValue, TCube>,
    sortingField: keyof ReportingMetricItem<TValue, TCube>,
    sorting?: OrderDirection,
) => {
    const nonNullValues = allData.filter((item) => item[sortingField] !== null)

    const sortedArray = _orderBy(
        nonNullValues,
        (v) => Number(v[sortingField]),
        sorting,
    )

    return sortedArray.concat(_difference(allData, nonNullValues))
}

export const mapMetrics = <TCube extends Cubes = Cubes>(
    metrics: MetricWithDecile<StringWhichShouldBeNumber, TCube>,
    dimension: TCube['dimensions'],
    measure: TCube['measures'],
) => {
    if (metrics.isFetching || metrics.isError || !metrics.data) {
        return {}
    }

    return metrics.data.allData.reduce<Record<number, number>>((a, record) => {
        const recordDimension = record[dimension]

        return {
            ...a,
            [Number(recordDimension)]: Number(record[measure]),
        }
    }, {})
}
