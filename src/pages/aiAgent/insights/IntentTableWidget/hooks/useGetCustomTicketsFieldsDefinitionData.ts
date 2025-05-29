import { AI_MANAGED_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { activeParams } from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'

export const TICKET_FIELD_ID_NOT_AVAILABLE = -1

export const useGetCustomTicketsFieldsDefinitionData = (): {
    outcomeCustomFieldId: number
    intentCustomFieldId: number
    sentimentCustomFieldId: number | null
} => {
    const { data: { data: activeFields = [] } = {} } =
        useCustomFieldDefinitions(activeParams)

    const outcomeCustomField = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_OUTCOME,
    )

    const intentCustomField = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_INTENT,
    )

    const sentimentCustomField = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.MANAGED_SENTIMENT,
    )

    return {
        outcomeCustomFieldId:
            outcomeCustomField?.id || TICKET_FIELD_ID_NOT_AVAILABLE,
        intentCustomFieldId:
            intentCustomField?.id || TICKET_FIELD_ID_NOT_AVAILABLE,
        sentimentCustomFieldId: sentimentCustomField?.id || null,
    }
}
