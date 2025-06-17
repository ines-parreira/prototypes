import {
    Entity,
    useTicketTimeReference,
} from 'hooks/reporting/ticket-insights/useTicketTimeReference'
import { useCustomFieldsTimeSeries } from 'hooks/reporting/useCustomFieldsTimeSeries'

export const useTicketsFieldTimeSeries = (selectedCustomFieldId: number) => {
    const [ticketFieldsTicketTimeReference] = useTicketTimeReference(
        Entity.TicketField,
    )

    return useCustomFieldsTimeSeries({
        selectedCustomFieldId: selectedCustomFieldId,
        ticketFieldsTicketTimeReference,
    })
}
