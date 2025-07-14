import { CUSTOM_FIELD_AI_AGENT_CLOSE } from 'domains/reporting/hooks/automate/types'
import { useMultipleMetricsTrends } from 'domains/reporting/hooks/useMultipleMetricsTrend'
import { TicketCustomFieldsMember } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { customFieldsTicketTotalCountQueryFactory } from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

/**
 * AI Agent ticket that have 0 human interaction.
 */
export const useAiAgentTicketNoHandover = (
    filters: StatsFilters,
    timezone: string,
) => {
    const { outcomeCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()
    const additionalFilters = [
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
            operator: ReportingFilterOperator.Contains,
            values: [CUSTOM_FIELD_AI_AGENT_CLOSE],
        },
    ]

    return useMultipleMetricsTrends(
        customFieldsTicketTotalCountQueryFactory({
            filters,
            timezone,
            customFieldId: outcomeCustomFieldId,
            additionalFilters,
        }),
        customFieldsTicketTotalCountQueryFactory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            customFieldId: outcomeCustomFieldId,
            additionalFilters,
        }),
    )
}
