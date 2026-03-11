import { listCustomFields } from '@gorgias/helpdesk-client'

import { AI_MANAGED_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { activeParams } from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldSelect'

export const TICKET_FIELD_ID_NOT_AVAILABLE = -1

export const useGetCustomTicketsFieldsDefinitionData = (): {
    outcomeCustomFieldId: number
    intentCustomFieldId: number
    sentimentCustomFieldId: number | null
    isLoading: boolean
} => {
    const { data: { data: activeFields = [] } = {}, isLoading } =
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
        isLoading,
    }
}

export const fetchCustomTicketsFieldsDefinitionData = async (): Promise<{
    outcomeCustomFieldId: number
    intentCustomFieldId: number
    sentimentCustomFieldId: number | null
}> => {
    // Helper to be used in fetchMetric for downloading data
    const response = await listCustomFields(activeParams)
    const fields = response.data.data ?? []

    const outcomeCustomField = fields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_OUTCOME,
    )

    const intentCustomField = fields.find(
        (field) => field.managed_type === AI_MANAGED_TYPES.AI_INTENT,
    )

    const sentimentCustomField = fields.find(
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
