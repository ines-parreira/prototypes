import {
    useCustomFieldsForProductTimeSeries,
    useCustomFieldsTimeSeries,
} from 'hooks/reporting/useCustomFieldsTimeSeries'
import { TicketTimeReference } from 'models/stat/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

const AMOUNT_OF_INTENTS_TO_SHOW = 5

export const useAIIntentsTimeSeries = () => {
    const { intentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return useCustomFieldsTimeSeries({
        selectedCustomFieldId: intentCustomFieldId,
        ticketFieldsTicketTimeReference: TicketTimeReference.CreatedAt,
        topAmount: AMOUNT_OF_INTENTS_TO_SHOW,
        datasetVisibilityItems: AMOUNT_OF_INTENTS_TO_SHOW,
    })
}

export const useAIIntentsForProductTimeSeries = (productId: string) => {
    const { intentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return useCustomFieldsForProductTimeSeries({
        selectedCustomFieldId: intentCustomFieldId,
        topAmount: AMOUNT_OF_INTENTS_TO_SHOW,
        datasetVisibilityItems: AMOUNT_OF_INTENTS_TO_SHOW,
        productId,
    })
}
