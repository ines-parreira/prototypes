import {firstResponseTimeWithAutomateFeaturesQueryFactory} from 'models/reporting/queryFactories/support-performance/firstResponseTimeWithAutomateFeaturesQueryFactory'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {closedTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customerSatisfactionQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {medianFirstResponseTimeQueryFactory} from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import {messagesPerTicketQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesPerTicket'
import {messagesSentQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {openTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/openTickets'
import {medianResolutionTimeQueryFactory} from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import {ticketsCreatedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {ticketsRepliedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'
import {resolutionTimeWithAutomateFeaturesQueryFactory} from '../../models/reporting/queryFactories/automate/resolutionTimeWithAutomateFeatures'
import {overallTimeSavedQueryFactory} from '../../models/reporting/queryFactories/automate/overallTimeSaved'
import {automationRateQueryFactory} from '../../models/reporting/queryFactories/automate/automationRate'
import {automatedInteractionsQueryFactory} from '../../models/reporting/queryFactories/automate/automatedInteractions'

export const useCustomerSatisfactionTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        customerSatisfactionQueryFactory(filters, timezone),
        customerSatisfactionQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const useMedianFirstResponseTimeTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        medianFirstResponseTimeQueryFactory(filters, timezone),
        medianFirstResponseTimeQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const useMessagesPerTicketTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        messagesPerTicketQueryFactory(filters, timezone),
        messagesPerTicketQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const useMedianResolutionTimeTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        medianResolutionTimeQueryFactory(filters, timezone),
        medianResolutionTimeQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const useOpenTicketsTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        openTicketsQueryFactory(filters, timezone),
        openTicketsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const useClosedTicketsTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        closedTicketsQueryFactory(filters, timezone),
        closedTicketsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const useTicketsCreatedTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        ticketsCreatedQueryFactory(filters, timezone),
        ticketsCreatedQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const useTicketsRepliedTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        ticketsRepliedQueryFactory(filters, timezone),
        ticketsRepliedQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const useMessagesSentTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        messagesSentQueryFactory(filters, timezone),
        messagesSentQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const useFirstResponseTimeWithAutomationTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        firstResponseTimeWithAutomateFeaturesQueryFactory(filters, timezone),
        firstResponseTimeWithAutomateFeaturesQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const useResolutionTimeWithAutomationTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        resolutionTimeWithAutomateFeaturesQueryFactory(filters, timezone),
        resolutionTimeWithAutomateFeaturesQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const useOverallTimeSavedWithAutomationTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        overallTimeSavedQueryFactory(filters, timezone),
        overallTimeSavedQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const useAutomationRateTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        automationRateQueryFactory(filters, timezone),
        automationRateQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const useAutomatedInteractionsTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        automatedInteractionsQueryFactory(filters, timezone),
        automatedInteractionsQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )
