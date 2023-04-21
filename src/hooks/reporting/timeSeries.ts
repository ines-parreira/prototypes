import {
    MessageStateDimension,
    MessageStateMeasure,
    ReportingFilterOperator,
    ReportingGranularity,
    TicketStateDimension,
    TicketStateMeasure,
    TicketStateMember,
    TicketStateSegment,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    formatReportingQueryDate,
    MessageStateStatsFiltersMembers,
    statsFiltersToReportingFilters,
    TicketStateStatsFiltersMembers,
} from 'utils/reporting'

import useTimeSeries from './useTimeSeries'

export function useTicketsCreatedTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries({
        measures: [TicketStateMeasure.TicketCount],
        dimensions: [],
        timeDimensions: [
            {
                dimension: TicketStateDimension.CreatedDatetime,
                granularity,
                dateRange: [
                    formatReportingQueryDate(filters.period.start_datetime),
                    formatReportingQueryDate(filters.period.end_datetime),
                ],
            },
        ],
        timezone,
        order: [[TicketStateDimension.CreatedDatetime, 'asc']],
        segments: [
            TicketStateSegment.ConversationStarted,
            TicketStateSegment.ClosedTickets,
        ],
        filters: [
            ...statsFiltersToReportingFilters(
                TicketStateStatsFiltersMembers,
                filters
            ),
            {
                member: TicketStateMember.IsTrashed,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
            {
                member: TicketStateMember.IsSpam,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
        ],
    })
}

export function useTicketsClosedTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries({
        measures: [TicketStateMeasure.TicketCount],
        timeDimensions: [
            {
                dimension: TicketStateDimension.ClosedDatetime,
                granularity,
                dateRange: [
                    formatReportingQueryDate(filters.period.start_datetime),
                    formatReportingQueryDate(filters.period.end_datetime),
                ],
            },
        ],
        timezone,
        dimensions: [],
        order: [[TicketStateDimension.ClosedDatetime, 'asc']],
        segments: [TicketStateSegment.ClosedTickets],
        filters: [
            ...statsFiltersToReportingFilters(
                TicketStateStatsFiltersMembers,
                filters
            ),
            {
                member: TicketStateMember.IsTrashed,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
            {
                member: TicketStateMember.IsSpam,
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
        measures: [MessageStateMeasure.TicketCount],
        timeDimensions: [
            {
                dimension: MessageStateDimension.PeriodStart,
                granularity,
                dateRange: [
                    formatReportingQueryDate(filters.period.start_datetime),
                    formatReportingQueryDate(filters.period.end_datetime),
                ],
            },
        ],
        timezone,
        dimensions: [],
        order: [[MessageStateDimension.PeriodStart, 'asc']],
        filters: statsFiltersToReportingFilters(
            MessageStateStatsFiltersMembers,
            filters
        ),
    })
}

export function useMessagesSentTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries({
        measures: [MessageStateMeasure.MessageCount],
        timeDimensions: [
            {
                dimension: MessageStateDimension.PeriodStart,
                granularity,
                dateRange: [
                    formatReportingQueryDate(filters.period.start_datetime),
                    formatReportingQueryDate(filters.period.end_datetime),
                ],
            },
        ],
        timezone,
        dimensions: [],
        order: [[MessageStateDimension.PeriodStart, 'asc']],
        filters: statsFiltersToReportingFilters(
            MessageStateStatsFiltersMembers,
            filters
        ),
    })
}
