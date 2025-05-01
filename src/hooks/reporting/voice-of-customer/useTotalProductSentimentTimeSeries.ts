import { useCustomFieldsTimeSeries } from 'hooks/reporting/useCustomFieldsTimeSeries'
import { TicketTimeReference } from 'models/stat/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

const AMOUNT_OF_SENTIMENTS_TO_SHOW = 2

export const useTotalProductSentimentTimeSeries = () => {
    const { sentimentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return useCustomFieldsTimeSeries({
        selectedCustomFieldId: sentimentCustomFieldId,
        ticketFieldsTicketTimeReference: TicketTimeReference.CreatedAt,
        topAmount: AMOUNT_OF_SENTIMENTS_TO_SHOW,
        datasetVisibilityItems: AMOUNT_OF_SENTIMENTS_TO_SHOW,
    })
}
