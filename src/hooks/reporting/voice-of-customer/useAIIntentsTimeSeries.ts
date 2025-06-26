import {
    useAIIntentCustomFieldsTimeSeries,
    useCustomFieldsForProductTimeSeries,
} from 'hooks/reporting/useCustomFieldsTimeSeries'
import { TicketTimeReference } from 'models/stat/types'
import { TOP_INTENTS_PER_PAGE } from 'pages/stats/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'

export const AMOUNT_OF_PRODUCTS_TO_SHOW = 5
export const AMOUNT_OF_SELECTED_INTENTS = 3

export const useAIIntentsTimeSeries = (intentCustomFieldId: number) => {
    return useAIIntentCustomFieldsTimeSeries({
        selectedCustomFieldId: intentCustomFieldId,
        ticketFieldsTicketTimeReference: TicketTimeReference.CreatedAt,
        topAmount: TOP_INTENTS_PER_PAGE,
        datasetVisibilityItems: AMOUNT_OF_SELECTED_INTENTS,
    })
}

export const useAIIntentsForProductTimeSeries = (
    productId: string,
    intentCustomFieldId: number,
) => {
    return useCustomFieldsForProductTimeSeries({
        selectedCustomFieldId: intentCustomFieldId,
        topAmount: AMOUNT_OF_PRODUCTS_TO_SHOW,
        datasetVisibilityItems: AMOUNT_OF_PRODUCTS_TO_SHOW,
        productId,
    })
}
