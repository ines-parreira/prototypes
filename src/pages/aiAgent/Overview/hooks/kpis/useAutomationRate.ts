import { getAiAgentCoverageRate } from 'hooks/reporting/automate/automateStatsCalculatedTrends'
import { TicketMeasure } from 'models/reporting/cubes/TicketCube'
import { TicketCustomFieldsMeasure } from 'models/reporting/cubes/TicketCustomFieldsCube'
import { StatsFilters, StatType } from 'models/stat/types'
import { useAiAgentTicketNoHandover } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentTicketNoHandover'
import { useAllTickets } from 'pages/aiAgent/Overview/hooks/kpis/useAllTickets'
import { KpiMetric } from 'pages/aiAgent/Overview/types'

export const useAutomationRate = (
    filters: StatsFilters,
    timezone: string,
): KpiMetric => {
    const allTickets = useAllTickets(filters, timezone)
    const aiAgentTicketNoHandover = useAiAgentTicketNoHandover(
        filters,
        timezone,
    )

    const result = getAiAgentCoverageRate({
        isFetching: allTickets.isFetching || aiAgentTicketNoHandover.isFetching,
        isError: allTickets.isError || aiAgentTicketNoHandover.isError,
        aiAgentTickets:
            aiAgentTicketNoHandover.data?.[
                TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
            ],
        allTickets: allTickets.data?.[TicketMeasure.TicketCount],
    })

    return {
        title: 'AI Agent Automation Rate',
        hint: 'Automated interactions from AI Agent as a percent of all customer interactions.',
        metricType: StatType.Number,
        metricFormat: 'decimal-to-percent',
        isLoading: result.isFetching,
        'data-candu-id': 'ai-agent-overview-kpi-automation-rate',
        ...result.data,
    }
}
