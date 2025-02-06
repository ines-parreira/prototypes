import {getAiAgentCoverageRate} from 'hooks/reporting/automate/automateStatsCalculatedTrends'
import {CUSTOM_FIELD_AI_AGENT_HANDOVER} from 'hooks/reporting/automate/types'
import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {ticketsCreatedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {customFieldsTicketFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters, StatType} from 'models/stat/types'
import {useCustomFieldOutcome} from 'pages/aiAgent/Overview/hooks/useCustomFieldOutcome'
import {KpiMetric} from 'pages/aiAgent/Overview/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useAutomationRate = (
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

    const aiAgentAutomatedTickets = useMultipleMetricsTrends(
        customFieldsTicketFactory(filters, timezone, customField, {
            member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
            operator: ReportingFilterOperator.NotContains,
            values: [CUSTOM_FIELD_AI_AGENT_HANDOVER],
        }),
        customFieldsTicketFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone,
            customField,
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                operator: ReportingFilterOperator.NotContains,
                values: [CUSTOM_FIELD_AI_AGENT_HANDOVER],
            }
        )
    )

    const result = getAiAgentCoverageRate({
        isFetching: allTickets.isFetching || aiAgentAutomatedTickets.isFetching,
        isError: allTickets.isError || aiAgentAutomatedTickets.isError,
        aiAgentTickets:
            aiAgentAutomatedTickets.data?.[
                TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
            ],
        allTickets: allTickets.data?.[TicketMeasure.TicketCount],
    })

    return {
        title: 'Automation Rate',
        hint: 'Automated interactions as a percent of all customer interactions.',
        metricType: StatType.Percent,
        isLoading: result.isFetching,
        ...result.data,
    }
}
