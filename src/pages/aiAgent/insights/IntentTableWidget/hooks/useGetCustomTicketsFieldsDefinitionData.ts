import { AI_MANAGED_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { activeParams } from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'

export const useGetCustomTicketsFieldsDefinitionData = () => {
    const { data: { data: activeFields = [] } = {} } =
        useCustomFieldDefinitions(activeParams)

    const outcomeCustomField = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_OUTCOME,
    )

    const intentCustomField = activeFields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_INTENT,
    )

    return {
        outcomeCustomFieldId: outcomeCustomField?.id || -1,
        intentCustomFieldId: intentCustomField?.id || -1,
    }
}
