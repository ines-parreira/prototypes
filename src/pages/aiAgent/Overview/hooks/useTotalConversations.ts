import {AI_MANAGED_TYPES} from 'custom-fields/constants'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {customFieldsTicketCountQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {StatsFilters, StatType} from 'models/stat/types'
import {KpiMetric} from 'pages/aiAgent/Overview/types'
import {activeParams} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import {getPreviousPeriod} from 'utils/reporting'

export const useTotalConversations = (
    filters: StatsFilters,
    timezone: string
): KpiMetric => {
    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)

    const customFieldOutcome = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_OUTCOME
    )

    const customField = String(customFieldOutcome?.id || -1)

    const result = useMultipleMetricsTrends(
        customFieldsTicketCountQueryFactory(filters, timezone, customField),
        customFieldsTicketCountQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
            customField
        )
    )

    return {
        title: 'Total Conversations',
        hint: 'The total number of conversations handled or influenced by the AI Agent for Sales.',
        metricType: StatType.Number,
        isLoading: result.isFetching,
        ...result.data?.[
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        ],
    }
}
