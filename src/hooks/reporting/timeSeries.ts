import {OrderDirection} from 'models/api/types'

import {closedTicketsTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customFieldsTicketCountTimeSeriesQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {messagesSentTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {ticketsCreatedTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {ticketsRepliedTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

import {
    interactionsByEventTypeTimeSeriesQueryFactory,
    interactionsTimeSeriesQueryFactory,
    billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/automate_v2/timeseries'
import {
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import {tagsTicketCountTimeSeriesFactory} from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'

export function useTicketsCreatedTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries(
        ticketsCreatedTimeSeriesQueryFactory(filters, timezone, granularity)
    )
}

export function useTicketsClosedTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries(
        closedTicketsTimeSeriesQueryFactory(filters, timezone, granularity)
    )
}

export function useTicketsRepliedTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries(
        ticketsRepliedTimeSeriesQueryFactory(filters, timezone, granularity)
    )
}

export function useMessagesSentTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries(
        messagesSentTimeSeriesQueryFactory(filters, timezone, granularity)
    )
}

export const useCustomFieldsTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    customFieldId: string,
    sorting?: OrderDirection
) => {
    return useTimeSeriesPerDimension(
        customFieldsTicketCountTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
            customFieldId,
            sorting
        )
    )
}

export const useTagsTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection
) => {
    return useTimeSeriesPerDimension(
        tagsTicketCountTimeSeriesFactory(
            filters,
            timezone,
            granularity,
            sorting
        )
    )
}

// Automate V2
export function useAutomationDatasetTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries(
        interactionsTimeSeriesQueryFactory(filters, timezone, granularity)
    )
}

export function useAutomationDatasetByEventTypeTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeriesPerDimension(
        interactionsByEventTypeTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity
        )
    )
}

export function useBillableTicketDatasetTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    aiAgentUserId?: string
) {
    return useTimeSeries(
        billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
            aiAgentUserId
        )
    )
}
