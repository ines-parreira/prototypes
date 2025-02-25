import { CUSTOM_FIELD_AI_AGENT_HANDOVER } from 'hooks/reporting/automate/types'
import { useMultipleMetricsTrends } from 'hooks/reporting/useMultipleMetricsTrend'
import { TicketCustomFieldsMember } from 'models/reporting/cubes/TicketCustomFieldsCube'
import { customFieldsTicketFactory } from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { useCustomFieldOutcome } from 'pages/aiAgent/Overview/hooks/useCustomFieldOutcome'
import { getPreviousPeriod } from 'utils/reporting'

/**
 * AI Agent ticket that have 0 human interaction.
 */
export const useAiAgentTicketNoHandover = (
    filters: StatsFilters,
    timezone: string,
) => {
    const customField = useCustomFieldOutcome()
    return useMultipleMetricsTrends(
        customFieldsTicketFactory(filters, timezone, customField, {
            member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
            operator: ReportingFilterOperator.NotContains,
            values: [CUSTOM_FIELD_AI_AGENT_HANDOVER],
        }),
        customFieldsTicketFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            customField,
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                operator: ReportingFilterOperator.NotContains,
                values: [CUSTOM_FIELD_AI_AGENT_HANDOVER],
            },
        ),
    )
}
