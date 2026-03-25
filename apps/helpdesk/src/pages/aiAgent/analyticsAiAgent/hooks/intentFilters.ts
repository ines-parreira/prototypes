import type {
    ApiStatsFilters,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { TICKET_FIELD_ID_NOT_AVAILABLE } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

export const buildIntentFilters = (
    statsFilters: StatsFilters,
    intentCustomFieldId: number,
): ApiStatsFilters => ({
    ...statsFilters,
    ...(intentCustomFieldId !== TICKET_FIELD_ID_NOT_AVAILABLE && {
        customFieldId: {
            operator: LogicalOperatorEnum.ONE_OF,
            values: [intentCustomFieldId],
        },
    }),
})
