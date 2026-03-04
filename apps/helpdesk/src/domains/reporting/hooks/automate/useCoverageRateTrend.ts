import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { customFieldsTicketTotalCountQueryFactory } from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchGenericTrend,
    useGenericTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend'
import safeDivide from 'domains/reporting/pages/automate/aiSalesAgent/util/safeDivide'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchCustomTicketsFieldsDefinitionData,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import {
    fetchAllTickets,
    useAllTickets,
} from 'pages/aiAgent/Overview/hooks/kpis/useAllTickets'

export const useCoverageRateTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const { outcomeCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return useGenericTrend(
        {
            allTickets: useAllTickets(filters, timezone),
            aiAgentTickets: useMetricTrend(
                customFieldsTicketTotalCountQueryFactory({
                    filters,
                    timezone,
                    customFieldId: outcomeCustomFieldId,
                }),
                customFieldsTicketTotalCountQueryFactory({
                    filters: {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                    customFieldId: outcomeCustomFieldId,
                }),
            ),
        },
        ({ allTickets, aiAgentTickets }) =>
            safeDivide(aiAgentTickets, allTickets),
    )
}

export const fetchCoverageRateTrend = async (
    filters: StatsFilters,
    timezone: string,
) => {
    const { outcomeCustomFieldId } =
        await fetchCustomTicketsFieldsDefinitionData()

    return fetchGenericTrend(
        {
            allTickets: fetchAllTickets(filters, timezone),
            aiAgentTickets: fetchMetricTrend(
                customFieldsTicketTotalCountQueryFactory({
                    filters,
                    timezone,
                    customFieldId: outcomeCustomFieldId,
                }),
                customFieldsTicketTotalCountQueryFactory({
                    filters: {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                    customFieldId: outcomeCustomFieldId,
                }),
            ),
        },
        ({ allTickets, aiAgentTickets }) =>
            safeDivide(aiAgentTickets, allTickets),
    )
}
