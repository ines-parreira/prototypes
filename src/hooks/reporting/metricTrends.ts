import {firstResponseTimeWithAutomationQueryFactory} from 'models/reporting/queryFactories/support-performance/firstResponseTimeWithAutomationQueryFactory'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {automatedInteractionsQueryFactory} from 'models/reporting/queryFactories/automation/automatedInteractions'
import {automationRateQueryFactory} from 'models/reporting/queryFactories/automation/automationRate'
import {closedTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customerSatisfactionQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {firstResponseTimeQueryFactory} from 'models/reporting/queryFactories/support-performance/firstResponseTime'
import {messagesPerTicketQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesPerTicket'
import {messagesSentQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {openTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/openTickets'
import {overallTimeSavedWithAutomationQueryFactory} from 'models/reporting/queryFactories/automation/overallTimeSavedWithAutomation'
import {resolutionTimeQueryFactory} from 'models/reporting/queryFactories/support-performance/resolutionTime'
import {resolutionTimeWithAutomationQueryFactory} from 'models/reporting/queryFactories/automation/resolutionTimeWithAutomation'
import {ticketsCreatedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {ticketsRepliedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

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

export const useFirstResponseTimeTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        firstResponseTimeQueryFactory(filters, timezone),
        firstResponseTimeQueryFactory(
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

export const useResolutionTimeTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        resolutionTimeQueryFactory(filters, timezone),
        resolutionTimeQueryFactory(
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
        firstResponseTimeWithAutomationQueryFactory(filters, timezone),
        firstResponseTimeWithAutomationQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const useResolutionTimeWithAutomationTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        resolutionTimeWithAutomationQueryFactory(filters, timezone),
        resolutionTimeWithAutomationQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const useOverallTimeSavedWithAutomationTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        overallTimeSavedWithAutomationQueryFactory(filters, timezone),
        overallTimeSavedWithAutomationQueryFactory(
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
