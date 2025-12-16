import { getAiAgentCoverageRate } from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import { TicketCustomFieldsMeasure } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useAiAgentTicketNoHandover } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentTicketNoHandover'
import { useAllTickets } from 'pages/aiAgent/Overview/hooks/kpis/useAllTickets'
import type { KpiMetric } from 'pages/aiAgent/Overview/types'

export const useAiAgentAutomationRate = (
    filters: StatsFilters,
    timezone: string,
    integrationIds?: string[],
): KpiMetric => {
    const allTickets = useAllTickets(filters, timezone)
    const aiAgentTicketNoHandover = useAiAgentTicketNoHandover(
        filters,
        timezone,
        integrationIds,
    )

    const result = getAiAgentCoverageRate({
        isFetching: allTickets.isFetching || aiAgentTicketNoHandover.isFetching,
        isError: allTickets.isError || aiAgentTicketNoHandover.isError,
        aiAgentTickets:
            aiAgentTicketNoHandover.data?.[
                TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
            ],
        allTickets: allTickets.data ?? { value: null, prevValue: null },
    })

    return {
        title: 'AI Agent Automation Rate',
        hint: {
            title: 'Automated interactions from AI Agent as a percent of all customer interactions.',
        },
        metricFormat: 'decimal-to-percent-precision-1',
        isLoading: result.isFetching,
        'data-candu-id': 'ai-agent-overview-kpi-automation-rate',
        ...result.data,
    }
}
