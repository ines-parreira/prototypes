import { TicketCustomFieldsMeasure } from 'models/reporting/cubes/TicketCustomFieldsCube'
import { StatsFilters } from 'models/stat/types'
import { useAiAgentTicketNoHandover } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentTicketNoHandover'
import { KpiMetric } from 'pages/aiAgent/Overview/types'

export const useAutomatedInteractions = (
    filters: StatsFilters,
    timezone: string,
): KpiMetric => {
    const aiAgentTicketNoHandover = useAiAgentTicketNoHandover(
        filters,
        timezone,
    )

    return {
        title: 'Automated Interactions',
        hint: {
            title: 'Total of fully automated AI Agent interactions solved without any agent intervention.',
        },
        metricFormat: 'decimal',
        isLoading: aiAgentTicketNoHandover.isFetching,
        'data-candu-id': 'ai-agent-overview-kpi-automated-interactions',
        ...aiAgentTicketNoHandover.data?.[
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        ],
    }
}
