import {getAiAgentCoverageRate} from 'hooks/reporting/automate/automateStatsCalculatedTrends'
import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {ticketsCreatedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {customFieldsTicketTotalCountQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {StatsFilters, StatType} from 'models/stat/types'
import {useCustomFieldOutcome} from 'pages/aiAgent/Overview/hooks/useCustomFieldOutcome'
import {KpiMetric} from 'pages/aiAgent/Overview/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useCoverageRate = (
    filters: StatsFilters,
    timezone: string
): KpiMetric => {
    const customField = useCustomFieldOutcome()

    const allTickets = useMultipleMetricsTrends(
        ticketsCreatedQueryFactory(filters, timezone),
        ticketsCreatedQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

    const aiAgentTickets = useMultipleMetricsTrends(
        customFieldsTicketTotalCountQueryFactory(
            filters,
            timezone,
            customField
        ),
        customFieldsTicketTotalCountQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone,
            customField
        )
    )

    const result = getAiAgentCoverageRate({
        isFetching: allTickets.isFetching || aiAgentTickets.isFetching,
        isError: allTickets.isError || aiAgentTickets.isError,
        aiAgentTickets:
            aiAgentTickets.data?.[
                TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
            ],
        allTickets: allTickets.data?.[TicketMeasure.TicketCount],
    })

    return {
        title: 'Coverage Rate',
        hint: 'Percentage of tickets that AI Agent attempted to respond to.',
        metricType: StatType.Percent,
        isLoading: result.isFetching,
        ...result.data,
    }
}
