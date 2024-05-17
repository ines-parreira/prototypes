import {OrderDirection} from 'models/api/types'

import {closedTicketsTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customFieldsTicketCountTimeSeriesQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {messagesSentTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {ticketsCreatedTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {ticketsRepliedTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

import {automatedInteractionsTimeSeriesQueryFactory} from 'models/reporting/queryFactories/automate/automatedInteractions'
import {automatedInteractionsByEventTypeQueryFactory} from 'models/reporting/queryFactories/automate/automatedInteractionsByEventType'
import {automationRateTimeSeriesQueryFactory} from 'models/reporting/queryFactories/automate/automationRate'
import {
    interactionsByEventTypeTimeSeriesQueryFactory,
    interactionsTimeSeriesQueryFactory,
    billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/automate_v2/timeseries'
import {
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'

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

// Automate
export function useAutomationRateTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries(
        automationRateTimeSeriesQueryFactory(filters, timezone, granularity)
    )
}

export function useAutomatedInteractionTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries(
        automatedInteractionsTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity
        )
    )
}

export function useAutomatedInteractionByEventTypesTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries(
        automatedInteractionsByEventTypeQueryFactory(
            filters,
            timezone,
            granularity
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
