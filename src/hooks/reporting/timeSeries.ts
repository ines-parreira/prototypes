import {TicketMessageSourceType} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
    ReportingFilter,
    ReportingFilterOperator,
    ReportingGranularity,
    TicketDimension,
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    formatReportingQueryDate,
    HelpdeskMessagesStatsFiltersMembers,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

import useTimeSeries, {TimeSeriesQuery} from './useTimeSeries'

export const ticketsCreatedQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery => {
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
            member: TicketMember.FirstHelpdeskMessageUserId,
            operator: ReportingFilterOperator.Equals,
            values: agents.map((agent) => agent.toString()),
        })
    }

    return {
        measures: [TicketMeasure.TicketCount],
        dimensions: [],
        segments: agents?.length ? [TicketSegment.TicketCreatedByAgent] : [],
        timeDimensions: [
            {
                dimension: TicketDimension.CreatedDatetime,
                granularity,
                dateRange: [
                    formatReportingQueryDate(
                        statsFilters.period.start_datetime
                    ),
                    formatReportingQueryDate(statsFilters.period.end_datetime),
                ],
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
                dateRange: [
                    formatReportingQueryDate(filters.period.start_datetime),
                    formatReportingQueryDate(filters.period.end_datetime),
                ],
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
                dateRange: [
                    formatReportingQueryDate(filters.period.start_datetime),
                    formatReportingQueryDate(filters.period.end_datetime),
                ],
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
                dateRange: [
                    formatReportingQueryDate(filters.period.start_datetime),
                    formatReportingQueryDate(filters.period.end_datetime),
                ],
            },
        ],
        timezone,
        filters: [
            ...statsFiltersToReportingFilters(
                HelpdeskMessagesStatsFiltersMembers,
                filters
            ),
            {
                member: TicketMember.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: [filters.period.end_datetime],
            },
        ],
    })
}
