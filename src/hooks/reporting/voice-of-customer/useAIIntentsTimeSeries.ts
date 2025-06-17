import {
    useCustomFieldsForProductTimeSeries,
    useCustomFieldsTimeSeries,
} from 'hooks/reporting/useCustomFieldsTimeSeries'
import { TicketTimeReference } from 'models/stat/types'

const AMOUNT_OF_INTENTS_TO_SHOW = 5

export const useAIIntentsTimeSeries = (intentCustomFieldId: number) => {
    return useCustomFieldsTimeSeries({
        selectedCustomFieldId: intentCustomFieldId,
        ticketFieldsTicketTimeReference: TicketTimeReference.CreatedAt,
        topAmount: AMOUNT_OF_INTENTS_TO_SHOW,
        datasetVisibilityItems: AMOUNT_OF_INTENTS_TO_SHOW,
    })
}

export const useAIIntentsForProductTimeSeries = (
    productId: string,
    intentCustomFieldId: number,
) => {
    return useCustomFieldsForProductTimeSeries({
        selectedCustomFieldId: intentCustomFieldId,
        topAmount: AMOUNT_OF_INTENTS_TO_SHOW,
        datasetVisibilityItems: AMOUNT_OF_INTENTS_TO_SHOW,
        productId,
    })
}
