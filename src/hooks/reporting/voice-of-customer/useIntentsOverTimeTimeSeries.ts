import { useCustomFieldsTimeSeries } from 'hooks/reporting/useCustomFieldsTimeSeries'
import { TicketTimeReference } from 'models/stat/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

export const useIntentsOverTimeTimeSeries = () => {
    const { intentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return useCustomFieldsTimeSeries({
        selectedCustomFieldId: intentCustomFieldId,
        ticketFieldsTicketTimeReference: TicketTimeReference.CreatedAt,
        topAmount: 5,
    })
}
