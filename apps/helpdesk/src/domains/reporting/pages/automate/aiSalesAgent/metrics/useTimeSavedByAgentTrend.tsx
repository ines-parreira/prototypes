import {
    fetchTicketHandleTimeTrend,
    useTicketHandleTimeTrend,
} from 'domains/reporting/hooks/metricTrends'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchGenericTrend,
    useGenericTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend'
import {
    fetchSuccessRateTrend,
    useSuccessRateTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useSuccessRateTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'

const calculateTimeSavedByAgents = (
    numberOfInteractions: number,
    ticketHandleTimeData: number,
    successRateData: number,
) => {
    return (
        (numberOfInteractions ?? 0) *
        (successRateData ?? 0) *
        (ticketHandleTimeData ?? 0)
    )
}
const useTimeSavedByAgentTrend = (filters: StatsFilters, timezone: string) =>
    useGenericTrend(
        {
            totalNumberOfAgentSalesConverations:
                useTotalNumberOfSalesConversationsTrend(filters, timezone),
            ticketHandleTime: useTicketHandleTimeTrend(filters, timezone),
            successRate: useSuccessRateTrend(filters, timezone),
        },
        ({
            totalNumberOfAgentSalesConverations,
            ticketHandleTime,
            successRate,
        }) =>
            calculateTimeSavedByAgents(
                totalNumberOfAgentSalesConverations,
                ticketHandleTime,
                successRate,
            ),
    )

const fetchTimeSavedByAgentTrend = (filters: StatsFilters, timezone: string) =>
    fetchGenericTrend(
        {
            totalNumberOfAgentSalesConverations:
                fetchTotalNumberOfSalesConversationsTrend(filters, timezone),
            ticketHandleTime: fetchTicketHandleTimeTrend(filters, timezone),
            successRate: fetchSuccessRateTrend(filters, timezone),
        },
        ({
            totalNumberOfAgentSalesConverations,
            ticketHandleTime,
            successRate,
        }) =>
            calculateTimeSavedByAgents(
                totalNumberOfAgentSalesConverations,
                ticketHandleTime,
                successRate,
            ),
    )

export { useTimeSavedByAgentTrend, fetchTimeSavedByAgentTrend }
