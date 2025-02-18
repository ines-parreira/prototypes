import {getAiAgentCoverageRate} from 'hooks/reporting/automate/automateStatsCalculatedTrends'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {StatsFilters, StatType} from 'models/stat/types'
import {useAiAgentTicketNoHandover} from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentTicketNoHandover'
import {useAllTickets} from 'pages/aiAgent/Overview/hooks/kpis/useAllTickets'
import {KpiMetric} from 'pages/aiAgent/Overview/types'

export const useAutomationRate = (
    filters: StatsFilters,
    timezone: string
): KpiMetric => {
    const allTickets = useAllTickets(filters, timezone)
    const aiAgentTicketNoHandover = useAiAgentTicketNoHandover(
        filters,
        timezone
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
        title: 'Automation Rate',
        hint: 'Automated interactions as a percent of all customer interactions.',
        metricType: StatType.Number,
        metricFormat: 'decimal-to-percent',
        isLoading: result.isFetching,
        ...result.data,
    }
}
