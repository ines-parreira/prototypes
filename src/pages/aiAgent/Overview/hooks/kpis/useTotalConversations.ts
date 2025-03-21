import { useMultipleMetricsTrends } from 'hooks/reporting/useMultipleMetricsTrend'
import { TicketCustomFieldsMeasure } from 'models/reporting/cubes/TicketCustomFieldsCube'
import { customFieldsTicketTotalCountQueryFactory } from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { StatsFilters } from 'models/stat/types'
import { useCustomFieldOutcome } from 'pages/aiAgent/Overview/hooks/useCustomFieldOutcome'
import { KpiMetric } from 'pages/aiAgent/Overview/types'
import { getPreviousPeriod } from 'utils/reporting'

export const useTotalConversations = (
    filters: StatsFilters,
    timezone: string,
): KpiMetric => {
    const customField = useCustomFieldOutcome()

    const result = useMultipleMetricsTrends(
        customFieldsTicketTotalCountQueryFactory({
            filters,
            timezone,
            customFieldId: customField,
        }),
        customFieldsTicketTotalCountQueryFactory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
            customFieldId: customField,
        }),
    )

    return {
        title: 'Total AI Sales Conversations',
        hint: {
            title: 'The total number of conversations handled or influenced by the AI Agent for Sales.',
        },
        metricFormat: 'decimal',
        isLoading: result.isFetching,
        'data-candu-id': 'ai-agent-overview-kpi-total-conversations',
        ...result.data?.[
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        ],
    }
}
