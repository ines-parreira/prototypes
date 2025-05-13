import {
    fetchTicketHandleTimeTrend,
    useTicketHandleTimeTrend,
} from 'hooks/reporting/metricTrends'
import { StatsFilters } from 'models/stat/types'
import {
    fetchSuccessRateTrend,
    useSuccessRateTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useSuccessRateTrend'

import { fetchGenericTrend, useGenericTrend } from './useGenericTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from './useTotalNumberOfSalesConversationsTrend'

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
