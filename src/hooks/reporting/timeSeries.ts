import {TicketMessageSourceType} from 'business/types/ticket'
import {customFieldsTicketCountQueryFactory} from 'hooks/reporting/metricsPerDimension'
import {OrderDirection} from 'models/api/types'
import {
    AutomationBillingEventDimension,
    AutomationBillingEventMeasure,
    AutomationBillingEventMember,
} from 'models/reporting/cubes/AutomationBillingEventCube'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {TicketCustomFieldsMember} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    AutomationAddonStatsFiltersMembers,
    getFilterDateRange,
    HelpdeskMessagesStatsFiltersMembers,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

import useTimeSeries, {
    TimeSeriesQuery,
    useTimeSeriesPerDimension,
} from './useTimeSeries'

export const ticketsCreatedQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => {
    const {agents, ...statFiltersWithoutAgents} = statsFilters
    const commonFilters: ReportingFilter[] = [
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
    if (agents?.length) {
        commonFilters.push({
            member: TicketMessagesMember.FirstHelpdeskMessageUserId,
            operator: ReportingFilterOperator.Equals,
            values: agents.map((agent) => agent.toString()),
        })
    }

    return {
        measures: [TicketMeasure.TicketCount],
        dimensions: [],
        segments: agents?.length
            ? [TicketMessagesSegment.TicketCreatedByAgent]
            : [],
        timeDimensions: [
            {
                dimension: TicketDimension.CreatedDatetime,
                granularity,
                dateRange: getFilterDateRange(statsFilters),
            },
        ],
        timezone,
        order: [[TicketDimension.CreatedDatetime, OrderDirection.Asc]],
        filters: [
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                statFiltersWithoutAgents
            ),
            ...commonFilters,
        ],
    }
}

export function useTicketsCreatedTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries(
        ticketsCreatedQueryFactory(filters, timezone, granularity)
    )
}

export function useTicketsClosedTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries({
        measures: [TicketMeasure.TicketCount],
        timeDimensions: [
            {
                dimension: TicketDimension.ClosedDatetime,
                granularity,
                dateRange: getFilterDateRange(filters),
            },
        ],
        timezone,
        dimensions: [],
        order: [[TicketDimension.ClosedDatetime, OrderDirection.Asc]],
        segments: [TicketSegment.ClosedTickets],
        filters: [
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters
            ),
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
        ],
    })
}

export function useTicketsRepliedTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries({
        measures: [HelpdeskMessageMeasure.TicketCount],
        dimensions: [],
        timeDimensions: [
            {
                dimension: HelpdeskMessageDimension.SentDatetime,
                granularity,
                dateRange: getFilterDateRange(filters),
            },
        ],
        timezone,
        filters: [
            ...statsFiltersToReportingFilters(
                HelpdeskMessagesStatsFiltersMembers,
                filters
            ),
            {
                member: TicketMember.IsSpam,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
            {
                member: TicketMember.IsTrashed,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
            {
                member: TicketMember.PeriodStart,
                operator: ReportingFilterOperator.AfterDate,
                values: [filters.period.start_datetime],
            },
            {
                member: TicketMember.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: [filters.period.end_datetime],
            },
            {
                member: HelpdeskMessageMember.Channel,
                operator: ReportingFilterOperator.NotEquals,
                values: [TicketMessageSourceType.InternalNote],
            },
        ],
    })
}

export function useMessagesSentTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries({
        measures: [HelpdeskMessageMeasure.MessageCount],
        dimensions: [],
        timeDimensions: [
            {
                dimension: HelpdeskMessageDimension.SentDatetime,
                granularity,
                dateRange: getFilterDateRange(filters),
            },
        ],
        timezone,
        filters: [
            {
                member: TicketMember.PeriodStart,
                operator: ReportingFilterOperator.AfterDate,
                values: [filters.period.start_datetime],
            },
            {
                member: TicketMember.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: [filters.period.end_datetime],
            },
            ...statsFiltersToReportingFilters(
                HelpdeskMessagesStatsFiltersMembers,
                filters
            ),
        ],
    })
}

export const useCustomFieldsTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    customFieldId: string,
    sorting?: OrderDirection
) => {
    return useTimeSeriesPerDimension({
        ...customFieldsTicketCountQueryFactory(
            filters,
            timezone,
            customFieldId,
            sorting
        ),
        timeDimensions: [
            {
                dimension:
                    TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                granularity,
                dateRange: getFilterDateRange(filters),
            },
        ],
        timezone,
    })
}

// Automation add-on
export function useAutomationRateTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries({
        measures: [AutomationBillingEventMeasure.AutomationRate],
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
            ...statsFiltersToReportingFilters(
                AutomationAddonStatsFiltersMembers,
                filters
            ),
            {
                member: AutomationBillingEventMember.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: [filters.period.end_datetime],
            },
        ],
    })
}
export function useAutomatedInteractionTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries({
        measures: [AutomationBillingEventMeasure.AutomatedInteractions],
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
            ...statsFiltersToReportingFilters(
                AutomationAddonStatsFiltersMembers,
                filters
            ),
            {
                member: AutomationBillingEventMember.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: [filters.period.end_datetime],
            },
        ],
    })
}

export function useAutomatedInteractionByEventTypesTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries({
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
            ...statsFiltersToReportingFilters(
                AutomationAddonStatsFiltersMembers,
                filters
            ),
            {
                member: AutomationBillingEventMember.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: [filters.period.end_datetime],
            },
        ],
    })
}
